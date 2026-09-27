import {database,bucket} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request);const {id}=await params;const db=database();
 const photo=await db.prepare('SELECT object_key FROM photos WHERE id=?').bind(id).first<{object_key:string}>();if(!photo)throw new ApiError(404,'Foto não encontrada.');
 await bucket().delete(photo.object_key);await db.prepare('DELETE FROM photos WHERE id=?').bind(id).run();return json({ok:true});
}catch(e){return failure(e);}}
