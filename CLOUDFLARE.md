# Publicação na Cloudflare

> Publicação pausada. Este roteiro usa R2, ainda não habilitado. A alternativa gratuita para fotos precisa ser implementada antes de substituir este roteiro. Veja LANCAMENTO.md.

Este projeto usa Workers, D1 (`DB`) e R2 (`BUCKET`). O banco e as fotos locais não são copiados automaticamente para a conta Cloudflare. Antes de migrar dados existentes, confira a origem e faça backup.

## Preparar a conta

No terminal da pasta do projeto:

```powershell
npx wrangler login
npx wrangler whoami
```

Na primeira publicação, crie os recursos abaixo apenas se ainda não existirem. O R2 precisa estar habilitado na conta; confira as condições no painel da Cloudflare antes de habilitá-lo.

```powershell
npx wrangler d1 create tenda-da-adoracao-db
npx wrangler r2 bucket create tenda-da-adoracao-fotos
```

Guarde o `database_id` retornado. Para cada nova versão:

```powershell
npm run build
node scripts/prepare-cloudflare.mjs ID_REAL_DO_BANCO
npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.cloudflare.json
npx wrangler deploy --dry-run --config dist/server/wrangler.cloudflare.json
npx wrangler deploy --config dist/server/wrangler.cloudflare.json
```

O último comando retorna o endereço público `workers.dev`. Confira a página inicial, as chaves Pix, o login e uma publicação de teste antes de divulgar.

## Primeiro administrador

Uma base nova precisa de `OWNER_EMAIL` e `ADMIN_SETUP_TOKEN` configurados como secrets no Worker. Use os campos protegidos do painel Cloudflare ou `wrangler secret put`; não coloque os valores no Git, em prints ou nesta documentação. O token precisa ter 64 caracteres hexadecimais aleatórios. A senha deve ser escolhida pelo administrador na tela `/administrador/configurar#TOKEN`.

Depois de configurar a conta, remova o secret `ADMIN_SETUP_TOKEN`. Uma base que já tem administrador deve usar o login existente.

As alterações no GitHub só chegam à Cloudflare depois de uma publicação ou da configuração explícita de uma integração de build.
