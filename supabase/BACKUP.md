# Backup manual de conteúdo

No painel do administrador, use **Cópia de segurança → Baixar backup com fotos**.
O arquivo contém todos os álbuns e eventos (inclusive rascunhos e arquivados), configurações e fotos vinculadas. O servidor pagina os dados sem o limite de 200 itens da interface. Cada foto tem tamanho e SHA-256 para conferir integridade.

Não inclui contas/senhas/sessões do Supabase, arquivos órfãos no Storage, esquema SQL, políticas, configurações de Auth, SMTP ou domínio. Os scripts de esquema estão versionados no GitHub. Este é um backup de conteúdo, não uma cópia integral do projeto Supabase.

## Rotina

1. Evite edições durante a cópia. Faça backup após novas publicações e antes de excluir fotos ou mudar a infraestrutura.
2. Confira se o download terminou. Guarde cópias datadas em dois locais privados, um deles fora do computador.
3. O arquivo não é criptografado: inclui fotos privadas/rascunhos e pode conter dados pessoais. Não envie ao GitHub. `backups/` e `tenda-backup-*.json` são ignorados pelo Git.
4. No terminal da pasta do projeto, valide:

```powershell
node scripts/verify-backup.mjs "C:\caminho\tenda-backup-2026-11-17.json"
```

O limite desta ferramenta é 32 MB de fotos por backup. Se ultrapassar, a exportação falha explicitamente, sem fornecer cópia incompleta. Nesse caso, deve-se preparar exportação assistida em lotes via Storage antes de apagar qualquer conteúdo. Não há agendamento automático nem promessa de recuperação por horário.

## Recuperação assistida

Não restaurar diretamente sobre a produção sem revisão. Primeiro validar em um projeto de teste com o mesmo esquema (`setup-access.sql`, `setup-content.sql` e demais correções versionadas), bucket privado `church-photos` e políticas instaladas.

```powershell
node scripts/verify-backup.mjs "C:\caminho\tenda-backup-2026-11-17.json" --extract "C:\caminho\restauracao-nova"
```

A pasta de destino deve ser nova. A ferramenta extrai fotos com os caminhos originais, um inventário `content.json` e `recovery-review.sql`. Ela não se conecta ao Supabase e não altera dados remotos.

1. No Storage, carregar os arquivos extraídos no bucket **privado** `church-photos`, preservando exatamente `UUID-da-publicacao/UUID-da-foto`. O inventário informa o MIME correto de cada arquivo. Não tornar o bucket público nem sobrescrever arquivos existentes sem comparação.
2. Revisar o SQL gerado. Ele insere somente IDs ausentes; não substitui textos/configurações já existentes. Publicações restauradas entram como rascunho e não são publicadas automaticamente. `created_by` é nulo para não depender de contas antigas.
3. Executar primeiro como simulação no SQL Editor: o arquivo termina em **ROLLBACK**. Após revisar e confirmar o destino, trocar por COMMIT para efetivar. Triggers existentes continuam ativos, inclusive o limite de 40 fotos. Fazer outra cópia antes de restaurar em projeto existente.
4. Comparar títulos, descrições, datas, legendas, sequência de fotos e imagens com o inventário. Abrir cada foto no painel, testar na galeria e somente então publicar os itens desejados. O trigger recalcula a ordem de inserção, preservando a sequência exportada.
5. Contas precisam ser recuperadas/criadas separadamente no Supabase Auth e autorizadas pelo administrador. Nunca restaurar sessões ou senhas a partir deste arquivo.

SHA-256 detecta corrupção acidental; não autentica a origem de um backup adulterado. Use apenas cópias guardadas por você. A verificação offline não substitui um ensaio de restauração em projeto separado.
