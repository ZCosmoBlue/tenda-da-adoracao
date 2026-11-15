# Migração dos acessos para Supabase

Projeto da igreja: `auxerealyxqvyecmueor`.

## Etapa atual

O proprietário criou a tabela `church_members` com RLS e vinculou sua conta Auth à função `owner`. O código contém integração de login, renovação de cookies, verificação de sessão, logout, alteração de senha e autorização/bloqueio de editoras. A ativação é explícita por `AUTH_PROVIDER=supabase`; sem essa variável, permanece o acesso anterior. Não há fallback para o login antigo quando Supabase está ativo.

Antes de ativar, execute `supabase/setup-access.sql` no SQL Editor do projeto correto. Ele preserva contas e senhas e cria funções de acesso. O resultado final deve conter quatro funções públicas, sem permissão de execução para `anon` e com execução para `authenticated`. As funções privilegiadas ficam no esquema não exposto `church_private`, verificando usuário, sessão atual, e-mail confirmado e permissão atual no banco.

## Configuração local e hospedagem

Defina em `.dev.vars` local ou no ambiente da hospedagem:

```dotenv
AUTH_PROVIDER=supabase
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

Não use chave secreta/service_role no navegador. A implementação usa somente a chave publicável e a sessão da pessoa autenticada. Reinicie o servidor após alterar as variáveis. No modo Supabase, links de ativação antigos retornam 410 e o cookie antigo não autoriza o painel.

## Homologação necessária

1. Entrar com a senha definida em Authentication / Users, sem compartilhá-la no chat.
2. Confirmar que o proprietário vê configurações e pessoas autorizadas.
3. Cadastrar uma conta de editora no Auth e autorizar seu e-mail no painel. Nesta etapa, a criação da conta Auth é feita no Supabase; o botão do site autoriza uma conta existente e não envia convite por e-mail.
4. Confirmar que a editora publica, mas não gerencia contas/configurações.
5. Bloquear a editora e verificar que sua sessão perde acesso. Reativá-la exige novo login.
6. Testar logout, renovação de sessão e troca de senha; não apenas a compilação.
7. Só depois arquivar a configuração antiga. Não excluir contas nem banco antes de backup.

## Limites desta etapa

Álbuns, eventos, configurações e contadores de tentativas ainda usam D1; fotos ainda usam R2. Essa etapa migra os acessos, não conclui a migração de dados/arquivos. A recuperação por e-mail e os convites automáticos precisam de configuração e testes próprios. Não publicar como migração completa.

Verificações locais: `node scripts/test-supabase-access.mjs`, `node node_modules/typescript/bin/tsc --noEmit`, `npm.cmd run build`. Os testes locais não substituem a execução do SQL e a homologação com contas reais.
