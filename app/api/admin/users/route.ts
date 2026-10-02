import {z} from 'zod';
import {database} from '@/lib/storage';
import {requireOwner,failure,ApiError,json} from '@/lib/security';
import {input,emailInput,limit} from '@/lib/auth-input';
import {randomToken,digest} from '@/lib/password';
export async function GET(){try{await requireOwner();const rows=await database().prepare('SELECT id,email,name,role,enabled,CASE WHEN password_hash=? THEN 0 ELSE 1 END AS activated FROM auth_users ORDER BY created_at').bind('').all();return json(rows.results);}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const owner=await requireOwner(request);await limit('invite:'+owner.userId,20);
 const data=await input(request,z.object({email:emailInput,name:z.string().trim().min(1).max(80)}));
 const db=database();if(await db.prepare('SELECT id FROM auth_users WHERE email=?').bind(data.email).first())throw new ApiError(409,'Este e-mail já tem uma conta. Use Renovar convite na lista.');
 const token=randomToken();await db.prepare('INSERT INTO auth_users (id,email,name,role,password_hash,enabled,invite_hash,invite_expires,created_at) VALUES (?,?,?,?,?,1,?,?,?)').bind(crypto.randomUUID(),data.email,data.name,'editor','',digest(token),Date.now()+172800000,Date.now()).run();
 return json({link:new URL('/administrador/ativar',request.url).toString()+'#'+token});
}catch(e){return failure(e);}}
export async function PATCH(request:Request){try{
 const owner=await requireOwner(request);const data=await input(request,z.object({id:z.string().max(100),action:z.enum(['disable','enable','invite'])}));await limit('users:'+owner.userId,40);
 const db=database(),target=await db.prepare('SELECT role FROM auth_users WHERE id=?').bind(data.id).first<{role:string}>();
 if(!target||target.role!=='editor')throw new ApiError(400,'Esta ação só pode ser aplicada a uma conta de editora.');
 if(data.action==='invite'){
  const token=randomToken();await db.batch([db.prepare('UPDATE auth_users SET password_hash=?,enabled=1,invite_hash=?,invite_expires=? WHERE id=?').bind('',digest(token),Date.now()+172800000,data.id),db.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(data.id)]);
  return json({link:new URL('/administrador/ativar',request.url).toString()+'#'+token});
 }
 await db.batch([db.prepare('UPDATE auth_users SET enabled=?,invite_hash=NULL,invite_expires=NULL WHERE id=?').bind(data.action==='enable'?1:0,data.id),db.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(data.id)]);return json({ok:true});
}catch(e){return failure(e);}}
