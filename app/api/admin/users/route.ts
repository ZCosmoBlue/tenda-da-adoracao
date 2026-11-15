import {z} from 'zod';
import {requireOwner,failure,json} from '@/lib/security';
import {input,emailInput,limit} from '@/lib/auth-input';
import {listSupabaseMembers,addSupabaseEditor,setSupabaseEditor} from '@/lib/supabase-members';
export async function GET(){try{await requireOwner();return json(await listSupabaseMembers());}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const owner=await requireOwner(request);await limit('invite:'+owner.userId,20);
 const data=await input(request,z.object({email:emailInput,name:z.string().trim().min(1).max(80)}));
 await addSupabaseEditor(data.email,data.name);return json({ok:true});
}catch(e){return failure(e);}}
export async function PATCH(request:Request){try{
 const owner=await requireOwner(request);await limit('users:'+owner.userId,40);
 const data=await input(request,z.object({id:z.string().uuid(),action:z.enum(['disable','enable'])}));
 await setSupabaseEditor(data.id,data.action==='enable');return json({ok:true});
}catch(e){return failure(e);}}
