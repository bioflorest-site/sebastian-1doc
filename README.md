# SEBASTIAN 1Doc

Dashboard de vistorias ambientais com login Supabase, formulário estruturado de parecer técnico, indicadores e anexos privados (20 MB por arquivo). O cadastro reúne identificação do processo e requerente, localização/UTM, atividade, análise, recomendações, conclusão, assinatura e evidências. Os campos ficam em data (JSON), junto ao parecer em texto.

## Acesso
Projeto: https://supabase.com/dashboard/project/xehdrkgazzupkddhbjav

Crie seu acesso em Authentication → Users → Add user no Supabase. Defina sua senha diretamente lá. Depois entre no dashboard.

Sirva esta pasta por HTTP (exemplo: `python -m http.server 8080`) e abra http://localhost:8080. Não abra index.html diretamente. Para hospedar, use uma hospedagem estática sem build. A hospedagem pública não está habilitada neste repositório privado.

## Segurança
Banco e anexos são restritos ao proprietário por políticas RLS. cloud.js contém apenas URL e chave publicável. Nunca publique senhas ou service_role. schema.sql documenta a configuração já aplicada: não execute novamente nesse projeto. SDK fixado em 2.102.0 via esm.sh, requer internet.

## Limites e validação
Não há conexão com API 1Doc, IA ou consulta jurídica automática. Relatórios exigem revisão profissional. Os arquivos fornecidos não contêm registros reais: o banco começa vazio. Registros antigos do navegador não são importados automaticamente. Cada usuário vê seus próprios dados.

O cadastro usa o esquema reports já implantado no Supabase; não exige migração. A chave no navegador é publicável e as políticas RLS protegem registros e anexos por usuário. O conteúdo de um parecer real deve permanecer no Supabase privado, nunca no código público.
