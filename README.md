# Tenda da Adoração

Site da igreja em Porto Velho, com eventos, galeria, contribuições Pix e painel em `/administrador`.

## Acesso atual

O login usa exclusivamente Supabase Auth. Cada conta precisa também de um registro ativo em `church_members`, com função `owner` ou `editor`. Criar uma conta no Auth não concede acesso automaticamente. A verificação no servidor consulta a sessão e a permissão atual no banco; metadados editáveis do usuário não concedem privilégios.

O administrador gerencia informações e autorizações. Editoras cuidam das publicações. Nesta etapa, as contas são cadastradas em Authentication → Users no Supabase, e seus e-mails são autorizados no painel. Os links antigos de configuração e ativação estão desativados. Não há recuperação automática por e-mail implementada na interface do site ainda.

Veja `SUPABASE.md` e `supabase/setup-access.sql`. A configuração usa apenas `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`, em `.dev.vars` local e no ambiente da hospedagem. Nunca envie senhas ou chaves secretas ao GitHub.

## Desenvolvimento

Requer Node.js >=22.13.

```powershell
npm.cmd ci
npm.cmd run dev
```

O conteúdo e as fotos usam Supabase Postgres e Storage. D1 e R2 não são necessários. As fontes SQL aplicadas e os testes estão em supabase/. Veja SUPABASE.md.

## Recursos

Álbuns e eventos com rascunhos, prévia, checklist, duplicação, organização de fotos, capas, legendas e exclusão com confirmação. Rascunhos locais recuperam textos, não arquivos ainda não enviados. Informações da igreja e avisos são editáveis pelo proprietário.

## Validação

```powershell
node scripts/test-supabase-access.mjs
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build
```

A homologação com proprietário/editora e a renovação de sessão devem ser verificadas com contas autorizadas. Testes unitários e build não substituem essa validação.

## Publicação

A publicação está pausada. Login, dados e fotos usam Supabase. O proprietário confirmou login, envio e exclusão de foto. A revisão final no celular e a publicação ainda estão pendentes. Consulte `LANCAMENTO.md` e `CLOUDFLARE.md`. Atualizar o GitHub não publica automaticamente na hospedagem.
