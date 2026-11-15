import {z} from 'zod';
import {checkOrigin,failure} from '@/lib/security';
import {input,emailInput,limit,requestLimit} from '@/lib/auth-input';
import {supabaseLogin} from '@/lib/supabase-auth-actions';
export async function POST(request:Request){try{
 checkOrigin(request);await requestLimit(request);
 const data=await input(request,z.object({email:emailInput,password:z.string().min(1).max(128)}));await limit('login:'+data.email);
 return await supabaseLogin(request,data.email,data.password);
}catch(e){return failure(e);}}
