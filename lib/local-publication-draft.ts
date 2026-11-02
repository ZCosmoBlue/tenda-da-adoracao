import type {Entry} from './models';
export type LocalPublicationDraft={version:1; savedAt:string; pendingCount:number; entry:Pick<Entry,'id'|'kind'|'title'|'description'|'date'|'location'|'updated_at'>};
export function draftContent(entry:Entry,pendingCount:number){
 const {id,kind,title,description,date,location,updated_at}=entry;
 return {entry:{id,kind,title,description,date,location,updated_at},pendingCount};
}
export function readLocalDraft(raw:string|null):LocalPublicationDraft|null{
 if(!raw||raw.length>20000)return null;
 try{const d=JSON.parse(raw);const e=d.entry;
  if(d.version!==1||!e||!['album','event'].includes(e.kind)||!Number.isInteger(d.pendingCount)||d.pendingCount<0||d.pendingCount>40||typeof d.savedAt!=='string'||!Number.isFinite(Date.parse(d.savedAt)))return null;
  for(const [key,max] of Object.entries({id:128,title:120,description:3000,date:40,location:240,updated_at:40}))if(typeof e[key]!=='string'||e[key].length>max)return null;
  if(e.date&&!Number.isFinite(Date.parse(e.date)))return null;
  return {version:1,savedAt:d.savedAt,...draftContent(e,d.pendingCount)};
 }catch{return null;}
}
