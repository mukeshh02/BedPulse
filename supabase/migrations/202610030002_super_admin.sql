BEGIN;
CREATE TABLE public.platform_admins (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_admins FROM anon, authenticated;
CREATE FUNCTION public.is_platform_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM platform_admins WHERE user_id=auth.uid()); $$;
CREATE FUNCTION public.platform_overview() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'Super Admin access required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object(
  'registered_users',(SELECT count(*) FROM auth.users),
  'hospital_users',(SELECT count(DISTINCT user_id) FROM hospital_memberships),
  'hospitals',coalesce((SELECT jsonb_agg(row_to_json(stats) ORDER BY stats.created_at DESC) FROM (
   SELECT h.id,h.name,h.code,h.setup_completed,h.created_at,
    count(m.user_id) AS users,
    count(m.user_id) FILTER(WHERE m.is_active) AS active_users,
    count(m.user_id) FILTER(WHERE m.role='Doctor' AND m.is_active) AS doctors,
    count(m.user_id) FILTER(WHERE m.role='Nurse' AND m.is_active) AS nurses,
    count(m.user_id) FILTER(WHERE m.role='Admin' AND m.is_active) AS admins
   FROM hospitals h LEFT JOIN hospital_memberships m ON m.hospital_id=h.id GROUP BY h.id
  ) stats),'[]'::jsonb)
 );
END $$;
CREATE FUNCTION public.platform_hospital_users(hospital uuid) RETURNS TABLE(
 user_id uuid, full_name text, email text, role text, is_active boolean, is_owner boolean
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'Super Admin access required' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT m.user_id,coalesce(u.raw_user_meta_data->>'full_name','Staff'),u.email::text,m.role,m.is_active,m.is_owner
 FROM hospital_memberships m JOIN auth.users u ON u.id=m.user_id WHERE m.hospital_id=hospital ORDER BY u.email;
END $$;
REVOKE ALL ON FUNCTION public.is_platform_admin(), public.platform_overview(),public.platform_hospital_users(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(),public.platform_overview(),public.platform_hospital_users(uuid) TO authenticated;
INSERT INTO public.platform_admins(user_id)
 SELECT id FROM auth.users WHERE lower(email)='mukeshsharmaedits@gmail.com' AND email_confirmed_at IS NOT NULL
 ON CONFLICT DO NOTHING;
COMMIT;
-- Assign access only from the trusted Supabase SQL editor after confirming the account:
-- INSERT INTO public.platform_admins(user_id) SELECT id FROM auth.users WHERE email='mukeshsharmaedits@gmail.com' ON CONFLICT DO NOTHING;
