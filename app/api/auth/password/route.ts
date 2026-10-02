import {z} from 'zod';
import {authorize,failure,ApiError,json} from '@/lib/security';
import {input,passwordInput,limit} from '@/lib/auth-input';
import {database} from '@/lib/storage';
import {hashPassword,verifyPassword} from '@/lib/password';
import {sessionCookie} from '@/lib/auth';
export async function POST(request:Request){try{
 const user=await authorize(request);await limit('password:'+user.userId);
 const data=await input(request,z.object({current:z.string().min(1).max(128),password:passwordInput}));
 const stored=await database().prepare('SELECT password_hash FROM auth_users WHERE id=?').bind(user.userId).first<{password_hash:string}>();
 if(!stored||!await verifyPassword(data.current,stored.password_hash))throw new ApiError(400,'A senha atual está incorreta.');
 const hash=await hashPassword(data.password);
 await database().batch([database().prepare('UPDATE auth_users SET password_hash=? WHERE id=?').bind(hash,user.userId),database().prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(user.userId)]);
 const response=json({ok:true});response.headers.set('Set-Cookie',sessionCookie(request,'',0));return response;
}catch(e){return failure(e);}}
