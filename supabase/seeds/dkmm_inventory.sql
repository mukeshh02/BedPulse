-- Run in the Supabase SQL Editor as the database administrator.
-- DKMM only. Adds inventory and doctor directory entries, not login accounts.
BEGIN;
DO $$
DECLARE hospital_uuid uuid; ward_uuid uuid; item record;
BEGIN
 SELECT id INTO STRICT hospital_uuid FROM public.hospitals WHERE code='dkmm';
 PERFORM 1 FROM public.hospitals WHERE id=hospital_uuid FOR UPDATE;
 FOR item IN SELECT * FROM (VALUES
  ('ICU','ICU',5,'ICU'),
  ('FGW','FGW',13,'Standard'),
  ('MGW','MGW',6,'Standard'),
  ('Private','PVT',3,'Private'),
  ('Deluxe','DLX',4,'Deluxe'),
  ('Pre opp','PRE',2,'Pre-operative')
 ) AS inventory(ward_name,ward_code,capacity,room_kind) LOOP
  SELECT id INTO ward_uuid FROM public.wards WHERE hospital_id=hospital_uuid
   AND (upper(code)=item.ward_code OR lower(name)=lower(item.ward_name))
   ORDER BY CASE WHEN upper(code)=item.ward_code THEN 0 ELSE 1 END LIMIT 1;
  IF ward_uuid IS NULL THEN
   INSERT INTO public.wards(hospital_id,name,code,color_accent)
    VALUES(hospital_uuid,item.ward_name,item.ward_code,'#789986') RETURNING id INTO ward_uuid;
  END IF;
  IF (SELECT count(*) FROM public.beds WHERE hospital_id=hospital_uuid AND ward_id=ward_uuid)>item.capacity THEN
   RAISE EXCEPTION 'Ward % already exceeds requested capacity; existing beds have been preserved',item.ward_name;
  END IF;
  -- Fill to the requested capacity while retaining existing bed numbers and statuses.
  FOR i IN 1..item.capacity LOOP
   EXIT WHEN (SELECT count(*) FROM public.beds WHERE hospital_id=hospital_uuid AND ward_id=ward_uuid)>=item.capacity;
   INSERT INTO public.beds(hospital_id,ward_id,bed_number,room_type,status)
    VALUES(hospital_uuid,ward_uuid,item.ward_code||'-'||lpad(i::text,2,'0'),item.room_kind,'vacant')
    ON CONFLICT(ward_id,bed_number) DO NOTHING;
  END LOOP;
  IF (SELECT count(*) FROM public.beds WHERE hospital_id=hospital_uuid AND ward_id=ward_uuid)<>item.capacity THEN
   RAISE EXCEPTION 'Unable to fill ward % to requested capacity',item.ward_name;
  END IF;
 END LOOP;
 INSERT INTO public.doctors(hospital_id,name,specialty,department,is_active)
 SELECT hospital_uuid,d.name,'','',true FROM (VALUES
  ('Dr Saurabh mohabey'),('Dr RK mohabey'),('Dr chinmay'),('Dr Ketan'),('Dr SK kharul')
 ) AS d(name)
 WHERE NOT EXISTS(SELECT 1 FROM public.doctors x WHERE x.hospital_id=hospital_uuid AND lower(trim(x.name))=lower(d.name));
END $$;
COMMIT;
SELECT w.name,w.code,count(b.id) AS capacity FROM public.wards w
JOIN public.hospitals h ON h.id=w.hospital_id
LEFT JOIN public.beds b ON b.ward_id=w.id AND b.hospital_id=h.id
WHERE h.code='dkmm' GROUP BY w.id ORDER BY w.code;
SELECT d.name FROM public.doctors d JOIN public.hospitals h ON h.id=d.hospital_id WHERE h.code='dkmm' ORDER BY d.name;
