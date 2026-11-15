import {supabaseServer} from './supabase-server';
import {ApiError} from './security';

export async function listSupabaseMembers(){
 const {client}=await supabaseServer();
 const {data,error}=await client.rpc('church_list_members');
 if(error)throw new ApiError(503,'Não foi possível carregar as permissões do Supabase.');
 return data.map((row:{enabled:boolean})=>({...row,enabled:Number(row.enabled),activated:1}));
}
export async function addSupabaseEditor(email:string,name:string){
 const {client}=await supabaseServer();
 const {error}=await client.rpc('church_authorize_editor',{editor_email:email,editor_name:name});
 if(error)throw new ApiError(400,error.code==='23505'?'Esta conta já está autorizada.':'Não foi possível autorizar. Confira se a conta já foi criada em Authentication → Users no Supabase.');
}
export async function setSupabaseEditor(id:string,enabled:boolean){
 const {client}=await supabaseServer();
 const {error}=await client.rpc('church_set_editor_access',{editor_id:id,allow_access:enabled});
 if(error)throw new ApiError(400,'Não foi possível atualizar essa conta de editora.');
}
