# Tenda da Adoração

Site da igreja Tenda da Adoração, em Porto Velho, com galeria de fotos, eventos especiais e painel de publicação adaptado para celular.

## Recursos

- Apresentação da igreja, identidade visual e agenda de cultos regulares.
- Galeria organizada em álbuns, com abertura das fotos em destaque.
- Eventos especiais com título, descrição, data, horário e local.
- Painel em `/painel`, protegido por login próprio, sessões revogáveis e permissões validadas no servidor.
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

O login local usa as mesmas regras de autenticação da produção. Não existe usuário simulado autorizado.

O comando `npm run db:setup` aplica as migrações pendentes somente no banco local, sem apagar os dados existentes. Execute após clonar o projeto e quando houver novas migrações. No PowerShell, use `npm.cmd` se a execução de scripts estiver bloqueada.

## Publicação

A configuração `.openai/hosting.json` declara os vínculos lógicos `DB` e `BUCKET`. Sites provisiona os recursos e aplica as migrações durante a publicação. Configure `OWNER_EMAIL` e o segredo `ADMIN_SETUP_TOKEN` no ambiente de produção antes da primeira ativação. Não salve credenciais no código. O controle de quem pode visitar o site é separado da permissão para editar conteúdo no painel.

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

## Login próprio e configuração inicial

- O administrador controla contas e informações da igreja; editoras cuidam de álbuns e eventos.
- Defina OWNER_EMAIL e ADMIN_SETUP_TOKEN (32 bytes aleatórios em hexadecimal) no ambiente da hospedagem. Localmente, use .dev.vars, ignorado pelo Git. Nunca coloque tokens ou senhas no repositório.
- A primeira ativação ocorre em /administrador/configurar#TOKEN. O dono informa o e-mail configurado e escolhe a senha diretamente na tela. O token sai da URL após carregar e não pode criar outro administrador depois da ativação. Remova o segredo de configuração da hospedagem depois desse primeiro uso.
- Em Pessoas autorizadas, o administrador cria convites individuais de editora. O link expira em 48 horas e é consumido uma vez. Ele deve ser enviado pelo administrador à pessoa correta; o sistema não envia e-mail.
- Bloqueio de conta, renovação de convite e troca de senha revogam sessões. Não há cadastro público nem recuperação automática do proprietário por e-mail. Recuperação do proprietário exige manutenção autenticada do banco pela pessoa responsável pela hospedagem; não reabra o cadastro inicial.
- Senhas: scrypt N=16384, r=8, p=5 com salt aleatório; cookies HttpOnly/SameSite=Strict e Secure em HTTPS, validade absoluta de 8 horas. Tokens de sessão e convite são armazenados como SHA-256. Limites de tentativa persistem no D1.
- Execute npm.cmd run db:setup em cópias locais. A migração 0002 cria apenas tabelas de autenticação, preservando os álbuns.
- O script node scripts/test-auth-local.mjs exige banco local sem contas e cria/remove exclusivamente contas temporárias. Nunca execute esse teste após cadastrar contas reais.
- Antes de tornar a hospedagem pública, publique esta versão, configure a conta do proprietário e valide as rotas protegidas. Somente então altere o público do site.
