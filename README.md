# SEBASTIAN 1Doc

Gerador de Parecer Técnico Ambiental a partir do modelo Word original, com formulário por etapas, até 12 fotos e legendas, exportação DOCX e salvamento privado no Supabase.

Site: https://bioflorest-site.github.io/sebastian-1doc/

## Supabase recriado

O projeto anterior foi excluído. O projeto atual é `nnzvoyuswlfbfitvpymn`, chamado `sebastian-1doc`, na organização Sebastian e na região São Paulo (`sa-east-1`).

Painel: https://supabase.com/dashboard/project/nnzvoyuswlfbfitvpymn

O banco novo começa vazio. Os usuários do Auth, dados e documentos do projeto excluído não são recuperados por esta recriação. Crie o acesso em Authentication → Users → Add user → Create new user e defina a senha diretamente no Supabase; depois entre no site com esse acesso.

## Dados e documentos

`reports` armazena os campos em `data` (JSONB), o resumo em `content` e o proprietário em `user_id`. O DOCX fica no bucket privado `evidencias`, no caminho `<user_id>/<report_id>/parecer.docx`. Acesso, inserção, atualização e exclusão são restritos ao proprietário por RLS. O limite é de 20 MB por DOCX; as fotos são incorporadas ao documento.

`schema.sql` documenta a configuração já aplicada ao projeto novo. Não execute novamente nele. A chave presente no site é publicável; segredos administrativos nunca devem ser adicionados ao repositório.

## Site

A versão publicada usa `index.html`, com o modelo original incorporado. Requer HTTPS/HTTP e internet para carregar JSZip 3.10.1 e Supabase JS 2.102.0, ambos fixados. O parecer é um rascunho que exige revisão do responsável técnico.

Na recriação foram corrigidos a resolução dos controles da página, a coleta dos campos, o nome do arquivo e as quebras de linha do resumo. O fluxo foi verificado localmente com Supabase simulado e DOCX real; políticas e permissões também foram verificadas no banco novo, em transação revertida, sem dados reais.
