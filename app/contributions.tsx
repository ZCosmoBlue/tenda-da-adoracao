'use client';
import {useState} from 'react';

const contributions=[
 {title:'Dízimos e ofertas',description:'Contribuindo para o reino de Deus.',type:'CNPJ',display:'10.858.463/0001-42',key:'10858463000142'},
 {title:'Construção',description:'Apoiando a edificação da nossa igreja.',type:'E-mail',display:'tendasaofranciscopvh@gmail.com',key:'tendasaofranciscopvh@gmail.com'},
 {title:'Eventos diversos',description:'Participando e apoiando nossas atividades.',type:'E-mail',display:'m.t.a.pvh2@gmail.com',key:'m.t.a.pvh2@gmail.com'},
 {title:'Primícias',description:'Agradecendo os primeiros frutos.',type:'Telefone',display:'(69) 99291-9550',key:'+5569992919550'},
];

export default function Contributions(){
 const [feedback,setFeedback]=useState('');
 async function copy(key:string,title:string){try{await navigator.clipboard.writeText(key);setFeedback('Chave de '+title+' copiada. Cole no aplicativo do seu banco.');}catch{setFeedback('Não foi possível copiar automaticamente. Selecione e copie a chave exibida abaixo da finalidade escolhida.');}}
 return <section className="section contributions" id="contribua" aria-labelledby="contributions-title"><div className="section-label"><span className="line"/> CONTRIBUIÇÕES E DOAÇÕES</div><div className="family-heading"><h2 id="contributions-title">Generosidade que<br/><em>faz parte da nossa história.</em></h2><p>Escolha a finalidade<br/>da sua contribuição.</p></div><div className="contribution-grid">{contributions.map((item,index)=><article className="contribution-card" key={item.key}><span className="contribution-number" aria-hidden="true">0{index+1}</span><h3>{item.title}</h3><p>{item.description}</p><dl><dt>Chave Pix · {item.type}</dt><dd>{item.display}</dd></dl><button type="button" className="button contribution-copy" onClick={()=>void copy(item.key,item.title)} aria-label={'Copiar chave Pix de '+item.title}>Copiar chave Pix <span aria-hidden="true">↗</span></button></article>)}</div><p className="pix-feedback" role="status" aria-live="polite">{feedback}</p><p className="pix-note">No aplicativo do seu banco, escolha Pix, cole a chave e informe o valor. Confira o nome do favorecido e os dados antes de confirmar. O site não realiza pagamentos nem confirma o recebimento das contribuições.</p></section>;
}
