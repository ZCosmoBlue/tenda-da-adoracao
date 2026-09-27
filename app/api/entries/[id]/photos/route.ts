import {database,bucket} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request); const {id}=await params;const db=database();
 if(!await db.prepare('SELECT id FROM entries WHERE id=?').bind(id).first())throw new ApiError(404,'Publicação não encontrada.');
 if(Number(request.headers.get('content-length'))>9*1024*1024)throw new ApiError(413,'Cada imagem pode ter até 8 MB.');
 const form=await request.formData(),file=form.get('file');
 if(!(file instanceof File)||file.size===0||file.size>8*1024*1024)throw new ApiError(400,'Escolha uma imagem de até 8 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const mime=jpeg?'image/jpeg':png?'image/png':webp?'image/webp':'';
 if(!mime)throw new ApiError(400,'Use fotos JPG, PNG ou WebP.');
 const count=await db.prepare('SELECT COUNT(*) AS n FROM photos WHERE entry_id=?').bind(id).first<{n:number}>();if((count?.n??0)>=40)throw new ApiError(400,'Cada publicação permite até 40 fotos.');
 const photoId=crypto.randomUUID(),key=`photos/${photoId}`,caption=String(form.get('caption')??'').slice(0,240),now=new Date().toISOString();
 const store=bucket();await store.put(key,bytes,{httpMetadata:{contentType:mime}});
 try{await db.prepare('INSERT INTO photos (id,entry_id,object_key,mime,size,caption,created_at) VALUES (?,?,?,?,?,?,?)').bind(photoId,id,key,mime,file.size,caption,now).run();}catch(e){await store.delete(key);throw e;}
 return json({id:photoId});
}catch(e){return failure(e);}}
