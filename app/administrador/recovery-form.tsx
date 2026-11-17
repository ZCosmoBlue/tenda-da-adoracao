'use client';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export default function RecoveryForm({reset=false}:{reset?:boolean}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [link,setLink]=useState<{code:string;flowId?:string}|null>(null);
 const [ready,setReady]=useState(!reset),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  if(!reset)return;
  const query=new URLSearchParams(window.location.search);
  const code=query.get('code');
  if(code&&!query.has('error'))setLink({code,flowId:query.get('sb_flow_id')??undefined});
  // Keep the one-use code only in memory, not browser history or storage.
  window.history.replaceState(null,'',window.location.pathname);
  setReady(true);
 },[reset]);
 async function submit(event:React.FormEvent){
  event.preventDefault();setError('');
  if(reset&&password!==confirm){setError('As senhas não coincidem.');return;}
  if(reset&&!link)return;
  setBusy(true);
  try{
   const response=await fetch('/api/auth/'+(reset?'reset-password':'forgot-password'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reset?{...link,password}:{email})});
   const data=await response.json() as {error?:string};
   if(!response.ok)throw new Error(data.error||'Não foi possível concluir. Tente novamente.');
   setPassword('');setConfirm('');setLink(null);setDone(true);
  }catch(error){setError(error instanceof Error?error.message:'Não foi possível concluir.');}
  finally{setBusy(false);}
 }
 return <main className="auth-shell"><a href="/" className="admin-brand">TENDA <span>DA ADORAÇÃO</span></a><section className="editor auth-card"><span className="eyebrow">ACESSO RESTRITO</span><h1>{reset?'Nova senha':'Recuperar senha'}</h1>
 {done?<div role="status"><p>{reset?'Senha alterada. Entre novamente com sua nova senha.':'Se este e-mail estiver cadastrado e puder receber mensagens, você receberá um link de recuperação. Confira também a caixa de spam.'}</p>{!reset&&<p>Abra o link neste mesmo navegador. Use somente o e-mail mais recente. Se não chegar, aguarde alguns minutos e fale com o administrador.</p>}<a className="action" href="/administrador/login">Voltar ao login</a></div>:!ready?<p role="status">Preparando formulário…</p>:reset&&!link?<div role="alert"><p>Link inválido, expirado ou já aberto. Solicite um novo link e abra no mesmo navegador em que fez o pedido.</p><a href="/administrador/recuperar-senha">Solicitar novo link</a></div>:<><p>{reset?'Escolha uma senha exclusiva com pelo menos 12 caracteres. Suas sessões serão encerradas após a alteração.':'Informe o e-mail da sua conta. Abra o link recebido neste mesmo navegador para escolher uma nova senha.'}</p><form onSubmit={submit}><fieldset disabled={busy}>{reset?<><label htmlFor="recovery-password">Nova senha</label><Input id="recovery-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/><label htmlFor="recovery-confirm">Repita a nova senha</label><Input id="recovery-confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)}/></>:<><label htmlFor="recovery-email">E-mail</label><Input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></>}<Button type="submit" disabled={busy}>{busy?'Aguarde…':reset?'Salvar nova senha':'Enviar link de recuperação'}</Button></fieldset></form></>}
 {error&&<p className="notice error" role="alert">{error}</p>}{reset&&error&&<a href="/administrador/recuperar-senha">Solicitar novo link</a>}</section>{!done&&<a href="/administrador/login">Voltar ao login</a>}</main>;
}
