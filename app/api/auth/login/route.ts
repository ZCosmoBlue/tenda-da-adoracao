import {z} from 'zod';
import {database} from '@/lib/storage';
import {checkOrigin,failure,ApiError} from '@/lib/security';
import {input,emailInput,limit,requestLimit} from '@/lib/auth-input';
import {verifyPassword} from '@/lib/password';
import {createSession} from '@/lib/auth';
export async function POST(request:Request){try{
 checkOrigin(request);await requestLimit(request);
 const data=await input(request,z.object({email:emailInput,password:z.string().min(1).max(128)}));await limit('login:'+data.email);
 const user=await database().prepare('SELECT id,password_hash,enabled FROM auth_users WHERE email=?').bind(data.email).first<{id:string;password_hash:string;enabled:number}>();
 const valid=await verifyPassword(data.password,user?.password_hash||'');
 if(!user||!user.enabled||!valid)throw new ApiError(401,'E-mail ou senha incorretos.');
 return Response.json({ok:true},{headers:{'Set-Cookie':await createSession(request,user.id,user.password_hash),'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
