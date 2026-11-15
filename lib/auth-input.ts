import {z} from 'zod';
import {memberDatabase,databaseError} from './storage';
import {ApiError} from './security';

export const emailInput=z.string().trim().toLowerCase().email().max(254);
export const passwordInput=z.string().min(12,'Use uma senha com pelo menos 12 caracteres.').max(128,'Use até 128 caracteres.');
export async function input<T>(request:Request,schema:z.ZodType<T>):Promise<T>{
 const text=await request.text();if(text.length>4096)throw new ApiError(413,'Formulário muito grande.');
 let value;try{value=JSON.parse(text);}catch{throw new ApiError(400,'Formulário inválido.');}
 const result=schema.safeParse(value);if(!result.success)throw new ApiError(400,result.error.issues[0].message);return result.data;
}
// Auth handles unauthenticated sign-in limits. Sensitive member actions have
// persistent, atomic per-user counters in Postgres.
export async function limit(key:string,_max=8){
 const action=key.split(':')[0];
 if(!['password','invite','users'].includes(action))throw new Error('Unknown limit action');
 const db=await memberDatabase();const {data,error}=await db.rpc('church_consume_limit',{action_name:action});databaseError(error);
 if(!data)throw new ApiError(429,'Muitas tentativas ou acesso encerrado. Aguarde e entre novamente.');
}
