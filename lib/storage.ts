import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {supabaseConfig} from './supabase-config';
import {supabaseServer} from './supabase-server';
import {ApiError} from './security';
import type {Entry} from './models';
export const PHOTO_BUCKET='church-photos';
export function publicDatabase(){
 const {url,key}=supabaseConfig();
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
export async function memberDatabase(){return (await supabaseServer()).client;}
export function databaseError(error:{code?:string;message?:string}|null){
 if(!error)return;
 if(error.code==='40001')throw new ApiError(409,'A lista de fotos mudou. Reabra a edição.');
 if(error.code==='23514')throw new ApiError(400,'Revise a publicação: adicione uma foto ao álbum e respeite o limite de 40 fotos.');
 if(error.code==='42501')throw new ApiError(403,'Sua conta não tem permissão para esta ação.');
 throw new Error('Supabase data operation failed: '+(error.code??'unknown'));
}
export async function listEntries(admin=false):Promise<Entry[]>{
 const db:SupabaseClient=admin?await memberDatabase():publicDatabase();
 let query=db.from('church_entries').select('id,kind,title,description,date,location,status,created_at,updated_at,photos:church_photos(id,entry_id,caption,created_at,sort_order)').order('created_at',{ascending:false}).order('sort_order',{referencedTable:'church_photos',ascending:true}).order('created_at',{referencedTable:'church_photos',ascending:true}).order('id',{referencedTable:'church_photos',ascending:true}).limit(200);
 if(!admin)query=query.in('status',['published','ended']);
 const {data,error}=await query;databaseError(error);
 return (data??[]).map(row=>({...row,date:row.date??'',photos:row.photos??[]})) as Entry[];
}
