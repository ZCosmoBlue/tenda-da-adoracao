import { listEntries,database } from '@/lib/storage';
import { authorize,failure,json,ApiError } from '@/lib/security';
import { entryInput } from '@/lib/validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const admin=new URL(request.url).searchParams.get('admin')==='1';if(admin)await authorize();return json(await listEntries(admin));}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const user=await authorize(request);if(Number(request.headers.get('content-length'))>10000)throw new ApiError(413,'Formulário muito grande.');
 const v=entryInput(await request.json()); const id=crypto.randomUUID(),now=new Date().toISOString();
 await database().prepare('INSERT INTO entries (id,kind,title,description,date,location,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,v.kind,v.title,v.description,v.date,v.location,'draft',user.userId,now,now).run();
 return json({id});
}catch(e){return failure(e);}}
