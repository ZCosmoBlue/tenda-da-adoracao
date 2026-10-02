# Tenda da Adoração

Site da igreja Tenda da Adoração, em Porto Velho, com galeria de fotos, eventos especiais e painel de publicação adaptado para celular.

## Recursos

- Apresentação da igreja, identidade visual e agenda de cultos regulares.
- Galeria organizada em álbuns, com abertura das fotos em destaque.
- Eventos especiais com título, descrição, data, horário e local.
- Painel em `/painel`, protegido por login com ChatGPT e lista de administradores validada no servidor.
- Rascunhos, publicação, edição, encerramento de eventos e arquivamento.
- Upload de múltiplas fotos, compactação no navegador e armazenamento persistente.
- Validação de imagens e bloqueio de gravações anônimas ou de origem diferente.

## Tecnologias

TypeScript, React, Vinext/Vite, componentes Shadcn, Cloudflare Workers, D1 (dados) e R2 (imagens). A hospedagem usa Sites.

## Desenvolvimento

Requer Node.js 22.13 ou superior.

```sh
npm ci
npm run dev
```

A configuração de execução portátil é aplicada pelo helper do Sites. Use `.dev.vars` (ignorado pelo Git) para `ADMIN_EMAILS`, uma lista separada por vírgulas dos e-mails autorizados. Em desenvolvimento portátil, o login simulado usa `seedy@sites.test`; esse usuário não é permitido em produção a menos que seja configurado explicitamente.

O comando `npm run db:setup` aplica as migrações pendentes somente no banco local, sem apagar os dados existentes. Execute após clonar o projeto e quando houver novas migrações. No PowerShell, use `npm.cmd` se a execução de scripts estiver bloqueada.

## Publicação

A configuração `.openai/hosting.json` declara os vínculos lógicos `DB` e `BUCKET`. Sites provisiona os recursos e aplica as migrações durante a publicação. Configure `ADMIN_EMAILS` no ambiente de produção, como segredo. Não salve credenciais no código. O controle de quem pode visitar o site é separado da permissão para editar conteúdo no painel.

## Estrutura

- `app/page.tsx`: página institucional.
- `app/community.tsx`: eventos e galeria.
- `app/painel/`: painel protegido.
- `app/api/`: operações de dados e imagens.
- `lib/`: autorização, validação, tipos e acesso aos dados.
- `db/schema.ts` e `drizzle/`: esquema e migrações.
- `public/`: logo e favicon.

## Validação

Verificação de tipos e compilação de produção. Fluxos de criação, publicação e arquivamento testados com banco local. Upload e exibição de álbum testados no navegador. Acesso anônimo ao painel de dados e gravação de origem diferente bloqueados em testes locais.

O logo e a identidade da igreja pertencem aos respectivos titulares.

## Administração de conteúdo

Em `/administrador`, a primeira foto define a capa. Use os botões de ordem e os campos de legenda, depois salve a publicação. A seção Informações e avisos edita endereço, link do mapa, contatos e cultos; avisos ativos aparecem na página inicial e deixam de aparecer após o término configurado no horário de Porto Velho. Ao atualizar uma cópia local, execute `npm.cmd run db:setup` para aplicar as migrações pendentes.
