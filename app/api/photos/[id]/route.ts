import {memberDatabase,databaseError,PHOTO_BUCKET} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request);const {id}=await params,db=await memberDatabase();
 const {data:photo,error}=await db.from('church_photos').select('object_key').eq('id',id).maybeSingle();databaseError(error);
 if(!photo)throw new ApiError(404,'Foto não encontrada.');
 const {error:removeError}=await db.storage.from(PHOTO_BUCKET).remove([photo.object_key]);
 if(removeError)throw new ApiError(503,'Não foi possível excluir a foto. Tente novamente.');
 const {error:deleteError}=await db.from('church_photos').delete().eq('id',id);databaseError(deleteError);return json({ok:true});
}catch(e){return failure(e);}}
