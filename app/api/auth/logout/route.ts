import {checkOrigin,failure} from '@/lib/security';
import {supabaseLogout} from '@/lib/supabase-auth-actions';
export async function POST(request:Request){try{checkOrigin(request);return await supabaseLogout(request);}catch(e){return failure(e);}}
