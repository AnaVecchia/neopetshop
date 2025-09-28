# Pelos & Patas E-commerce

Uma plataforma de e-commerce completa para o seu pet shop, construída com JavaScript puro, Node.js e MySQL.

![https](https://i.postimg.cc/d3VNZKX1/Screenshot-2025-09-28-110232.png)

-----

## Funcionalidades

O projeto conta com um sistema robusto de funcionalidades tanto para clientes quanto para administradores, incluindo:

### Para Clientes

  - **Cadastro de Usuário:** Criação de conta com foto de perfil aleatória de cachorro gerada por API.
  - **Login de Usuário:** Autenticação segura com senhas criptografadas.
  - **Perfil de Usuário:** Visualização e edição das informações pessoais.
  - **Visualização de Produtos:** Listagem dinâmica de todos os produtos cadastrados.
  - **Modal de Detalhes:** Exibição de informações detalhadas do produto ao clicar no card.
  - **Carrinho de Compras:** Adição, remoção e ajuste de quantidade de produtos no `localStorage`.
  - **Checkout Multi-etapas:** Modal de finalização de compra com preenchimento de endereço e seleção de pagamento.
  - **Histórico de Pedidos:** Tela para o usuário logado visualizar todos os seus pedidos anteriores.
  - **Contato via WhatsApp:** Botão flutuante para iniciar uma conversa diretamente no WhatsApp.

### Para Administradores

  - **Painel de Admin:** Detecção automática de contas 'admin' no login.
  - **Criação de Produtos:** Botão exclusivo para administradores acessarem a página de cadastro de novos produtos.
  - **Edição de Produtos:** Botão de edição em cada produto para alterar informações diretamente pelo painel.

-----

## Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

  - **Frontend:**

      - 
      - 
      -  (ES6+, Async/Await, Fetch API)

  - **Backend:**

      - 
      - 

  - **Banco de Dados:**

      - 

-----

## Como Executar o Projeto

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

  - [Node.js](https://nodejs.org/en/) (de preferência a versão 18 ou superior)
  - [MySQL](https://dev.mysql.com/downloads/) ou um ambiente de banco de dados compatível (XAMPP, WAMP, etc.)
  - Um editor de código de sua preferência, como o [VS Code](https://code.visualstudio.com/)

### Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone https://SEU_LINK_DO_REPOSITORIO_AQUI.git
    ```

2.  **Instale as dependências do Backend:**

    ```bash
    cd pasta-do-backend
    npm install
    ```

    Isso instalará o `express`, `mysql2`, `bcrypt`, `node-fetch`, etc.

3.  **Configure o Banco de Dados:**

      - Crie um novo banco de dados no seu MySQL.
      - Execute os scripts SQL abaixo para criar todas as tabelas necessárias:

    <!-- end list -->

    ```sql
    -- Tabela de Usuários
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        profile_image_url VARCHAR(255) NULL
    );

    -- Tabela de Produtos
    CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL
    );

    -- Tabela de Pedidos
    CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Aguardando Pagamento',
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Tabela de Itens do Pedido
    CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    ```

4.  **Configure as Variáveis de Ambiente:**

      - Na raiz da pasta do backend, crie um arquivo chamado `.env`.
      - Copie o conteúdo abaixo para dentro dele e substitua com suas credenciais:

    <!-- end list -->

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_aqui
    DB_NAME=nome_do_seu_banco
    ```

### Executando a Aplicação

1.  **Inicie o servidor Backend:**

    ```bash
    npm start 
    # ou
    node server.js
    ```

2.  **Abra o Frontend:**

      - Navegue até a pasta do frontend e abra o arquivo `index.html` no seu navegador.
      - É altamente recomendado usar uma extensão como o "Live Server" no VS Code para evitar problemas com CORS.

-----

## Endpoints da API

| Método | Rota                          | Descrição                                         |
| :----- | :---------------------------- | :-------------------------------------------------- |
| `POST` | `/login`                      | Autentica um usuário e retorna seus dados.          |
| `POST` | `/cadastro`                   | Cria um novo usuário com uma foto de perfil.        |
| `PUT`  | `/usuario/:id`                | Atualiza as informações de um perfil de usuário.    |
| `GET`  | `/produtos`                   | Retorna a lista de todos os produtos.               |
| `POST` | `/produto`                    | (Admin) Adiciona um novo produto.                   |
| `PUT`  | `/produto/:id`                | (Admin) Atualiza um produto existente.              |
| `POST` | `/pedidos`                    | Salva um novo pedido no banco de dados.             |
| `GET`  | `/pedidos/usuario/:userId`    | Retorna o histórico de pedidos de um usuário.       |

-----

## Autor

**[Ana Julia Della Vecchia]**

  - Github: [@seu-usuario](https://www.google.com/search?q=https://github.com/AnaVecchia)

-----
