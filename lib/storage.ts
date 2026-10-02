import { env } from 'cloudflare:workers';
import type { Entry, Photo } from './models';
export function database(){if(!env.DB) throw new Error('Database unavailable');return env.DB;}
export function bucket(){if(!env.BUCKET) throw new Error('Storage unavailable');return env.BUCKET;}
export async function listEntries(admin=false):Promise<Entry[]> {
 const db=database();
 const rows=await db.prepare(`SELECT * FROM entries ${admin?'':"WHERE status IN ('published','ended')"} ORDER BY created_at DESC LIMIT 200`).all<Entry>();
 const pics=await db.prepare(`SELECT p.id,p.entry_id,p.caption,p.created_at FROM photos p JOIN entries e ON e.id=p.entry_id ${admin?'':"WHERE e.status IN ('published','ended')"} ORDER BY p.sort_order ASC,p.created_at ASC,p.id ASC`).all<Photo>();
 return rows.results.map(row=>({...row,photos:pics.results.filter(p=>p.entry_id===row.id)}));
}
