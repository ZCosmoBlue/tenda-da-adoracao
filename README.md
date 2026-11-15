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
npm.cmd run db:setup
npm.cmd run dev
```

As migrações D1 ainda são necessárias para conteúdo e limites de tentativas. As tabelas históricas de autenticação não são mais lidas para conceder acesso. O banco local teve contas/sessões legadas removidas a pedido do proprietário, sem alterar conteúdo.

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

A publicação está pausada. Login já usa Supabase; dados ainda usam D1 e fotos R2. A migração de dados e fotos para Supabase está pendente. Consulte `LANCAMENTO.md` e `CLOUDFLARE.md`. Atualizar o GitHub não publica automaticamente na hospedagem.
