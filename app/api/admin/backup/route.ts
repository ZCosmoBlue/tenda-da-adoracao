import {requireOwner,failure} from '@/lib/security';
import {memberDatabase} from '@/lib/storage';
import {createContentBackup} from '@/lib/content-backup';
export async function POST(request:Request){try{
 await requireOwner(request);
 const backup=await createContentBackup(await memberDatabase());
 return Response.json(backup,{headers:{'Cache-Control':'private, no-store','Content-Disposition':`attachment; filename="tenda-backup-${backup.created_at.slice(0,10)}.json"`,'X-Content-Type-Options':'nosniff'}});
}catch(error){return failure(error);}}
