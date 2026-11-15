import {z} from 'zod';
import {checkOrigin,failure} from '@/lib/security';
import {input,emailInput} from '@/lib/auth-input';
import {supabaseLogin} from '@/lib/supabase-auth-actions';
export async function POST(request:Request){try{
 checkOrigin(request);
 const data=await input(request,z.object({email:emailInput,password:z.string().min(1).max(128)}));
 return await supabaseLogin(request,data.email,data.password);
}catch(e){return failure(e);}}
