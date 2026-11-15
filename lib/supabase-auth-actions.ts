import {createClient} from '@supabase/supabase-js';
import {supabaseServer,supabaseAccount} from './supabase-server';
import {supabaseConfig} from './supabase-config';

export async function supabaseLogin(request:Request,email:string,password:string){
 const {client,responseHeaders}=await supabaseServer(request);
 const {error}=await client.auth.signInWithPassword({email,password});
 if(error)return Response.json({error:error.status===429?'Muitas tentativas. Aguarde e tente novamente.':'E-mail ou senha incorretos, ou e-mail ainda não confirmado.'},{status:error.status===429?429:401,headers:responseHeaders});
 try{
  const account=await supabaseAccount(client);
  if(!account){await client.auth.signOut({scope:'local'});return Response.json({error:'Esta conta não tem permissão para acessar o painel.'},{status:403,headers:responseHeaders});}
 }catch{
  await client.auth.signOut({scope:'local'});
  return Response.json({error:'A configuração de acesso ainda não foi concluída. Fale com o administrador.'},{status:503,headers:responseHeaders});
 }
 responseHeaders.append('Set-Cookie','tenda_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
 return Response.json({ok:true},{headers:responseHeaders});
}

export async function supabaseLogout(request:Request){
 const {client,responseHeaders}=await supabaseServer(request);
 const {error}=await client.auth.signOut({scope:'local'});
 if(error)return Response.json({error:'Não foi possível encerrar a sessão. Tente novamente.'},{status:503,headers:responseHeaders});
 return Response.json({ok:true},{headers:responseHeaders});
}

export async function supabasePassword(request:Request,email:string,current:string,password:string){
 const {url,key}=supabaseConfig();
 const verifier=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {error:invalid}=await verifier.auth.signInWithPassword({email,password:current});
 if(invalid)return Response.json({error:'A senha atual está incorreta.'},{status:400,headers:{'Cache-Control':'no-store'}});
 try{
  const {client,responseHeaders}=await supabaseServer(request);
  if(!await supabaseAccount(client))return Response.json({error:'Seu acesso foi encerrado. Entre novamente.'},{status:403,headers:responseHeaders});
  const {error}=await client.auth.updateUser({password});
  if(error)return Response.json({error:'Não foi possível alterar a senha. Use uma senha diferente e entre novamente se necessário.'},{status:400,headers:responseHeaders});
  const {error:logoutError}=await client.auth.signOut({scope:'global'});
  if(logoutError)return Response.json({error:'A senha foi alterada, mas não foi possível encerrar todas as sessões. Saia e entre novamente.'},{status:503,headers:responseHeaders});
  return Response.json({ok:true},{headers:responseHeaders});
 }finally{await verifier.auth.signOut({scope:'local'});}
}
