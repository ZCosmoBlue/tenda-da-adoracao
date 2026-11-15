# Supabase — Tenda da Adoração

Projeto: `auxerealyxqvyecmueor`.

## Serviços em uso

- Auth: login exclusivo, cookies HttpOnly, renovação de sessão, logout e troca de senha.
- Postgres: church_members, church_entries, church_photos, church_settings.
- Storage: bucket privado church-photos, imagens JPG/PNG/WebP de até 8 MB; o painel compacta antes do envio.
- Limites de ações administrativas: church_private.request_limits, sem acesso direto por visitantes ou usuários. Login usa os limites do Supabase Auth.

O código não usa mais D1 ou R2. O banco local antigo foi preservado para consulta/backup, mas não é a fonte de conteúdo. Na migração, havia zero álbuns/fotos locais; as configurações da igreja foram copiadas sem sobrescrever dados existentes no destino. Isso não representa migração automática de conteúdo de outras hospedagens.

## Configuração

Em .dev.vars local e no ambiente da hospedagem:

```dotenv
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

A implementação usa a chave publicável e a sessão do usuário, sem service_role. Não há seleção de provedor nem retorno ao login antigo. As contas precisam existir no Supabase Auth e ter church_members ativo. O botão Autorizar editora permite autorizar uma conta já criada em Authentication → Users; não envia convite automaticamente.

## Permissões

RLS e privilégios limitam leitura pública a publicações publicadas/encerradas. Rascunhos e arquivos de rascunhos exigem uma sessão válida de membro autorizado. Somente owner modifica configurações e gerencia editoras. O servidor e as funções consultam a permissão atual e auth.sessions; user_metadata não autoriza ações.

A lista de fotos é reordenada em uma transação; listas desatualizadas são recusadas. O limite de 40 fotos é verificado no banco com bloqueio da publicação, incluindo inserções concorrentes. Avisos desativados/expirados são removidos do retorno público das configurações.

## SQL aplicado

- setup-access.sql: funções de acesso sobre church_members já criado.
- setup-content.sql: fonte da migração remota church_content_and_private_storage. Executar apenas uma vez em uma base preparada; já aplicado neste projeto.
- restrict-internal-helper.sql: remove execução pública do helper interno rls_auto_enable.
- test-content-rls.sql: testes com contas, sessões e conteúdo temporários dentro de uma transação desfeita com ROLLBACK. Não deixa dados de teste.

## Verificações em 15/11/2026

Tipos, compilação, teste unitário de autorização e simulação de deploy passaram. Testes reais no Postgres confirmaram privacidade de rascunhos, leitura pública de publicações, políticas de Storage, limites de editoras, bloqueio, sessão revogada, limite de fotos, reordenação e edição de configurações pelo proprietário. Fixtures foram revertidas.

O proprietário confirmou entrada no painel, envio de foto e exclusão da foto pelo painel. Ainda falta homologar todos os fluxos visuais em celular, recuperação por e-mail, convite automático e comportamento de renovação prolongada de sessão.

O advisor mantém aviso sobre proteção contra senhas vazadas desativada. Não foi alterado o plano nem contratado recurso pago. A informação de RLS sem política em request_limits é intencional: só a função privada controlada acessa a tabela.
