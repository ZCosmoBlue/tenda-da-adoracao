import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {database} from '@/lib/storage';
import {checkOrigin,failure,ApiError,json} from '@/lib/security';
import {input,emailInput,passwordInput,requestLimit,limit} from '@/lib/auth-input';
import {hashPassword,digest,equalSecret} from '@/lib/password';
export async function POST(request:Request){try{
 checkOrigin(request);await requestLimit(request);
 const data=await input(request,z.object({email:emailInput,password:passwordInput,token:z.string().regex(/^[a-f0-9]{64}$/),setup:z.boolean().default(false)}));
 await limit('activate:'+data.email);
 const db=database();
 if(data.setup){
  if(!env.ADMIN_SETUP_TOKEN||!env.OWNER_EMAIL||!equalSecret(data.token,env.ADMIN_SETUP_TOKEN)||data.email!==env.OWNER_EMAIL.trim().toLowerCase())throw new ApiError(400,'Convite inválido ou expirado.');
  if(await db.prepare('SELECT id FROM auth_users WHERE role=?').bind('owner').first())throw new ApiError(409,'O administrador já foi configurado. Entre com sua senha.');
  const hash=await hashPassword(data.password);
  const result=await db.prepare('INSERT INTO auth_users (id,email,name,role,password_hash,enabled,created_at) SELECT ?,?,?,?,?,1,? WHERE NOT EXISTS (SELECT 1 FROM auth_users WHERE role=?)').bind('owner',data.email,'Administrador','owner',hash,Date.now(),'owner').run();
  if(result.meta.changes!==1)throw new ApiError(409,'O administrador já foi configurado.');
 }else{
  const tokenHash=digest(data.token);
  const invited=await db.prepare('SELECT id FROM auth_users WHERE email=? AND invite_hash=? AND invite_expires>? AND enabled=1 AND role=?').bind(data.email,tokenHash,Date.now(),'editor').first<{id:string}>();
  if(!invited)throw new ApiError(400,'Convite inválido ou expirado. Peça um novo ao administrador.');
  const hash=await hashPassword(data.password);
  const result=await db.prepare('UPDATE auth_users SET password_hash=?,invite_hash=NULL,invite_expires=NULL WHERE id=? AND invite_hash=? AND invite_expires>? AND enabled=1').bind(hash,invited.id,tokenHash,Date.now()).run();
  if(result.meta.changes!==1)throw new ApiError(400,'Convite já utilizado ou expirado.');
  await db.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(invited.id).run();
 }
 return json({ok:true});
}catch(e){return failure(e);}}
