import {memberDatabase,databaseError,PHOTO_BUCKET} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request);const {id}=await params,db=await memberDatabase();
 const {data:entry,error:entryError}=await db.from('church_entries').select('id').eq('id',id).maybeSingle();databaseError(entryError);
 if(!entry)throw new ApiError(404,'Publicação não encontrada.');
 if(Number(request.headers.get('content-length'))>9*1024*1024)throw new ApiError(413,'Cada imagem pode ter até 8 MB.');
 const form=await request.formData(),file=form.get('file');
 if(!(file instanceof File)||file.size===0||file.size>8*1024*1024)throw new ApiError(400,'Escolha uma imagem de até 8 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const mime=jpeg?'image/jpeg':png?'image/png':webp?'image/webp':'';
 if(!mime)throw new ApiError(400,'Use fotos JPG, PNG ou WebP.');
 const photoId=crypto.randomUUID(),key=id+'/'+photoId,store=db.storage.from(PHOTO_BUCKET);
 const {error:uploadError}=await store.upload(key,bytes,{contentType:mime,upsert:false,cacheControl:'0'});
 if(uploadError)throw new ApiError(503,'Não foi possível enviar a foto. Verifique o armazenamento e tente novamente.');
 const {error}=await db.from('church_photos').insert({id:photoId,entry_id:id,object_key:key,mime,size:file.size,caption:String(form.get('caption')??'').slice(0,240)});
 if(error){const {error:cleanupError}=await store.remove([key]);if(cleanupError)console.error('Photo upload cleanup failed');databaseError(error);}
 return json({id:photoId});
}catch(e){return failure(e);}}
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request);const {id}=await params;const raw=await request.text();if(raw.length>30000)throw new ApiError(413,'Lista muito grande.');
 const data=JSON.parse(raw) as {photos?:{id:string;caption:string}[]};
 if(!Array.isArray(data.photos)||data.photos.length>40||data.photos.some(p=>!p||typeof p.id!=='string'||typeof p.caption!=='string'||p.caption.length>240))throw new ApiError(400,'Fotos ou legendas inválidas.');
 const db=await memberDatabase();const {error}=await db.rpc('church_reorder_photos',{target_entry:id,items:data.photos});databaseError(error);return json({ok:true});
}catch(e){return failure(e);}}
