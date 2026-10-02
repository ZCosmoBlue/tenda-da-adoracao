import {database} from '@/lib/storage';
import {checkOrigin,failure,json} from '@/lib/security';
import {sessionToken,sessionCookie} from '@/lib/auth';
import {digest} from '@/lib/password';
export async function POST(request:Request){try{checkOrigin(request);const token=sessionToken(request.headers.get('cookie'));if(token)await database().prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(digest(token)).run();const response=json({ok:true});response.headers.set('Set-Cookie',sessionCookie(request,'',0));return response;}catch(e){return failure(e);}}
