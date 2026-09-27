import {database,bucket} from '@/lib/storage';
import {isAdmin,failure} from '@/lib/security';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;const photo=await database().prepare('SELECT p.object_key,p.mime,e.status FROM photos p JOIN entries e ON e.id=p.entry_id WHERE p.id=?').bind(id).first<{object_key:string;mime:string;status:string}>();
 if(!photo||(!['published','ended'].includes(photo.status)&&!await isAdmin()))return new Response('Não encontrado',{status:404});
 const object=await bucket().get(photo.object_key);if(!object)return new Response('Não encontrado',{status:404});
 return new Response(object.body,{headers:{'Content-Type':photo.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}catch(e){return failure(e);}}
