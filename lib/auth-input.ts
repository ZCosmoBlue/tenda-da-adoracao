import {z} from 'zod';
import {database} from './storage';
import {ApiError} from './security';
import {digest} from './password';
export const emailInput=z.string().trim().toLowerCase().email().max(254);
export const passwordInput=z.string().min(12,'Use uma senha com pelo menos 12 caracteres.').max(128,'Use até 128 caracteres.');
export async function input<T>(request:Request,schema:z.ZodType<T>):Promise<T>{
 const text=await request.text();if(text.length>4096)throw new ApiError(413,'Formulário muito grande.');
 let value;try{value=JSON.parse(text);}catch{throw new ApiError(400,'Formulário inválido.');}
 const result=schema.safeParse(value);if(!result.success)throw new ApiError(400,result.error.issues[0].message);return result.data;
}
// Atomic counters: concurrent requests cannot bypass the fixed-window limit.
export async function limit(key:string,max=8){
 const now=Date.now(),db=database(),hashed=digest(key);
 await db.prepare('DELETE FROM auth_attempts WHERE expires_at<=?').bind(now).run();
 const row=await db.prepare('INSERT INTO auth_attempts (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=auth_attempts.count+1 RETURNING count').bind(hashed,now+900000).first<{count:number}>();
 if(!row||row.count>max)throw new ApiError(429,'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
}
export async function requestLimit(request:Request){await limit('source:'+ (request.headers.get('cf-connecting-ip')||'shared'),60);}
