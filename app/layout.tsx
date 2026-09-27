import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Tenda da Adoração | Uma igreja reestruturando famílias',description:'Conheça a Tenda da Adoração em Porto Velho. Cultos, eventos especiais e fotos da nossa comunidade.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
