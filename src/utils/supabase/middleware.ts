import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xbojviesfepycpomnncj.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_22DU98_EynLFveOUW8B50g_c_2b-LIB';

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedRoutes = ['/dashboard','/admit','/wards','/patients','/transfers','/discharge','/profile','/ward-master','/settings'];
  const management = protectedRoutes.some(p => path === p || path.startsWith(p + '/'));
  const platform = path === '/super-admin' || path.startsWith('/super-admin/');
  if (management || path === '/setup' || platform) {
    let target: string | null = null;
    if (!user) target = '/login';
    else if (platform) {
      const {data,error} = await supabase.rpc('is_platform_admin');
      if(error || data !== true) target = '/';
    } else if (path === '/setup') {
      const { data } = await supabase.rpc('is_platform_admin');
      if (data === true) target = '/super-admin';
    } else if (management) {
      const { data, error } = await supabase.from('hospital_memberships').select('hospital:hospitals(setup_completed)').eq('user_id',user.id).eq('is_active',true).order('hospital_id').limit(1).maybeSingle();
      const hospital = data && (Array.isArray(data.hospital) ? data.hospital[0] : data.hospital);
      if (error || !hospital?.setup_completed) target = '/setup';
    }
    if (target) {
      const response = NextResponse.redirect(new URL(target,request.url));
      supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
      return response;
    }
  }

  return supabaseResponse;
};
