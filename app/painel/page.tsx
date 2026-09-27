import { requireChatGPTUser,chatGPTSignOutPath } from '../chatgpt-auth';
import {isAdmin} from '@/lib/security';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Painel | Tenda da Adoração',robots:{index:false,follow:false}};
export default async function AdminPage(){
 const user=await requireChatGPTUser('/painel');
 if(!await isAdmin())return <main className="admin-shell"><a href="/">← Voltar ao site</a><h1>Acesso restrito</h1><p>Esta conta não está autorizada a publicar. Entre com a conta do administrador da igreja.</p><a className="action" href={chatGPTSignOutPath('/painel')} target="_top">Trocar de conta</a></main>;
 return <main className="admin-shell"><header className="admin-header"><a href="/" className="admin-brand">TENDA <span>DA ADORAÇÃO</span></a><div><a href="/">Ver site ↗</a><a href={chatGPTSignOutPath('/')} target="_top">Sair</a></div></header><div className="admin-intro"><span className="eyebrow">PAINEL DA IGREJA</span><h1>Histórias e encontros.</h1><p>Publique fotos e organize os próximos eventos.</p><small>Conectado como {user.email}</small></div><Dashboard/></main>;
}
