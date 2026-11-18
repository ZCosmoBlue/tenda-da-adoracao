import type {SupabaseClient} from '@supabase/supabase-js';
import {ApiError} from './security';
import {PHOTO_BUCKET,databaseError} from './storage';

const MAX_PHOTO_BYTES=32*1024*1024;
async function allRows(db:SupabaseClient,table:string){
 const rows:Record<string,unknown>[]=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await db.from(table).select('*').order('id').range(offset,offset+499);
  databaseError(error);rows.push(...(data??[]));
  if(!data||data.length<500)return rows;
 }
}
async function snapshot(db:SupabaseClient){
 const [entries,photos,settings]=await Promise.all(['church_entries','church_photos','church_settings'].map(table=>allRows(db,table)));
 return {entries,photos,settings};
}
export async function createContentBackup(db:SupabaseClient){
 const start=await snapshot(db);
 const total=start.photos.reduce((sum,p)=>sum+Number(p.size),0);
 if(!Number.isSafeInteger(total)||total>MAX_PHOTO_BYTES)throw new ApiError(413,'As fotos ultrapassam 32 MB. Solicite um backup assistido em lotes; nenhum backup parcial foi gerado.');
 const files=[];
 for(const photo of start.photos){
  const {data,error}=await db.storage.from(PHOTO_BUCKET).download(String(photo.object_key));
  if(error||!data)throw new ApiError(503,'Uma foto não pôde ser baixada. Tente novamente; nenhum backup parcial foi gerado.');
  if(data.size!==photo.size)throw new ApiError(409,'O tamanho de uma foto não confere. Revise o armazenamento antes de repetir o backup.');
  const bytes=new Uint8Array(await data.arrayBuffer());
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  files.push({object_key:photo.object_key,mime:photo.mime,size:bytes.length,sha256,base64:btoa(binary)});
 }
 if(JSON.stringify(start)!==JSON.stringify(await snapshot(db)))throw new ApiError(409,'O conteúdo mudou durante a cópia. Aguarde as edições terminarem e tente novamente.');
 return {format:'tenda-content-backup',version:1,created_at:new Date().toISOString(),scope:'content-only',...start,files};
}
