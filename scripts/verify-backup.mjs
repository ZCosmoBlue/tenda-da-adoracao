import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';

const uuid=z.string().uuid();
const photo=z.object({id:uuid,entry_id:uuid,object_key:z.string(),mime:z.enum(['image/jpeg','image/png','image/webp']),size:z.number().int().positive().max(8388608),caption:z.string().max(240),sort_order:z.number().int().nonnegative(),created_at:z.string().datetime({offset:true})});
const schema=z.object({format:z.literal('tenda-content-backup'),version:z.literal(1),scope:z.literal('content-only'),created_at:z.string().datetime({offset:true}),
 entries:z.array(z.object({id:uuid,kind:z.enum(['album','event']),title:z.string().trim().min(1).max(120),description:z.string().max(3000),date:z.string().datetime({offset:true}).nullable(),location:z.string().max(240),status:z.enum(['draft','published','ended','archived']),created_at:z.string().datetime({offset:true}),updated_at:z.string().datetime({offset:true})})),
 photos:z.array(photo),settings:z.array(z.object({id:z.literal('church'),value:z.record(z.unknown())})).max(1),
 files:z.array(z.object({object_key:z.string(),mime:z.string(),size:z.number().int().positive(),sha256:z.string().regex(/^[a-f0-9]{64}$/),base64:z.string()}))});
export function verifyBackup(input){
 const data=schema.parse(input);
 const ids=new Set(data.entries.map(e=>e.id));
 if(ids.size!==data.entries.length)throw Error('Publicações duplicadas.');
 if(new Set(data.photos.map(p=>p.id)).size!==data.photos.length)throw Error('Fotos duplicadas.');
 const files=new Map(data.files.map(f=>[f.object_key,f]));
 if(files.size!==data.files.length||files.size!==data.photos.length)throw Error('Arquivos ausentes ou duplicados.');
 const counts=new Map();let total=0;
 for(const entry of data.entries)if(entry.kind==='event'&&(!entry.date||!entry.location.trim()))throw Error('Evento sem data ou local.');
 for(const p of data.photos){
  if(!ids.has(p.entry_id)||p.object_key!==p.entry_id+'/'+p.id)throw Error('Referência de foto inválida.');
  counts.set(p.entry_id,(counts.get(p.entry_id)??0)+1);if(counts.get(p.entry_id)>40)throw Error('Limite de fotos excedido.');
  const file=files.get(p.object_key);if(!file||file.mime!==p.mime||file.size!==p.size)throw Error('Metadados da foto não conferem.');
  const bytes=Buffer.from(file.base64,'base64');total+=bytes.length;
  if(total>32*1024*1024||bytes.length!==p.size||bytes.toString('base64')!==file.base64||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Foto corrompida ou backup acima do limite.');
 }
 return data;
}
const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
export function recoverySql(data){
 const rows=data.entries.map(e=>`insert into public.church_entries (id,kind,title,description,date,location,status,created_by,created_at,updated_at) values (${literal(e.id)},${literal(e.kind)},${literal(e.title)},${literal(e.description)},${e.date?literal(e.date):'null'},${literal(e.location)},'draft',null,${literal(e.created_at)},${literal(e.updated_at)}) on conflict (id) do nothing;`);
 for(const p of [...data.photos].sort((a,b)=>a.entry_id.localeCompare(b.entry_id)||a.sort_order-b.sort_order))rows.push(`insert into public.church_photos (id,entry_id,object_key,mime,size,caption,sort_order,created_at) select ${literal(p.id)},${literal(p.entry_id)},${literal(p.object_key)},${literal(p.mime)},${p.size},${literal(p.caption)},${p.sort_order},${literal(p.created_at)} where not exists (select 1 from public.church_photos where id=${literal(p.id)}) on conflict (id) do nothing;`);
 for(const s of data.settings)rows.push(`insert into public.church_settings (id,value) values ('church',${literal(JSON.stringify(s.value))}::jsonb) on conflict (id) do nothing;`);
 return '-- RESTAURAÇÃO ASSISTIDA: primeiro restaure as fotos no bucket privado church-photos.\n-- Execute inicialmente em um projeto de teste com o esquema instalado.\n-- Não sobrescreve registros existentes. Publicações novas entram como rascunho.\nBEGIN;\n'+rows.join('\n')+'\n-- Confira os resultados antes de trocar ROLLBACK por COMMIT.\nselect count(*) as publicacoes from public.church_entries;\nselect count(*) as fotos from public.church_photos;\nROLLBACK;\n';
}
async function main(){
 const [, ,filename,flag,destination]=process.argv;
 if(!filename||(flag&&flag!=='--extract')||(flag&&!destination))throw Error('Uso: node scripts/verify-backup.mjs ARQUIVO.json [--extract NOVA_PASTA]');
 const path=resolve(filename);if((await stat(path)).size>64*1024*1024)throw Error('Arquivo excede 64 MB.');
 const data=verifyBackup(JSON.parse(await readFile(path,'utf8')));
 if(flag){
  const target=resolve(destination);await mkdir(target); // Refuse an existing output directory.
  for(const file of data.files){const [folder,name]=file.object_key.split('/');await mkdir(join(target,'church-photos',folder),{recursive:true});await writeFile(join(target,'church-photos',folder,name),Buffer.from(file.base64,'base64'),{flag:'wx'});}
  await writeFile(join(target,'recovery-review.sql'),recoverySql(data),{flag:'wx'});
  await writeFile(join(target,'content.json'),JSON.stringify({...data,files:data.files.map(({base64,...file})=>file)},null,2),{flag:'wx'});
 }
 console.log(`Backup íntegro: ${data.entries.length} publicações, ${data.photos.length} fotos e ${data.settings.length} configuração. Nenhum dado remoto foi alterado.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error('Falha na verificação:',error.message);process.exitCode=1;});
