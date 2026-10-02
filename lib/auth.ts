import {headers} from 'next/headers';
import {database} from './storage';
import {digest,randomToken} from './password';

export type Account={userId:string;email:string;name:string;role:'owner'|'editor'};
export function sessionToken(cookie:string|null){return cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('tenda_session='))?.slice(14)||'';}
export async function currentAccount():Promise<Account|null>{
 const token=sessionToken((await headers()).get('cookie'));if(!/^[a-f0-9]{64}$/.test(token))return null;
 return database().prepare('SELECT u.id AS userId,u.email,u.name,u.role FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.enabled=1 AND u.password_hash<>?').bind(digest(token),Date.now(),'').first<Account>();
}
export function sessionCookie(request:Request,token:string,maxAge=28800){
 const url=new URL(request.url);const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 return `tenda_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${url.protocol==='https:'||!local?'; Secure':''}`;
}
export async function createSession(request:Request,userId:string,expectedHash:string){
 const token=randomToken(),db=database();
 const results=await db.batch([
  db.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(Date.now()),
  db.prepare('INSERT INTO auth_sessions (token_hash,user_id,expires_at) SELECT ?,id,? FROM auth_users WHERE id=? AND password_hash=? AND enabled=1').bind(digest(token),Date.now()+28800000,userId,expectedHash),
 ]);
 if(results[1].meta.changes!==1)throw new Error('Account changed during sign-in');
 return sessionCookie(request,token);
}
