# Preparação para lançamento — 15/11/2026

## Concluído

- Login exclusivo Supabase; cadastro antigo encerrado e credenciais legadas locais removidas.
- Contas autorizadas por owner/editor, com permissão e sessão verificadas no servidor/banco.
- Conteúdo, configurações e fotos migrados para Supabase. D1 e R2 removidos das dependências de execução e da configuração de deploy.
- Configurações locais preservadas no Supabase. Não havia álbuns nem fotos locais para copiar.
- Painel com rascunhos, prévia, checklist, capa, ordem, legendas, seleção e exclusão de fotos, busca/filtros e duplicação de evento.
- Seção Pix com quatro finalidades confirmadas.
- Proprietário confirmou login, envio e exclusão de foto.
- Tipos, build, testes de autorização e RLS e simulação de deploy aprovados.

## Antes de divulgar

1. Testar no navegador a publicação/edição/arquivamento de um álbum e um evento completo, incluindo horário de Porto Velho. Testar também com uma conta de editora real.
2. Revisar celular (360, 390 e 768 px): menu, galeria, diálogos, teclado, formulários e cópia das quatro chaves Pix.
3. Definir e testar recuperação de acesso por e-mail. Atualmente a administração das contas Auth é feita no painel Supabase; não prometer convite automático.
4. Definir rotina de backup de banco e fotos e testar restauração. O banco local antigo está preservado, mas não é backup dos novos dados.
5. Publicar na hospedagem escolhida, configurar as duas variáveis Supabase, HTTPS e endereço final; testar os mesmos fluxos na hospedagem real.
6. Rever conteúdo institucional, imagem de compartilhamento, título e contatos oficiais. Foto atual e texto do pastor ainda dependem do material fornecido.

## Limites conhecidos

O advisor informa proteção de senha vazada desativada. Não contratamos recursos pagos. As franquias gratuitas de armazenamento/tráfego precisam ser acompanhadas. Animações novas e funções adicionais podem aguardar a validação dos fluxos essenciais.

GitHub salva o código; o site ainda não foi publicado na Cloudflare.
