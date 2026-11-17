import {z} from 'zod';
import {checkOrigin,failure} from '@/lib/security';
import {input,passwordInput} from '@/lib/auth-input';
import {resetRecoveredPassword} from '@/lib/password-recovery';
export async function POST(request:Request){try{
 checkOrigin(request);
 const {code,password,flowId}=await input(request,z.object({code:z.string().min(1).max(2048),password:passwordInput,flowId:z.string().max(256).optional()}));
 return await resetRecoveredPassword(request,code,password,flowId);
}catch(error){return failure(error);}}
