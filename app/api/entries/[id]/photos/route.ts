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
 try{await db.prepare('INSERT INTO photos (id,entry_id,object_key,mime,size,caption,created_at,sort_order) VALUES (?,?,?,?,?,?,?,?)').bind(photoId,id,key,mime,file.size,caption,now,(await db.prepare('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM photos WHERE entry_id=?').bind(id).first<{n:number}>())?.n??0).run();}catch(e){await store.delete(key);throw e;}
 return json({id:photoId});
}catch(e){return failure(e);}}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{await authorize(request);const {id}=await params;const data=await request.json() as {photos?:{id:string;caption:string}[]};if(!Array.isArray(data.photos)||data.photos.length>40||data.photos.some(p=>!p||typeof p.id!=='string'||typeof p.caption!=='string'||p.caption.length>240))throw new ApiError(400,'Fotos ou legendas inválidas.');const db=database();if(!await db.prepare('SELECT id FROM entries WHERE id=?').bind(id).first())throw new ApiError(404,'Publicação não encontrada.');const rows=await db.prepare('SELECT id FROM photos WHERE entry_id=?').bind(id).all<{id:string}>();const ids=new Set(data.photos.map(p=>p.id));if(ids.size!==rows.results.length||data.photos.length!==ids.size||rows.results.some(p=>!ids.has(p.id)))throw new ApiError(409,'A lista de fotos mudou. Reabra a edição para atualizar.');if(data.photos.length)await db.batch(data.photos.map((p,i)=>db.prepare('UPDATE photos SET caption=?,sort_order=? WHERE id=? AND entry_id=?').bind(p.caption,i,p.id,id)));return json({ok:true});}catch(e){return failure(e);}}
