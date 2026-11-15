import {memberDatabase,databaseError} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
import {entryInput} from '@/lib/validation';
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 await authorize(request);const {id}=await params;const raw=await request.text();if(raw.length>10000)throw new ApiError(413,'Formulário muito grande.');
 const v=entryInput(JSON.parse(raw)),db=await memberDatabase();
 const {data:old,error:readError}=await db.from('church_entries').select('kind').eq('id',id).maybeSingle();databaseError(readError);
 if(!old)throw new ApiError(404,'Publicação não encontrada.');
 if(old.kind!==v.kind)throw new ApiError(400,'O tipo da publicação não pode mudar.');
 const {data,error}=await db.from('church_entries').update({title:v.title,description:v.description,date:v.date||null,location:v.location,status:v.status}).eq('id',id).select('id').maybeSingle();
 databaseError(error);if(!data)throw new ApiError(404,'Publicação não encontrada.');return json(data);
}catch(e){return failure(e);}}
