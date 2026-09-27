import { ApiError } from './security';
export function entryInput(input:Record<string,unknown>){
 const str=(key:string,max:number)=>{const v=input[key];if(typeof v!=='string'||v.length>max)throw new ApiError(400,'Revise os campos do formulário.');return v.trim();};
 const title=str('title',120),description=str('description',3000),location=str('location',240),date=str('date',35);
 if(!title)throw new ApiError(400,'Informe um título.');
 if(!['album','event'].includes(String(input.kind)))throw new ApiError(400,'Tipo de publicação inválido.');
 if(!['draft','published','ended','archived'].includes(String(input.status)))throw new ApiError(400,'Estado de publicação inválido.');
 if(input.kind==='event' && (!date || !Number.isFinite(Date.parse(date)) || !/[+-]\d\d:\d\d$|Z$/.test(date)))throw new ApiError(400,'Informe a data e o horário do evento.');
 if(input.kind==='event' && !location)throw new ApiError(400,'Informe o local do evento.');
 return {title,description,location,date:input.kind==='event'?new Date(date).toISOString():'',kind:String(input.kind),status:String(input.status)};
}
