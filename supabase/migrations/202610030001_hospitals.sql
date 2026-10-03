-- Apply AFTER supabase_schema.sql. Existing unassigned rows remain quarantined.
BEGIN;
CREATE TABLE public.hospitals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(trim(name)) > 1),
 code text NOT NULL UNIQUE CHECK(code ~ '^[a-z0-9-]{3,40}$'), address text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
 logo_url text NOT NULL DEFAULT '', setup_completed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.hospital_memberships (
 hospital_id uuid NOT NULL REFERENCES public.hospitals(id), user_id uuid NOT NULL REFERENCES auth.users(id),
 role text NOT NULL CHECK(role IN ('Admin','Doctor','Nurse')), is_owner boolean NOT NULL DEFAULT false,
 is_active boolean NOT NULL DEFAULT true, PRIMARY KEY(hospital_id,user_id)
);
CREATE TABLE public.hospital_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hospital_id uuid NOT NULL REFERENCES public.hospitals(id),
 email text NOT NULL, role text NOT NULL CHECK(role IN ('Admin','Doctor','Nurse')),
 token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(), expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
 accepted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.doctors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hospital_id uuid NOT NULL REFERENCES public.hospitals(id),
 name text NOT NULL, specialty text NOT NULL, department text NOT NULL DEFAULT '', is_active boolean NOT NULL DEFAULT true
);
CREATE FUNCTION public.hospital_role(hospital uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM hospital_memberships WHERE hospital_id=hospital AND user_id=auth.uid() AND is_active $$;
REVOKE ALL ON FUNCTION public.hospital_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hospital_role(uuid) TO authenticated;

ALTER TABLE public.wards ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.beds ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.patients ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.admissions ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.bed_transfers ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.discharges ADD COLUMN hospital_id uuid REFERENCES public.hospitals(id);
ALTER TABLE public.wards DROP CONSTRAINT wards_code_key;
ALTER TABLE public.patients DROP CONSTRAINT patients_uhid_key;
ALTER TABLE public.admissions DROP CONSTRAINT admissions_admission_number_key;
ALTER TABLE public.wards ADD UNIQUE(hospital_id,code), ADD UNIQUE(hospital_id,id);
ALTER TABLE public.beds ADD UNIQUE(hospital_id,id), ADD UNIQUE(hospital_id,id,ward_id);
ALTER TABLE public.patients ADD UNIQUE(hospital_id,uhid), ADD UNIQUE(hospital_id,id);
ALTER TABLE public.admissions ADD UNIQUE(hospital_id,admission_number), ADD UNIQUE(hospital_id,id);
ALTER TABLE public.beds ADD FOREIGN KEY(hospital_id,ward_id) REFERENCES public.wards(hospital_id,id);
ALTER TABLE public.admissions ADD FOREIGN KEY(hospital_id,patient_id) REFERENCES public.patients(hospital_id,id),
 ADD FOREIGN KEY(hospital_id,bed_id,ward_id) REFERENCES public.beds(hospital_id,id,ward_id);
ALTER TABLE public.bed_transfers ADD FOREIGN KEY(hospital_id,admission_id) REFERENCES public.admissions(hospital_id,id),
 ADD FOREIGN KEY(hospital_id,from_bed_id) REFERENCES public.beds(hospital_id,id),
 ADD FOREIGN KEY(hospital_id,to_bed_id) REFERENCES public.beds(hospital_id,id);
ALTER TABLE public.discharges ADD FOREIGN KEY(hospital_id,admission_id) REFERENCES public.admissions(hospital_id,id);
CREATE UNIQUE INDEX one_active_admission_per_bed ON public.admissions(hospital_id,bed_id) WHERE status IN ('admitted','shifted');
CREATE UNIQUE INDEX one_discharge_per_admission ON public.discharges(admission_id);

DO $$ DECLARE t text; p record; BEGIN
 FOREACH t IN ARRAY ARRAY['wards','beds','patients','admissions','bed_transfers','discharges','doctors'] LOOP
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
   EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
  END LOOP;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
  EXECUTE format('CREATE POLICY hospital_read ON public.%I FOR SELECT TO authenticated USING (public.hospital_role(hospital_id) IS NOT NULL)',t);
  EXECUTE format('CREATE INDEX ON public.%I(hospital_id)',t);
 END LOOP;
END $$;
GRANT INSERT ON public.wards, public.beds, public.doctors TO authenticated;
CREATE POLICY admin_insert ON public.wards FOR INSERT TO authenticated WITH CHECK(public.hospital_role(hospital_id)='Admin');
CREATE POLICY admin_insert ON public.beds FOR INSERT TO authenticated WITH CHECK(public.hospital_role(hospital_id)='Admin' AND status='vacant');
CREATE POLICY admin_insert ON public.doctors FOR INSERT TO authenticated WITH CHECK(public.hospital_role(hospital_id)='Admin');
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hospitals, public.hospital_memberships, public.hospital_invitations FROM anon,authenticated;
GRANT SELECT ON public.hospitals,public.hospital_memberships,public.hospital_invitations TO authenticated;
CREATE POLICY member_read ON public.hospitals FOR SELECT TO authenticated USING(public.hospital_role(id) IS NOT NULL);
CREATE POLICY member_read ON public.hospital_memberships FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.hospital_role(hospital_id)='Admin');
CREATE POLICY admin_read ON public.hospital_invitations FOR SELECT TO authenticated USING(public.hospital_role(hospital_id)='Admin');

CREATE FUNCTION public.create_hospital(details jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h uuid; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 INSERT INTO hospitals(name,code,address,phone) VALUES(trim(details->>'name'),lower(trim(details->>'code')),coalesce(details->>'address',''),coalesce(details->>'phone','')) RETURNING id INTO h;
 INSERT INTO hospital_memberships(hospital_id,user_id,role,is_owner) VALUES(h,auth.uid(),'Admin',true);
 RETURN h;
END $$;
CREATE FUNCTION public.complete_hospital_setup(hospital uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM beds WHERE hospital_id=hospital) THEN RAISE EXCEPTION 'Add at least one ward and bed'; END IF;
 UPDATE hospitals SET setup_completed=true WHERE id=hospital;
END $$;
CREATE FUNCTION public.update_hospital_details(hospital uuid, details jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 UPDATE hospitals SET name=trim(details->>'name'),address=coalesce(details->>'address',''),phone=coalesce(details->>'phone',''),logo_url=coalesce(details->>'logo_url','') WHERE id=hospital;
END $$;
CREATE FUNCTION public.hospital_staff(hospital uuid) RETURNS TABLE(user_id uuid, full_name text, email text, role text, is_owner boolean, is_active boolean) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 RETURN QUERY SELECT m.user_id,coalesce(u.raw_user_meta_data->>'full_name','Staff'),u.email::text,m.role,m.is_owner,m.is_active FROM hospital_memberships m JOIN auth.users u ON u.id=m.user_id WHERE m.hospital_id=hospital;
END $$;
CREATE FUNCTION public.manage_hospital_staff(hospital uuid, staff_user uuid, staff_role text, active boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF staff_user=auth.uid() OR EXISTS(SELECT 1 FROM hospital_memberships WHERE hospital_id=hospital AND user_id=staff_user AND is_owner) THEN RAISE EXCEPTION 'The owner and your own membership cannot be changed here'; END IF;
 UPDATE hospital_memberships SET role=staff_role,is_active=active WHERE hospital_id=hospital AND user_id=staff_user;
 IF NOT FOUND THEN RAISE EXCEPTION 'Staff member not found'; END IF;
END $$;
CREATE FUNCTION public.invite_hospital_staff(hospital uuid, staff_email text, staff_role text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE invitation uuid; BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF trim(staff_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN RAISE EXCEPTION 'Enter a valid email'; END IF;
 INSERT INTO hospital_invitations(hospital_id,email,role) VALUES(hospital,lower(trim(staff_email)),staff_role) RETURNING token INTO invitation;
 RETURN invitation;
END $$;
CREATE FUNCTION public.accept_hospital_invitation(invitation uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i hospital_invitations; verified_email text; BEGIN
 SELECT email INTO verified_email FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL;
 SELECT * INTO i FROM hospital_invitations WHERE token=invitation AND accepted_at IS NULL AND expires_at>now() FOR UPDATE;
 IF i.id IS NULL OR verified_email IS NULL OR lower(verified_email)<>i.email THEN RAISE EXCEPTION 'Invitation expired or belongs to another verified email'; END IF;
 IF EXISTS(SELECT 1 FROM hospital_memberships WHERE hospital_id=i.hospital_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Membership already exists; contact your administrator'; END IF;
 INSERT INTO hospital_memberships(hospital_id,user_id,role) VALUES(i.hospital_id,auth.uid(),i.role);
 UPDATE hospital_invitations SET accepted_at=now() WHERE id=i.id;
 RETURN i.hospital_id;
END $$;

-- All clinical writes are atomic, tenant checked, and serialized by bed/admission locks.
CREATE FUNCTION public.hospital_clinical_action(hospital uuid, action text, payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r text; b beds; target beds; a admissions; p patients; tr bed_transfers; d discharges; BEGIN
 r:=public.hospital_role(hospital);
 IF r IS NULL THEN RAISE EXCEPTION 'Hospital access denied'; END IF;
 IF NOT EXISTS(SELECT 1 FROM hospitals WHERE id=hospital AND setup_completed) THEN RAISE EXCEPTION 'Complete hospital setup first'; END IF;
 IF action='clean' THEN
  IF r NOT IN ('Admin','Nurse') THEN RAISE EXCEPTION 'Cleaning access denied'; END IF;
  UPDATE beds SET status='vacant',updated_at=now() WHERE id=(payload->>'bedId')::uuid AND hospital_id=hospital AND status='cleaning';
  IF NOT FOUND THEN RAISE EXCEPTION 'Cleaning bed not found'; END IF;
  RETURN '{}'::jsonb;
 ELSIF action='admit' THEN
  SELECT * INTO b FROM beds WHERE id=(payload->>'bedId')::uuid AND hospital_id=hospital FOR UPDATE;
  IF b.id IS NULL OR b.status<>'vacant' OR b.ward_id<>(payload->>'wardId')::uuid THEN RAISE EXCEPTION 'Selected bed is unavailable'; END IF;
  INSERT INTO patients(hospital_id,uhid,full_name,age,gender,mobile,guardian_name,guardian_mobile,address)
  VALUES(hospital,'UHID-'||gen_random_uuid(),payload->'patient'->>'full_name',(payload->'patient'->>'age')::int,payload->'patient'->>'gender',payload->'patient'->>'mobile',payload->'patient'->>'guardian_name',payload->'patient'->>'guardian_mobile',payload->'patient'->>'address') RETURNING * INTO p;
  INSERT INTO admissions(hospital_id,admission_number,patient_id,bed_id,ward_id,admitting_doctor,provisional_diagnosis,notes)
  VALUES(hospital,'IPD-'||gen_random_uuid(),p.id,b.id,b.ward_id,payload->>'admittingDoctor',payload->>'provisionalDiagnosis',payload->>'notes') RETURNING * INTO a;
  UPDATE beds SET status='occupied',updated_at=now() WHERE id=b.id;
  RETURN jsonb_build_object('patient',to_jsonb(p),'admission',to_jsonb(a));
 ELSIF action IN ('shift','discharge') THEN
  SELECT * INTO a FROM admissions WHERE id=(payload->>'admissionId')::uuid AND hospital_id=hospital FOR UPDATE;
  IF a.id IS NULL OR a.status NOT IN ('admitted','shifted') THEN RAISE EXCEPTION 'Active admission not found'; END IF;
  IF action='shift' THEN
   IF a.bed_id<>(payload->>'fromBedId')::uuid THEN RAISE EXCEPTION 'Patient bed has changed; refresh'; END IF;
   PERFORM id FROM beds WHERE hospital_id=hospital AND id IN (a.bed_id,(payload->>'toBedId')::uuid) ORDER BY id FOR UPDATE;
   SELECT * INTO target FROM beds WHERE id=(payload->>'toBedId')::uuid AND hospital_id=hospital;
   IF target.id IS NULL OR target.status<>'vacant' THEN RAISE EXCEPTION 'Destination bed is unavailable'; END IF;
   INSERT INTO bed_transfers(hospital_id,admission_id,from_bed_id,to_bed_id,reason,transferred_by)
   VALUES(hospital,a.id,a.bed_id,target.id,payload->>'reason',auth.uid()::text) RETURNING * INTO tr;
   UPDATE beds SET status='cleaning',updated_at=now() WHERE id=a.bed_id;
   UPDATE beds SET status='occupied',updated_at=now() WHERE id=target.id;
   UPDATE admissions SET bed_id=target.id,ward_id=target.ward_id,status='shifted',updated_at=now() WHERE id=a.id;
   RETURN to_jsonb(tr);
  ELSE
   IF r NOT IN ('Admin','Doctor') THEN RAISE EXCEPTION 'Discharge access denied'; END IF;
   IF a.bed_id<>(payload->>'bedId')::uuid THEN RAISE EXCEPTION 'Patient bed has changed; refresh'; END IF;
   PERFORM id FROM beds WHERE id=a.bed_id FOR UPDATE;
   INSERT INTO discharges(hospital_id,admission_id,discharge_type,destination_hospital,discharge_summary,doctor_advice,follow_up_date)
   VALUES(hospital,a.id,payload->>'dischargeType',payload->>'destinationHospital',payload->>'dischargeSummary',payload->>'doctorAdvice',nullif(payload->>'followUpDate','')::date) RETURNING * INTO d;
   UPDATE admissions SET status=CASE d.discharge_type WHEN 'normal' THEN 'discharged' WHEN 'referred' THEN 'referred' ELSE 'lama' END,updated_at=now() WHERE id=a.id;
   UPDATE beds SET status='cleaning',updated_at=now() WHERE id=a.bed_id;
   RETURN to_jsonb(d);
  END IF;
 END IF;
 RAISE EXCEPTION 'Unknown clinical action';
END $$;
REVOKE ALL ON FUNCTION public.create_hospital(jsonb),public.complete_hospital_setup(uuid),public.invite_hospital_staff(uuid,text,text),public.accept_hospital_invitation(uuid),public.hospital_clinical_action(uuid,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_hospital(jsonb),public.complete_hospital_setup(uuid),public.invite_hospital_staff(uuid,text,text),public.accept_hospital_invitation(uuid),public.hospital_clinical_action(uuid,text,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.update_hospital_details(uuid,jsonb),public.hospital_staff(uuid),public.manage_hospital_staff(uuid,uuid,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_hospital_details(uuid,jsonb),public.hospital_staff(uuid),public.manage_hospital_staff(uuid,uuid,text,boolean) TO authenticated;
COMMIT;
