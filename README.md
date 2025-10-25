# Projeto de E-commerce "Pelos & Patas"

**Trabalho de Conclusão de Curso (TCC)**

- **Curso:** Análise e Desenvolvimento de Sistemas
- **Autora:** Ana Julia Della Vecchia
- **Instituição:** Instituto Federal do Rio Grande do Sul - Campus Sertão
- **Orientador(a):** Dr. Gabriel Patzer
- **Data:** Outubro de 2025

![Status do Projeto](https://img.shields.io/badge/status-concluído-brightgreen)
![Linguagem](https://img.shields.io/badge/linguagem-JavaScript-yellow)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)
![Licença](https://img.shields.io/badge/licença-MIT-blue)

---

## Sumário

1. [Introdução](#1-introdução)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Funcionalidades Implementadas](#4-funcionalidades-implementadas)
   - [4.1 Funcionalidades do Cliente](#41-funcionalidades-do-cliente)
   - [4.2 Funcionalidades do Administrador](#42-funcionalidades-do-administrador)
   - [4.3 Recursos Gerais](#43-recursos-gerais)
5. [Detalhes da Implementação](#5-detalhes-da-implementação)
   - [5.1 Estrutura do Banco de Dados](#51-estrutura-do-banco-de-dados)
   - [5.2 Documentação da API (Swagger)](#52-documentação-da-api-swagger)
   - [5.3 Autenticação e Autorização](#53-autenticação-e-autorização)
6. [Configuração e Execução do Ambiente](#6-configuração-e-execução-do-ambiente)
   - [6.1 Pré-requisitos](#61-pré-requisitos)
   - [6.2 Configuração do Banco de Dados](#62-configuração-do-banco-de-dados)
   - [6.3 Configuração do Backend](#63-configuração-do-backend)
   - [6.4 Execução](#64-execução)
7. [Conclusão e Trabalhos Futuros](#7-conclusão-e-trabalhos-futuros)
8. [Autoria](#8-autoria)
9. [Licença](#9-licença)

---

## 1. Introdução

Este documento descreve o projeto "Pelos & Patas", uma aplicação web de e-commerce desenvolvida como Trabalho de Conclusão de Curso (TCC) para o curso de Análise e Desenvolvimento de Sistemas. O objetivo principal foi criar uma plataforma funcional e segura para a venda online de produtos para pet shops, aplicando conceitos de desenvolvimento web moderno, arquitetura de sistemas e segurança da informação.

A aplicação simula um ambiente real de comércio eletrônico, permitindo a usuários cadastrar-se, navegar pelo catálogo de produtos, gerenciar um carrinho de compras, finalizar pedidos e visualizar seu histórico. A plataforma também inclui um painel administrativo integrado para gerenciamento de produtos, acessível por usuários com permissões específicas.

O desenvolvimento seguiu uma abordagem de separação de interesses, com um backend robusto construído em Node.js e Express.js, expondo uma API RESTful, e um frontend interativo composto por arquivos HTML, CSS e JavaScript puros, servidos estaticamente. A segurança é tratada através de autenticação baseada em JSON Web Tokens (JWT) e armazenamento seguro de senhas.

Este README serve como documentação central do projeto, detalhando sua arquitetura, tecnologias, funcionalidades, estrutura de dados, endpoints da API e instruções para configuração e execução.

---

## 2. Arquitetura do Sistema

O sistema adota uma arquitetura cliente-servidor desacoplada, composta por três camadas principais:

FRONTEND:
  - HTML
  - CSS
  - JS

BACKEND (API REST):
  - Node.js
  - Express.js
  (localhost:3030)

BANCO DE DADOS:
  - MySQL


- **Frontend:** Consiste em arquivos estáticos (HTML, CSS, JavaScript) servidos diretamente pelo servidor Express.js através do middleware `express.static`. Toda a interatividade e comunicação com o backend ocorre via requisições assíncronas (`fetch`) à API RESTful, utilizando JSON como formato de dados. O estado da sessão do usuário (autenticação) e o carrinho de compras são gerenciados no lado do cliente via `localStorage`.
- **Backend:** Uma API RESTful desenvolvida em Node.js com o framework Express.js. É responsável por toda a lógica de negócios, validação de dados, autenticação/autorização de usuários (via JWT), processamento de pedidos e interação com o banco de dados.
- **Banco de Dados:** Utiliza o sistema de gerenciamento de banco de dados relacional MySQL para persistência dos dados de usuários, produtos, pedidos e itens de pedidos.

---

## 3. Tecnologias Utilizadas

- **Linguagem Principal:** JavaScript (ES6+ Padrão)
- **Frontend:**
  - HTML5 (Estrutura Semântica)
  - CSS3 (Estilização e Layout Responsivo)
  - JavaScript Vanilla (Manipulação do DOM, Requisições `fetch`, Gerenciamento de Estado Local)
- **Backend:**
  - Node.js (Ambiente de Execução JavaScript no Servidor)
  - Express.js (Framework Web para Gerenciamento de Rotas e Middlewares)
  - `mysql2/promise` (Driver MySQL com suporte a Promises/Async/Await)
  - `bcrypt` (Hashing Seguro de Senhas)
  - `jsonwebtoken` (Geração e Verificação de Tokens JWT)
  - `dotenv` (Gerenciamento de Variáveis de Ambiente)
  - `cors` (Middleware para Habilitar Cross-Origin Resource Sharing)
- **Banco de Dados:**
  - MySQL (Sistema de Gerenciamento de Banco de Dados Relacional)
- **Documentação da API:**
  - `swagger-autogen` (Geração automática de especificação OpenAPI)
  - `swagger-ui-express` (Interface web interativa para documentação Swagger)
- **Controle de Versão:**
  - Git & GitHub (ou similar)

---

## 4. Funcionalidades Implementadas

### 4.1. Funcionalidades do Cliente
- **Autenticação:** Cadastro de novos usuários (com foto de perfil aleatória via API `dog.ceo`) e Login (recebendo token JWT).
- **Gerenciamento de Perfil:** Visualização e Edição de dados pessoais (usuário, email, telefone).
- **Navegação de Produtos:** Listagem de produtos em formato de cards.
- **Detalhes do Produto:** Página dedicada para cada produto, acessível via URL com o ID do produto, exibindo informações completas.
- **Carrinho de Compras:** Adição, remoção e ajuste de quantidade de produtos, persistido no `localStorage`.
- **Checkout:** Processo de finalização de compra em múltiplas etapas (endereço, pagamento) dentro de um modal, com validação de login prévio.
- **Histórico de Pedidos:** Página para visualização dos pedidos anteriores do usuário autenticado.
- **Contato:** Botão flutuante para iniciar conversa via WhatsApp.

### 4.2. Funcionalidades do Administrador
- **Diferenciação de Papéis:** Sistema de `role` ('cliente' vs 'admin') definido no banco de dados e incluído no token JWT.
- **Autorização:** Rotas da API para criação e edição de produtos protegidas por middleware que verifica o token e a `role` de administrador.
- **Gerenciamento de Produtos:**
  - Botão "Cadastrar Produtos" visível apenas para administradores na página inicial.
  - Acesso à página de cadastro de novos produtos.
  - Botão "Editar" visível em cada card de produto na listagem principal, abrindo um modal para edição.

### 4.3. Recursos Gerais
- **Segurança:** Autenticação via JWT com expiração, hashing de senhas com bcrypt, proteção de rotas por middleware.
- **URLs de Detalhes:** Páginas de detalhes de produto acessíveis via ID na URL (ex: `/produto-detalhe.html?id=123`).
- **Persistência Local:** Uso do `localStorage` para armazenar o token JWT, dados básicos do usuário e o carrinho de compras.
- **Feedback ao Usuário:** Uso de `alert()` e notificações (toast) para informar sobre sucesso ou erro em operações (ex: adição ao carrinho, atualização de perfil).
- **Documentação da API:** Interface Swagger UI interativa para visualização e teste dos endpoints.

---

## 5. Detalhes da Implementação

### 5.1. Estrutura do Banco de Dados

O esquema relacional é composto por quatro tabelas principais:

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Armazena o hash bcrypt
    phone VARCHAR(20),
    profile_image_url VARCHAR(255) NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')) -- Papel do usuário
);

-- Tabela de Produtos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

-- Tabela de Pedidos
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'aguardando pagamento',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Itens do Pedido (Relacionamento N:N entre Pedidos e Produtos)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

### 5.2. Documentação da API (Swagger)

A API RESTful está documentada seguindo o padrão OpenAPI (Swagger 2.0). A documentação é gerada automaticamente a partir de comentários nos arquivos de rotas utilizando `swagger-autogen` e pode ser acessada interativamente através do `swagger-ui-express`.

  - **Acesso:** Após iniciar o servidor backend, a documentação estará disponível em:
    `http://localhost:3030/api-docs`

  - **Endpoints:** Todos os endpoints da API são prefixados com `/api`. A tabela abaixo resume as rotas principais. Consulte a interface Swagger UI para detalhes completos sobre parâmetros, corpo das requisições e schemas de resposta.

| Método | Rota                  | Descrição                                         | Proteção      |
| :----- | :-------------------- | :-------------------------------------------------- | :------------ |
| `POST` | `/auth/login`         | Autentica um usuário e retorna token JWT e dados.   | Pública       |
| `POST` | `/auth/cadastro`      | Registra um novo usuário.                           | Pública       |
| `PUT`  | `/users/:id`          | Atualiza o perfil do usuário (nome, email, fone). | `verifyToken` |
| `GET`  | `/products`           | Lista todos os produtos.                          | Pública       |
| `GET`  | `/products/:id`       | Busca detalhes de um produto pelo ID numérico.      | Pública       |
| `POST` | `/products`           | Cria um novo produto.                             | `isAdmin`     |
| `PUT`  | `/products/:id`       | Atualiza um produto existente.                      | `isAdmin`     |
| `POST` | `/orders`             | Cria um novo pedido a partir do carrinho.         | `verifyToken` |
| `GET`  | `/orders/user`        | Lista os pedidos do usuário autenticado.          | `verifyToken` |

### 5.3. Autenticação e Autorização

  - **Autenticação:** Realizada via `POST /api/auth/login`. Em caso de sucesso, um JWT é gerado contendo `userId` e `role`, assinado com um segredo (`JWT_SECRET`) definido nas variáveis de ambiente, e com tempo de expiração de 1 hora. O token é enviado ao cliente e armazenado no `localStorage`.
  - **Autorização:** Para cada requisição a endpoints protegidos, o cliente deve enviar o token no cabeçalho `Authorization: Bearer <token>`. O middleware `verifyToken` intercepta a requisição, valida a assinatura e a expiração do token. Se válido, extrai o payload (`userId`, `role`) e o anexa ao objeto `req.user`. O middleware `isAdmin` subsequentemente verifica se `req.user.role` é igual a `'admin'` para rotas administrativas.
  - **Uso do Token (Importante):** Ao testar endpoints protegidos via ferramentas como Swagger UI ou Postman, o token JWT obtido no login deve ser inserido no campo de autorização precedido pela palavra ` Bearer  ` (com um espaço), por exemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`.

-----

## 6\. Configuração e Execução do Ambiente

### 6.1. Pré-requisitos

  - Node.js (versão 18 ou superior recomendada)
  - Servidor MySQL (versão 5.7 ou superior)
  - Git (para clonar o repositório)

### 6.2. Configuração do Banco de Dados

1.  Assegure que o servidor MySQL esteja em execução.
2.  Crie um banco de dados dedicado para a aplicação (ex: `pelos_patas_tcc`).
3.  As tabelas podem ser criadas manualmente executando o SQL da Seção 5.1 ou automaticamente através da rota de setup (Passo 6.4). Certifique-se de que a configuração da conexão (`db_config.js`) permita `multipleStatements: true` se for usar a rota de setup.

### 6.3. Configuração do Backend

1.  Clone o repositório do projeto para sua máquina local.
2.  Navegue até o diretório raiz do projeto backend via terminal.
3.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```
4.  Crie um arquivo chamado `.env` na raiz do projeto backend.
5.  Copie o conteúdo abaixo para o arquivo `.env` e substitua os valores pelos da sua configuração:
    ```env
    # Configuração do Banco de Dados
    DB_HOST=localhost
    DB_USER=seu_usuario_mysql
    DB_PASSWORD=sua_senha_mysql
    DB_NAME=nome_do_seu_banco_de_dados

    # Segredo para assinatura do JWT (gere uma string longa e aleatória)
    JWT_SECRET=crie_uma_chave_secreta_aqui_bem_longa_e_segura

    # Porta do Servidor (opcional, padrão 3030)
    PORT=3030
    ```

### 6.4. Execução

1.  **(Opcional, Primeira Vez) Gerar Documentação Swagger:** Execute o comando para gerar o arquivo `swagger_output.json`. Execute este comando sempre que modificar os comentários de documentação nas rotas.

    ```bash
    npm run swagger
    ```

2.  **Iniciar o Servidor Backend:** No terminal, dentro da pasta do backend, execute:

    ```bash
    npm start
    ```

    O servidor iniciará na porta definida (padrão 3030). Uma mensagem indicará a URL para acessar a documentação da API.

3.  **(Opcional) Setup Inicial do Banco:** Abra seu navegador e acesse a rota `http://localhost:3030/setup-database`. Isso irá apagar todas as tabelas existentes (se houver), recriá-las e inserir dados de teste (um usuário admin e um cliente). **Atenção:** Use esta rota apenas em ambiente de desenvolvimento.

4.  **Acessar a Aplicação Frontend:** Abra o arquivo `index.html` localizado dentro da pasta `public` do projeto em seu navegador web. Alternativamente, acesse `http://localhost:3030/` que, devido à configuração do `express.static`, servirá o `index.html` automaticamente.

-----

## 7\. Conclusão e Trabalhos Futuros

O projeto "Pelos & Patas" cumpriu com sucesso os objetivos propostos, resultando em uma aplicação web de e-commerce funcional, segura e com uma arquitetura bem definida. Foram aplicados conhecimentos em desenvolvimento Full Stack JavaScript, modelagem de banco de dados relacional, implementação de API RESTful, e mecanismos de autenticação e autorização modernos. A inclusão da documentação interativa via Swagger UI facilita a compreensão e o teste da API.

Como trabalhos futuros, sugere-se:

  - Integração com um gateway de pagamento real.
  - Desenvolvimento de um painel administrativo mais completo (gerenciamento de usuários, visualização detalhada de pedidos).
  - Implementação de testes automatizados (unitários, integração, e2e).
  - Funcionalidades adicionais como busca de produtos, filtros e paginação.
  - Otimização de performance e segurança (rate limiting, validação de entrada mais robusta, refresh tokens).
  - Melhoria da interface do usuário e experiência do usuário (UX).
  - Processo de deploy para um ambiente de produção (ex: Heroku, AWS, Vercel).

-----

## 8\. Autoria

Desenvolvido por **Ana Julia Della Vecchia** como requisito parcial para obtenção do título de Tecnólogo em Análise e Desenvolvimento de Sistemas.

  - **GitHub:** `[[Link para o seu GitHub](https://github.com/anavecchia)]`

-----

## 9\. Licença

Este projeto será licenciado sob a Licença MIT. O arquivo `LICENSE` correspondente será adicionado ao repositório.
