* Arrumar o readme igual a funcionalidade do código 

* Corrigir o banco.sql que está diferente no código(readme está correto)

* No arquivo db_config.js, substituir os valores fixos (hardcoded) pelos valores que vêm do arquivo .env.

* Criar uma rota de inicialização do banco, que:
      -Apague e recrie as tabelas.
      -Insira dados iniciais     automaticamente.
     -Pode usar comandos SQL ou JavaScript.


* Backend
- Implementar o tratamento de administrador, incluindo:
    -Validação de administrador          feita por middleware.
   -Escolher uma ferramenta de autenticação
   -Ajustar o botão “SAIR” para funcionar com o novo sistema de autenticação (logout).

* Padronizar todas as rotas

* Front
    -Opção 1: Fazer o Express renderizar as páginas HTML da pasta view.
    -Opção 2: Separar o frontend e o backend em projetos diferentes (ou colocar o front todo na pasta public