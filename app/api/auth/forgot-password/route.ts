import {z} from 'zod';
import {checkOrigin,failure} from '@/lib/security';
import {input,emailInput} from '@/lib/auth-input';
import {requestPasswordRecovery} from '@/lib/password-recovery';
export async function POST(request:Request){try{
 checkOrigin(request);
 const {email}=await input(request,z.object({email:emailInput}));
 return await requestPasswordRecovery(request,email);
}catch(error){return failure(error);}}
