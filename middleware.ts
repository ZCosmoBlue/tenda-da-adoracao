import {NextResponse,type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';
import {supabaseConfig} from './lib/supabase-config';

export async function middleware(request:NextRequest){

 const {url,key}=supabaseConfig();
 let response=NextResponse.next({request});
 const client=createServerClient(url,key,{
  cookieOptions:{httpOnly:true,sameSite:'lax',path:'/',secure:request.nextUrl.protocol==='https:'},
  cookies:{getAll:()=>request.cookies.getAll(),setAll(cookies,cacheHeaders){
   for(const {name,value} of cookies)request.cookies.set(name,value);
   response=NextResponse.next({request});
   for(const {name,value,options} of cookies)response.cookies.set(name,value,options);
   for(const [name,value] of Object.entries(cacheHeaders??{}))response.headers.set(name,value);
  }},
 });
 await client.auth.getUser();
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
export const config={matcher:['/administrador/:path*','/painel/:path*','/api/:path*']};
