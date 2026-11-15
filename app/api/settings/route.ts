import {memberDatabase,publicDatabase,databaseError} from '@/lib/storage';
import {authorize,requireOwner,failure,json,ApiError} from '@/lib/security';
import {defaults} from '@/lib/church-settings';
import {z} from 'zod';
export const dynamic='force-dynamic';
const url=(hosts:string[])=>z.string().max(500).refine(value=>{if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return false;}},'Use um link HTTPS válido do serviço.');
const schema=z.object({address:z.string().trim().min(5).max(240),mapsUrl:url(['google.com','google.com.br','share.google','maps.app.goo.gl']).refine(Boolean,'Informe o link do mapa.'),whatsapp:z.string().regex(/^(?:[0-9]{10,15})?$/,'Use o código do país, DDD e número, apenas dígitos.'),instagram:url(['instagram.com']),services:z.array(z.object({name:z.string().trim().min(1).max(80),day:z.string().trim().min(1).max(30),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)})).min(1).max(10),notice:z.object({enabled:z.boolean(),title:z.string().trim().max(100),message:z.string().trim().max(600),expiresAt:z.string().refine(v=>!v||(!Number.isNaN(Date.parse(v))&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v)),'Data de término inválida.')})}).superRefine((v,c)=>{if(v.notice.enabled&&(!v.notice.title||!v.notice.message))c.addIssue({code:'custom',message:'Preencha o título e o texto do aviso.'});});
export async function GET(request:Request){try{
 const admin=new URL(request.url).searchParams.get('admin')==='1';let stored;
 if(admin){await requireOwner();const db=await memberDatabase();const {data,error}=await db.from('church_settings').select('value').eq('id','church').maybeSingle();databaseError(error);stored=data?.value;}
 else {const {data,error}=await publicDatabase().rpc('church_public_settings');databaseError(error);stored=data;}
 return json(stored?schema.parse(stored):structuredClone(defaults));
}catch(e){return failure(e);}}
export async function PUT(request:Request){try{
 await requireOwner(request);const raw=await request.text();if(raw.length>12000)throw new ApiError(413,'Conteúdo muito grande.');let data;try{data=JSON.parse(raw);}catch{throw new ApiError(400,'Conteúdo inválido.');}
 const parsed=schema.safeParse(data);if(!parsed.success)throw new ApiError(400,parsed.error.issues[0].message);
 const db=await memberDatabase();const {error}=await db.from('church_settings').upsert({id:'church',value:parsed.data});databaseError(error);return json(parsed.data);
}catch(e){return failure(e);}}
