import {checkOrigin,failure,ApiError} from '@/lib/security';
export async function POST(request:Request){try{
 checkOrigin(request);
 throw new ApiError(410,'O cadastro antigo foi encerrado. Entre com sua conta autorizada do Supabase.');
}catch(e){return failure(e);}}
