import {supabaseServer,supabaseAccount} from './supabase-server';

// Separate PKCE cookies keep a recovery request from replacing a panel session.
const recoveryCookie='tenda-recovery-auth';
export async function requestPasswordRecovery(request:Request,email:string){
 const {client,responseHeaders}=await supabaseServer(request,recoveryCookie);
 const redirectTo=new URL('/administrador/redefinir-senha',request.url).href;
 const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
 if(error?.status===429)return Response.json({error:'Muitas solicitações. Aguarde alguns minutos antes de tentar novamente.'},{status:429,headers:responseHeaders});
 if(error&&(!error.status||error.status>=500))return Response.json({error:'Não foi possível solicitar o e-mail agora. Tente novamente mais tarde.'},{status:503,headers:responseHeaders});
 // Never disclose whether an address exists, is authorized or can receive mail.
 return Response.json({ok:true},{headers:responseHeaders});
}

export async function resetRecoveredPassword(request:Request,code:string,password:string,flowId?:string){
 const {client,responseHeaders}=await supabaseServer(request,recoveryCookie);
 const reply=(error:string,status=400)=>Response.json({error},{status,headers:responseHeaders});
 const {data,error}=await client.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);
 if(error||!data.session)return reply('Link inválido ou expirado. Solicite outro link e abra no mesmo navegador em que fez o pedido.');
 let result:{ok?:boolean;error?:string}={};let status=200;
 try{
  if(!('redirectType' in data)||data.redirectType!=='recovery'||!await supabaseAccount(client)){
   result={error:'Não foi possível recuperar este acesso. Fale com o administrador.'};status=403;
  }else{
  const {error:updateError}=await client.auth.updateUser({password});
  if(updateError){result={error:'Não foi possível definir esta senha. Solicite outro link e escolha uma senha diferente, com pelo menos 12 caracteres.'};status=400;}else{
  const {error:logoutError}=await client.auth.signOut({scope:'global'});
  if(logoutError){result={error:'Sua senha foi alterada, mas não foi possível encerrar todas as sessões. Entre com a nova senha e fale com o administrador.'};status=503;}else result={ok:true};
  }
  }
 }finally{
  // Do not leave a recovery session logged in, including on authorization errors.
  await client.auth.signOut({scope:'local'});
 }
 return Response.json(result,{status,headers:responseHeaders});
}
