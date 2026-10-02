import {redirect} from 'next/navigation';
import {Logout,PasswordForm} from './account-controls';
import UsersEditor from './users-editor';
import {isAdmin} from '@/lib/security';
import SettingsEditor from './settings-editor';
import Dashboard from '../painel/dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Painel | Tenda da Adoração',robots:{index:false,follow:false}};
export default async function AdminPage(){
 const user=await isAdmin();if(!user)redirect('/administrador/login');
 return <main className="admin-shell"><header className="admin-header"><a href="/" className="admin-brand">TENDA <span>DA ADORAÇÃO</span></a><div><a href="/">Ver site ↗</a><Logout/></div></header><div className="admin-intro"><span className="eyebrow">PAINEL DA IGREJA</span><h1>Histórias e encontros.</h1><p>Publique fotos e organize os próximos eventos.</p><small>Conectado como {user.email}</small></div><Dashboard/>{user.role==='owner'&&<><SettingsEditor/><UsersEditor/></>}<PasswordForm/></main>;
}
