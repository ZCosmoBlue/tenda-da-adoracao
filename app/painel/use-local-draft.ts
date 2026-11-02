'use client';
import {useEffect,useRef,useState} from 'react';
import type {Entry} from '@/lib/models';
import {draftContent,readLocalDraft,type LocalPublicationDraft} from '@/lib/local-publication-draft';

export function useLocalDraft(userId:string,editing:Entry|null,pendingCount:number){
 const key='tenda:publication-draft:v1:'+userId;
 const [recovery,setRecovery]=useState<LocalPublicationDraft|null>(null);
 const [ready,setReady]=useState(false);
 const [message,setMessage]=useState('');
 const baseline=useRef('');
 useEffect(()=>{try{setRecovery(readLocalDraft(localStorage.getItem(key)));}catch{setMessage('O navegador não permite guardar rascunhos neste dispositivo.');}setReady(true);},[key]);
 useEffect(()=>{
  if(!ready||!editing)return;
  const content=draftContent(editing,pendingCount);
  if(JSON.stringify(content)===baseline.current)return;
  try{localStorage.setItem(key,JSON.stringify({version:1,savedAt:new Date().toISOString(),...content}));setMessage('Rascunho salvo neste dispositivo. Fotos ainda não enviadas, ordem e legendas não são recuperadas automaticamente.');}
  catch{setMessage('Não foi possível guardar o rascunho neste dispositivo. Use Salvar rascunho para enviar ao servidor.');}
 },[key,editing,pendingCount,ready]);
 function clear(savedEntry:Entry|null=null){
  baseline.current=savedEntry?JSON.stringify(draftContent(savedEntry,0)):'';
  try{localStorage.removeItem(key);setRecovery(null);setMessage(savedEntry?'Rascunho salvo no servidor.':'');return true;}
  catch{setMessage('Não foi possível remover o rascunho local. Verifique as permissões de armazenamento do navegador.');return false;}
 }
 return {recovery,ready,message,clear,dismiss:()=>setRecovery(null)};
}
