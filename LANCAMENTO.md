# Preparação para lançamento — 15/11/2026

## Implementado no código

- Login próprio, convites individuais de editora, bloqueio de contas e sessões revogáveis.
- Álbuns e eventos: criar, editar, salvar rascunho, publicar, arquivar e encerrar eventos.
- Prévia da publicação, checklist de campos, busca/filtros e duplicação de evento.
- Rascunho local por conta; recupera textos, não arquivos pendentes, ordem ou legendas.
- Fotos: compactação, seleção múltipla, progresso, capa, ordem, legendas, ampliação e exclusão com confirmação.
- Informações da igreja e avisos editáveis pelo proprietário.
- Quatro finalidades Pix com chaves confirmadas e botão de copiar.
- Estilos responsivos e suporte a movimento reduzido.

Implementado não significa homologado em produção.

## Verificado nesta revisão

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` passou.
- Compilação: `npm.cmd run build` passou.
- `git diff --check` passou.
- Inspeção das rotas confirmou exigência de autorização para gravações e administração.
- Não foi executado o teste de autenticação sobre contas reais: o script atual exige banco vazio.
- Não houve nova homologação visual ou teste completo com contas nesta revisão.

## Antes de liberar acesso público

1. Definir e integrar armazenamento gratuito das fotos. Hoje `lib/storage.ts` ainda exige R2; Supabase não foi integrado. Não remover o vínculo sem adaptar upload, leitura e exclusão.
2. Concluir a revisão pendente dos fluxos de renovação de acesso e troca de senha, com testes isolados de proprietário e editora.
3. Homologar o fluxo completo em ambiente isolado: criar álbum, enviar fotos, reordenar, escolher capa, conferir prévia, publicar, editar, arquivar e excluir; repetir com evento e data de Porto Velho.
4. Conferir celular: larguras de 360, 390 e 768 px; menu, formulário, galeria, diálogos, teclado e cópia de todas as chaves Pix. Verificar ausência de rolagem horizontal.
5. Definir origem dos dados e fotos a preservar; realizar backup antes de migração. Banco novo na Cloudflare não contém automaticamente o conteúdo local ou do Sites.
6. Configurar administrador na hospedagem escolhida, testar convites e negar acesso a visitantes. Remover o token inicial depois da ativação.
7. Conferir HTTPS, endereço final, dados públicos e publicação de teste na hospedagem real.

## Melhorias que não precisam impedir o lançamento

- Texto pessoal aprovado pelo pastor e fotografia atual da igreja.
- Contatos oficiais, quando fornecidos.
- Mais efeitos visuais e novas funções: priorizar após os fluxos essenciais funcionarem.

## Estado da hospedagem

Cloudflare autorizada; banco D1 criado e migrações aplicadas. R2 não habilitado. Publicação suspensa por decisão do proprietário enquanto finalizamos as pendências. `CLOUDFLARE.md` documenta a alternativa atual com R2, não uma hospedagem gratuita já configurada. GitHub guarda o código e não publica automaticamente o site.
