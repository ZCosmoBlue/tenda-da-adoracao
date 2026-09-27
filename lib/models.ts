export type Photo = {id:string; entry_id:string; caption:string; created_at:string};
export type Entry = {id:string; kind:'album'|'event'; title:string; description:string; date:string; location:string; status:'draft'|'published'|'ended'|'archived'; created_at:string; updated_at:string; photos:Photo[]};
export function dateLabel(value:string) {
 if(!value) return '';
 return new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short',timeZone:'America/Porto_Velho'}).format(new Date(value));
}
