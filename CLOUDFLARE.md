# Publicação na Cloudflare

A publicação continua pausada até a revisão final. O Worker usa Supabase Auth/Postgres/Storage; não exige D1 nem assinatura R2.

## Preparar

```powershell
npx.cmd wrangler login
npm.cmd run build
node scripts/prepare-cloudflare.mjs
npx.cmd wrangler deploy --dry-run --config dist/server/wrangler.cloudflare.json
```

Antes de divulgar o site, configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no Worker. A .dev.vars é local e não é enviada automaticamente. A compilação usa apenas variáveis de execução, não service_role. O script de preparação não inclui os valores dessas variáveis.

A publicação efetiva é:

```powershell
npx.cmd wrangler deploy --config dist/server/wrangler.cloudflare.json
```

Depois, configure as variáveis no painel Cloudflare ou pelo comando wrangler secret put para cada nome, sem colocar valores no Git. Teste a página pública, login, autorização, uma publicação e foto na hospedagem real antes de divulgar. Para links de recuperação/convite, quando implementados, inclua o endereço final na configuração de redirecionamentos do Supabase.

O banco D1 criado anteriormente não é usado e não foi apagado. Os dados locais antigos foram preservados. Atualizar o GitHub não publica automaticamente na Cloudflare.
