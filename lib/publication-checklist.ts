import type {Entry} from './models';
export function publicationChecklist(entry:Entry,pendingCount:number){
 const items=[{field:'title',label:'Título da publicação',ready:entry.title.trim().length>0}];
 if(entry.kind==='album')items.push({field:'photos',label:'Pelo menos uma foto',ready:entry.photos.length+pendingCount>0});
 if(entry.kind==='event')items.push({field:'date',label:'Data e horário do evento',ready:!!entry.date&&Number.isFinite(Date.parse(entry.date))},{field:'location',label:'Local do evento',ready:entry.location.trim().length>0});
 items.push({field:'photos',label:'Limite de 40 fotos',ready:entry.photos.length+pendingCount<=40});
 return items;
}
