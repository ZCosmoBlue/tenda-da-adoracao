import {listEntries,memberDatabase,databaseError} from '@/lib/storage';
import {authorize,failure,json,ApiError} from '@/lib/security';
import {entryInput} from '@/lib/validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const admin=new URL(request.url).searchParams.get('admin')==='1';if(admin)await authorize();return json(await listEntries(admin));}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const user=await authorize(request);
 const raw=await request.text();if(raw.length>10000)throw new ApiError(413,'Formulário muito grande.');
 const v=entryInput(JSON.parse(raw)),db=await memberDatabase();
 const {data,error}=await db.from('church_entries').insert({...v,date:v.date||null,status:'draft',created_by:user.userId}).select('id').single();
 databaseError(error);return json(data);
}catch(e){return failure(e);}}
