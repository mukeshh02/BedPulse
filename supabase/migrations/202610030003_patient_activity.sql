BEGIN;
CREATE TABLE public.patient_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hospital_id uuid NOT NULL REFERENCES public.hospitals(id),
 patient_id uuid NOT NULL, admission_id uuid NOT NULL, action text NOT NULL,
 performed_by uuid NOT NULL REFERENCES auth.users(id), recorded_by uuid NOT NULL REFERENCES auth.users(id),
 performed_name text NOT NULL, recorded_name text NOT NULL, details jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(hospital_id,patient_id) REFERENCES public.patients(hospital_id,id),
 FOREIGN KEY(hospital_id,admission_id) REFERENCES public.admissions(hospital_id,id)
);
CREATE INDEX ON public.patient_activity(hospital_id,patient_id,created_at DESC);
ALTER TABLE public.patient_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.patient_activity FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.patient_activity TO authenticated;
CREATE POLICY member_read ON public.patient_activity FOR SELECT TO authenticated USING(public.hospital_role(hospital_id) IS NOT NULL);
CREATE FUNCTION public.hospital_active_staff(hospital uuid) RETURNS TABLE(user_id uuid,full_name text,role text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF public.hospital_role(hospital) IS NULL THEN RAISE EXCEPTION 'Hospital access denied'; END IF;
 RETURN QUERY SELECT m.user_id,coalesce(u.raw_user_meta_data->>'full_name',u.email::text,'Staff'),m.role FROM hospital_memberships m JOIN auth.users u ON u.id=m.user_id WHERE m.hospital_id=hospital AND m.is_active ORDER BY 2;
END $$;
ALTER FUNCTION public.hospital_clinical_action(uuid,text,jsonb) RENAME TO hospital_clinical_action_base;
REVOKE ALL ON FUNCTION public.hospital_clinical_action_base(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.hospital_clinical_action(hospital uuid,action text,payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; a admissions; performer uuid; performer_name text; recorder_name text; before_bed text; after_bed text;
BEGIN
 IF public.hospital_role(hospital) IS NULL THEN RAISE EXCEPTION 'Hospital access denied'; END IF;
 performer:=coalesce(nullif(payload->>'performedBy','')::uuid,auth.uid());
 IF NOT EXISTS(SELECT 1 FROM hospital_memberships WHERE hospital_id=hospital AND user_id=performer AND is_active) THEN RAISE EXCEPTION 'Select an active staff member from this hospital'; END IF;
 SELECT coalesce(raw_user_meta_data->>'full_name',email::text,'Staff') INTO performer_name FROM auth.users WHERE id=performer;
 SELECT coalesce(raw_user_meta_data->>'full_name',email::text,'Staff') INTO recorder_name FROM auth.users WHERE id=auth.uid();
 IF action IN ('shift','discharge') THEN
  SELECT * INTO a FROM admissions WHERE id=(payload->>'admissionId')::uuid AND hospital_id=hospital FOR UPDATE;
  SELECT bed_number INTO before_bed FROM beds WHERE id=a.bed_id;
 END IF;
 result:=public.hospital_clinical_action_base(hospital,action,payload);
 IF action='admit' THEN SELECT * INTO a FROM admissions WHERE id=(result->'admission'->>'id')::uuid AND hospital_id=hospital; END IF;
 IF action IN ('admit','shift','discharge') THEN
  SELECT b.bed_number INTO after_bed FROM admissions ad JOIN beds b ON b.id=ad.bed_id WHERE ad.id=a.id;
  INSERT INTO patient_activity(hospital_id,patient_id,admission_id,action,performed_by,recorded_by,performed_name,recorded_name,details)
  VALUES(hospital,a.patient_id,a.id,action,performer,auth.uid(),performer_name,recorder_name,
   jsonb_build_object('from_bed',before_bed,'to_bed',after_bed,'reason',payload->>'reason','diagnosis',payload->>'provisionalDiagnosis','discharge_type',payload->>'dischargeType'));
 END IF;
 RETURN result;
END $$;
CREATE FUNCTION public.edit_patient_record(hospital uuid,admission uuid,changes jsonb,reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a admissions; old_patient patients; new_patient patients; actor_name text;
BEGIN
 IF public.hospital_role(hospital) IS NULL THEN RAISE EXCEPTION 'Hospital access denied'; END IF;
 IF length(trim(coalesce(reason,'')))<3 THEN RAISE EXCEPTION 'Enter a reason for this change'; END IF;
 IF jsonb_typeof(changes) IS DISTINCT FROM 'object' OR NOT(changes ? 'full_name') OR NOT(changes ? 'age') OR NOT(changes ? 'gender') OR NOT(changes ? 'mobile') THEN RAISE EXCEPTION 'Patient fields are required'; END IF;
 IF length(trim(changes->>'full_name'))<2 OR (changes->>'age')::int NOT BETWEEN 0 AND 130 OR changes->>'gender' NOT IN ('male','female','other') THEN RAISE EXCEPTION 'Invalid patient details'; END IF;
 SELECT * INTO a FROM admissions WHERE id=admission AND hospital_id=hospital FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'Patient not found'; END IF;
 SELECT * INTO old_patient FROM patients WHERE id=a.patient_id AND hospital_id=hospital FOR UPDATE;
 UPDATE patients SET full_name=trim(changes->>'full_name'),age=(changes->>'age')::int,gender=changes->>'gender',mobile=changes->>'mobile',updated_at=now() WHERE id=a.patient_id AND hospital_id=hospital RETURNING * INTO new_patient;
 SELECT coalesce(raw_user_meta_data->>'full_name',email::text,'Staff') INTO actor_name FROM auth.users WHERE id=auth.uid();
 INSERT INTO patient_activity(hospital_id,patient_id,admission_id,action,performed_by,recorded_by,performed_name,recorded_name,details)
 VALUES(hospital,a.patient_id,a.id,'edit',auth.uid(),auth.uid(),actor_name,actor_name,jsonb_build_object('before',to_jsonb(old_patient)-'hospital_id','after',to_jsonb(new_patient)-'hospital_id','reason',reason));
END $$;
CREATE FUNCTION public.correct_patient_activity(hospital uuid,event uuid,performer uuid,reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE original patient_activity; performer_name text; actor_name text;
BEGIN
 IF public.hospital_role(hospital) IS DISTINCT FROM 'Admin' THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF length(trim(coalesce(reason,'')))<3 THEN RAISE EXCEPTION 'Enter a correction reason'; END IF;
 SELECT * INTO original FROM patient_activity WHERE id=event AND hospital_id=hospital;
 IF original.id IS NULL OR original.action NOT IN ('admit','shift','discharge') THEN RAISE EXCEPTION 'Activity not found'; END IF;
 IF NOT EXISTS(SELECT 1 FROM hospital_memberships WHERE hospital_id=hospital AND user_id=performer AND is_active) THEN RAISE EXCEPTION 'Select active hospital staff'; END IF;
 SELECT coalesce(raw_user_meta_data->>'full_name',email::text,'Staff') INTO performer_name FROM auth.users WHERE id=performer;
 SELECT coalesce(raw_user_meta_data->>'full_name',email::text,'Staff') INTO actor_name FROM auth.users WHERE id=auth.uid();
 INSERT INTO patient_activity(hospital_id,patient_id,admission_id,action,performed_by,recorded_by,performed_name,recorded_name,details)
 VALUES(hospital,original.patient_id,original.admission_id,'correction',performer,auth.uid(),performer_name,actor_name,jsonb_build_object('event_id',event,'previous_performer',original.performed_name,'reason',reason));
END $$;
REVOKE ALL ON FUNCTION public.hospital_active_staff(uuid),public.hospital_clinical_action(uuid,text,jsonb),public.edit_patient_record(uuid,uuid,jsonb,text),public.correct_patient_activity(uuid,uuid,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hospital_active_staff(uuid),public.hospital_clinical_action(uuid,text,jsonb),public.edit_patient_record(uuid,uuid,jsonb,text),public.correct_patient_activity(uuid,uuid,uuid,text) TO authenticated;
COMMIT;
