import type {Entry} from './models';

// Events have a start time, but no end time: highlight only upcoming starts.
export function upcomingEvents(entries:Entry[],now:number):Entry[]{
 return entries.filter(entry=>entry.kind==='event'&&entry.status==='published'&&Number.isFinite(Date.parse(entry.date))&&Date.parse(entry.date)>=now)
  .sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||a.id.localeCompare(b.id));
}
