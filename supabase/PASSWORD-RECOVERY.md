# Recuperação de senha

O login oferece **Esqueci minha senha** em `/administrador/recuperar-senha`.
O servidor usa `resetPasswordForEmail` com PKCE, cookies HttpOnly separados e retorno fixo em `/administrador/redefinir-senha`. O usuário deve abrir o link no mesmo navegador que iniciou a solicitação. Um novo pedido substitui o pedido anterior nesse navegador.

## Configuração no Supabase antes de liberar

Em Authentication → URL Configuration, acrescente aos Redirect URLs, preservando os existentes:

- `http://localhost:5173/administrador/redefinir-senha` (teste local)
- `https://SEU-DOMINIO/administrador/redefinir-senha` (substituir pelo domínio definitivo)

Em Authentication → Email Templates → Reset Password, mantenha o link `{{ .ConfirmationURL }}`. Não substitua por um link direto ao login ou por `.SiteURL`: o fluxo depende da confirmação e do código PKCE emitidos pelo Supabase.

Configure um SMTP próprio antes do lançamento para enviar para as contas das editoras. O serviço padrão do Supabase tem restrições de destinatários e limites baixos; não considerar recebimento pelo proprietário como prova de entrega para todos.

## Verificação real pendente

1. Solicitar recuperação pelo login com uma conta autorizada.
2. Abrir o e-mail mais recente no mesmo navegador e conferir a página de nova senha.
3. O titular deve preencher e salvar uma senha exclusiva de pelo menos 12 caracteres.
4. Confirmar entrada com a nova senha e rejeição da antiga, sem compartilhar nenhuma delas.
5. Confirmar que um link usado não altera a senha novamente e que sessões anteriores não acessam o painel.

As rotas validam a origem, limitam o corpo e usam os limites nativos de Auth. Nenhuma conta é criada ou autorizada pela recuperação. A conta deve continuar habilitada em `church_members`. O código de recuperação não é persistido em localStorage; recarregar a página exige outro link. Não registrar URLs de retorno com seus parâmetros em analytics/logs.

Testes automatizados: `node scripts/test-password-recovery.mjs`. Cobrem código inválido, fluxo errado, conta bloqueada, rejeição de senha, encerramento de sessões e resposta sem enumeração de contas. Não substituem o teste real de entrega de e-mail.
