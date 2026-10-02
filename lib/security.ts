import {currentAccount} from './auth';
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export async function isAdmin(){
 return currentAccount();
}
export async function requireOwner(request?:Request){const user=await authorize(request);if(user.role!=='owner')throw new ApiError(403,'Somente o administrador pode gerenciar contas e informações da igreja.');return user;}
export function checkOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new ApiError(403,'Origem inválida. Reabra a página.');}
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
