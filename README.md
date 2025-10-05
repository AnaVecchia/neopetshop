# Projeto de E-commerce "Petshop - Pelos & Patas"

**Trabalho de Conclusão de Curso (TCC)**

  - **Curso:** Análise e Desenvolvimento de Sistemas
  - **Autora:** Ana Julia Della Vecchia

-----

## 1\. Introdução

Este documento detalha o projeto de desenvolvimento de uma plataforma de e-commerce completa, intitulada "Pelos & Patas". O sistema foi concebido como um Trabalho de Conclusão de Curso e tem como objetivo principal a criação de uma aplicação web funcional para um pet shop, abrangendo desde a interação do cliente com os produtos até a gestão administrativa do catálogo e dos pedidos. A arquitetura do sistema é baseada em uma API RESTful (Backend) e uma aplicação de múltiplas páginas (Frontend) que consome essa API, demonstrando a separação de responsabilidades e a comunicação desacoplada entre cliente e servidor.

-----

## 2\. Funcionalidades Implementadas

A plataforma possui um conjunto robusto de funcionalidades, divididas em três categorias principais: funcionalidades para clientes, painel administrativo e recursos gerais do sistema.

### 2.1. Funcionalidades do Cliente

  - **Autenticação:** Sistema completo de cadastro (com atribuição de foto de perfil aleatória via API externa) e login de usuários.
  - **Gerenciamento de Perfil:** O usuário pode visualizar e editar suas informações pessoais (nome e telefone) em uma página de perfil dedicada.
  - **Catálogo de Produtos:** Listagem de produtos disponíveis com imagem, título, descrição e preço.
  - **Detalhes do Produto:** Abertura de um modal com informações expandidas ao clicar em um produto.
  - **Carrinho de Compras:** Sistema persistente (via `localStorage`) que permite adicionar, remover e alterar a quantidade de itens.
  - **Checkout Multi-etapas:** Modal de finalização de compra com validação de formulário de endereço e seleção de método de pagamento.
  - **Histórico de Pedidos:** Tela onde o usuário autenticado pode consultar o status e os detalhes de todos os seus pedidos anteriores.

### 2.2. Funcionalidades do Administrador

  - **Controle de Acesso:** O sistema diferencia usuários "cliente" e "admin" através de um sistema de papéis (`role`).
  - **Autorização por Rota:** As rotas de criação e edição de produtos são protegidas e acessíveis apenas por administradores autenticados.
  - **Criação de Produtos:** Acesso a uma página exclusiva para cadastrar novos produtos no catálogo.
  - **Edição de Produtos:** Interface para alterar os dados de um produto existente, acessível diretamente na listagem de produtos.

### 2.3. Recursos Gerais do Sistema

  - **Autenticação Segura:** Implementação de JSON Web Tokens (JWT) para autenticação e autorização de requisições à API.
  - **Segurança de Senhas:** Armazenamento seguro de senhas no banco de dados utilizando hashing com a biblioteca `bcrypt`.
  - **Contato Rápido:** Botão flutuante para iniciar uma conversa via WhatsApp, facilitando a comunicação cliente-empresa.

-----

## 3\. Arquitetura do Sistema

O projeto foi desenvolvido seguindo uma arquitetura desacoplada, separando as responsabilidades do Frontend e do Backend.

```
+----------------+      +-----------------------+      +-------------------+
|    Frontend    |      |     Backend (API)     |      |  Banco de Dados   |
| (HTML, CSS, JS)|      | (Node.js + Express.js)|      |      (MySQL)      |
|  (no Navegador)| <--> |   (localhost:3030)    | <--> | (Servidor de BD)  |
+----------------+      +-----------------------+      +-------------------+
```

  - **Frontend:** Uma aplicação de múltiplas páginas (MPA) servida de forma estática. A interação com os dados é feita dinamicamente através de chamadas assíncronas (`fetch`) à API do backend.
  - **Backend:** Uma API RESTful construída com Node.js e Express.js. É responsável por toda a lógica de negócio, interação com o banco de dados e segurança (autenticação e autorização).
  - **Banco de Dados:** Um banco de dados relacional MySQL, responsável pela persistência dos dados de usuários, produtos e pedidos.

-----

## 4\. Tecnologias Utilizadas

  - **Frontend**

      - HTML
      - CSS
      - JS

  - **Backend**

      - NODE.JS
      - EXPRESS

  - **Banco de Dados**

      - MYSQL

  - **Autenticação**

      - JWTOKEN

-----

## 5\. Estrutura do Banco de Dados

O banco de dados é composto por quatro tabelas principais, relacionadas para garantir a integridade dos dados.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image_url VARCHAR(255) NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'cliente'
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aguardando Pagamento',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

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

-----

## 6\. Documentação da API

A comunicação entre o frontend e o backend é feita através dos seguintes endpoints.

| Método | Rota                  | Descrição                                         | Proteção      |
| :----- | :-------------------- | :-------------------------------------------------- | :------------ |
| `POST` | `/api/auth/login`     | Autentica um usuário e retorna um token JWT.        | Pública       |
| `POST` | `/api/auth/cadastro`  | Cria um novo usuário.                               | Pública       |
| `PUT`  | `/api/users/:id`      | Atualiza o perfil de um usuário.                    | `verifyToken` |
| `GET`  | `/api/products`       | Retorna a lista de todos os produtos.               | Pública       |
| `POST` | `/api/products`       | Adiciona um novo produto.                           | `isAdmin`     |
| `PUT`  | `/api/products/:id`   | Atualiza um produto existente.                      | `isAdmin`     |
| `POST` | `/api/orders`         | Salva um novo pedido no banco de dados.             | `verifyToken` |
| `GET`  | `/api/orders/user`    | Retorna o histórico de pedidos do usuário logado.   | `verifyToken` |

-----

## 7\. Configuração do Ambiente e Execução

Siga os passos abaixo para executar o projeto localmente.

### 7.1. Pré-requisitos

  - **Node.js:** Versão 18 ou superior.
  - **MySQL:** Instância local ou remota acessível.

### 7.2. Configuração do Banco de Dados

1.  Crie um banco de dados no seu servidor MySQL.
2.  Para criar e popular as tabelas, você pode executar o script SQL da seção 5 ou utilizar a rota de setup do backend após a configuração.

### 7.3. Configuração do Backend

1.  Navegue até a pasta do backend e instale as dependências:
    ```bash
    npm install
    ```
2.  Crie um arquivo `.env` na raiz do projeto backend e preencha com suas credenciais:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_do_banco
    DB_NAME=petshop
    JWT_SECRET=crie_uma_chave_secreta_longa_e_aleatoria
    ```

### 7.4. Execução

1.  Inicie o servidor backend:
    ```bash
    npm start
    ```
2.  O servidor estará rodando em `http://localhost:3030`.
3.  Opcionalmente, acesse `http://localhost:3030/setup-database` uma única vez para apagar, recriar e popular o banco de dados com dados de teste.
4.  Abra o arquivo `index.html` (localizado na pasta `public`) em seu navegador para acessar a aplicação. Recomenda-se o uso da extensão "Live Server" do VS Code para evitar conflitos de CORS.

-----

## 8\. Autoria

Desenvolvido por **Ana Julia Della Vecchia**.

  [Github](https://www.github.com/AnaVecchia) 