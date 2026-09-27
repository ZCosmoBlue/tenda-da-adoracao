import {database} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
import {entryInput} from '@/lib/validation';
type Context={params:Promise<{id:string}>};
export async function PUT(request:Request,{params}:Context){try{
 await authorize(request);const {id}=await params;const v=entryInput(await request.json());const db=database();
 const old=await db.prepare('SELECT kind FROM entries WHERE id=?').bind(id).first<{kind:string}>();if(!old)throw new ApiError(404,'Publicação não encontrada.');
 if(old.kind!==v.kind)throw new ApiError(400,'O tipo da publicação não pode mudar.');
 if(v.kind==='album'&&v.status==='published') {const count=await db.prepare('SELECT COUNT(*) AS n FROM photos WHERE entry_id=?').bind(id).first<{n:number}>();if(!count?.n)throw new ApiError(400,'Adicione pelo menos uma foto antes de publicar o álbum.');}
 await db.prepare('UPDATE entries SET title=?,description=?,date=?,location=?,status=?,updated_at=? WHERE id=?').bind(v.title,v.description,v.date,v.location,v.status,new Date().toISOString(),id).run();return json({id});
}catch(e){return failure(e);}}
