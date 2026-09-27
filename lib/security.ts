import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export async function isAdmin(){
 const user=await getChatGPTUser();
 const allowed=(env.ADMIN_EMAILS??'').split(',').map((s:string)=>s.trim().toLowerCase()).filter(Boolean);
 return user && allowed.includes(user.email.toLowerCase()) ? user : null;
}
export async function authorize(request?:Request){
 const user=await isAdmin(); if(!user) throw new ApiError(403,'Entre com uma conta autorizada para administrar o site.');
 if(request && !['GET','HEAD'].includes(request.method)) {
  const origin=request.headers.get('origin');
  if(!origin || origin!==new URL(request.url).origin) throw new ApiError(403,'Origem da solicitação inválida. Reabra o painel.');
 }
 return user;
}
export function failure(error:unknown){
 if(error instanceof ApiError) return Response.json({error:error.message},{status:error.status});
 console.error('Tenda request failed',error instanceof Error?error.message:'Unknown error');
 return Response.json({error:'Não foi possível concluir. Seus dados no formulário foram mantidos; tente novamente.'},{status:503});
}
export function json(data:unknown){return Response.json(data,{headers:{'Cache-Control':'no-store'}});}
