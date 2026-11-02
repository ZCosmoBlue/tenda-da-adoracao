import type {Entry} from './models';

/** Reuse event text only; dates and media must be reviewed for the new occasion. */
export function duplicateEvent(source:Entry):Entry{
 if(source.kind!=='event')throw new Error('Somente eventos podem ser duplicados.');
 return {id:'',kind:'event',title:source.title,description:source.description,location:source.location,date:'',status:'draft',photos:[],created_at:'',updated_at:''};
}
