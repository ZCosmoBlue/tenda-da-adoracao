import {z} from 'zod';
import {authorize,failure} from '@/lib/security';
import {input,passwordInput,limit} from '@/lib/auth-input';
import {supabasePassword} from '@/lib/supabase-auth-actions';
export async function POST(request:Request){try{
 const user=await authorize(request);await limit('password:'+user.userId);
 const data=await input(request,z.object({current:z.string().min(1).max(128),password:passwordInput}));
 return await supabasePassword(request,user.email,data.current,data.password);
}catch(e){return failure(e);}}
