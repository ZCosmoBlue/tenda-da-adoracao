import {createServerClient,parseCookieHeader,serializeCookieHeader} from '@supabase/ssr';
import {headers} from 'next/headers';
import {supabaseConfig} from './supabase-config';
import type {Account} from './auth';

// A fresh client per request. Tokens never enter response JSON or localStorage.
export async function supabaseServer(request?:Request){
 const {url,key}=supabaseConfig();
 const incoming=request?.headers??await headers();
 const responseHeaders=new Headers({'Cache-Control':'private, no-store'});
 const client=createServerClient(url,key,{
  cookieOptions:{httpOnly:true,sameSite:'lax',path:'/',secure:request?new URL(request.url).protocol==='https:':true},
  cookies:{
   getAll:()=>parseCookieHeader(incoming.get('cookie')??'').map(c=>({name:c.name,value:c.value??''})),
   setAll(cookies,cacheHeaders){
    for(const {name,value,options} of cookies)responseHeaders.append('Set-Cookie',serializeCookieHeader(name,value,options));
    for(const [name,value] of Object.entries(cacheHeaders??{}))responseHeaders.set(name,value);
   },
  },
 });
 return {client,responseHeaders};
}

export async function supabaseAccount(client:Awaited<ReturnType<typeof supabaseServer>>['client']):Promise<Account|null>{
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user)return null;
 // DB checks the current membership AND auth session, not editable user metadata.
 const {data,error:permissionError}=await client.rpc('church_current_account');
 if(permissionError)throw new Error('Supabase permission check unavailable');
 const member=data?.[0];
 if(!member||member.user_id!==user.id||!['owner','editor'].includes(member.role))return null;
 return {userId:user.id,email:user.email??'',name:member.name,role:member.role};
}
