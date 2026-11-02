import type {ChurchSettings} from '@/lib/church-settings';

export default function FirstVisit({settings}:{settings:ChurchSettings}){
 return <section className="section first-visit" id="primeira-visita" aria-labelledby="visit-title">
  <div className="section-label"><span className="line"/> SUA PRIMEIRA VEZ NA TENDA</div>
  <div className="visit-grid">
   <div className="visit-intro"><h2 id="visit-title">Pode chegar.<br/><em>Há lugar para você.</em></h2><p>Conheça nossos encontros e escolha um dia para estar com a gente. Você e sua família são bem-vindos.</p><a className="button light" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">Abrir localização <span aria-hidden="true">↗</span></a>{settings.whatsapp&&<a className="visit-contact" href={'https://wa.me/'+settings.whatsapp} target="_blank" rel="noopener noreferrer">Tire suas dúvidas pelo WhatsApp ↗</a>}</div>
   <div className="visit-guide">
    <article><span aria-hidden="true">01</span><div><h3>Escolha seu encontro</h3><ul>{settings.services.map((service,i)=><li key={i}><strong>{service.name}</strong><span>{service.day} · {service.time.replace(':','h')}</span></li>)}</ul><p className="visit-timezone">Horários de Porto Velho.</p></div></article>
    <article><span aria-hidden="true">02</span><div><h3>Encontre a Tenda</h3><address>{settings.address}</address><p>Abra a localização para planejar seu caminho até a igreja.</p></div></article>
    <article><span aria-hidden="true">03</span><div><h3>Venha conhecer a comunidade</h3><p>Um convite para adorar a Deus, fortalecer a fé e compartilhar momentos em família.</p><a href="#galeria">Conheça nossos momentos <span aria-hidden="true">→</span></a></div></article>
   </div>
  </div>
 </section>;
}
