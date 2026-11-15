import {memberDatabase,databaseError,PHOTO_BUCKET} from '@/lib/storage';
import {failure} from '@/lib/security';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params,db=await memberDatabase();
 const {data:photo,error}=await db.from('church_photos').select('object_key,mime').eq('id',id).maybeSingle();databaseError(error);
 if(!photo)return new Response('Não encontrado',{status:404});
 const {data:object,error:downloadError}=await db.storage.from(PHOTO_BUCKET).download(photo.object_key);
 if(downloadError||!object)return new Response('Não encontrado',{status:404});
 return new Response(object,{headers:{'Content-Type':photo.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}catch(e){return failure(e);}}
