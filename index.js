// carrega variáveis de ambiente do .env (deve ser a primeira linha)
require('dotenv').config();

// importações dos módulos
const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./db_config'); // assume exportação do pool mysql2/promise
const bcrypt = require('bcrypt'); // necessário para a rota de setup

// importação dos arquivos de rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// inicialização do express
const app = express();
const port = process.env.PORT || 3030; // porta do servidor
const saltRounds = 10; // custo do hashing bcrypt para setup

// --- configuração de middlewares ---

app.use(cors()); // habilita cors para todas as origens
app.use(express.json()); // habilita o parsing de json no corpo das requisições
app.use(express.static(path.join(__dirname, 'public'))); // serve arquivos estáticos da pasta 'public'

// --- registro das rotas da api ---

// monta os roteadores com prefixos
app.use('/api/auth', authRoutes);     // rotas de autenticação (/api/auth/login, /api/auth/cadastro)
app.use('/api/users', userRoutes);   // rotas de usuário (/api/users/:id)
app.use('/api/products', productRoutes); // rotas de produtos (/api/products, /api/products/:id)
app.use('/api/orders', orderRoutes);   // rotas de pedidos (/api/orders, /api/orders/user)

// --- rota de setup do banco (apenas para desenvolvimento) ---

// get /setup-database - apaga, recria e popula tabelas com dados de exemplo
app.get('/setup-database', async (req, res) => {
    try {
        // gera hashes para senhas de teste
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const userPassword = await bcrypt.hash('user123', saltRounds);

        // queries sql para recriar o banco (multiplos statements habilitados no db_config.js)
        const setupQueries = `
            DROP TABLE IF EXISTS order_items, orders, products, users;

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
                price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
            );

            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
                status VARCHAR(50) NOT NULL DEFAULT 'aguardando pagamento',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL CHECK (quantity > 0),
                price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
            );

            INSERT INTO users (email, username, password, role, profile_image_url) VALUES
                ('admin@email.com', 'Admin User', '${adminPassword}', 'admin', 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg'),
                ('cliente@email.com', 'Cliente Teste', '${userPassword}', 'cliente', 'https://images.dog.ceo/breeds/terrier-patterdale/Patterdale.jpg');

            INSERT INTO products (title, description, price, image_url) VALUES
                ('Ração Premium Cães Adultos', 'ração seca super premium sabor frango para cães adultos de portes médio e grande. 15kg.', 149.90, 'https://images.dog.ceo/breeds/affenpinscher/n02110627_13553.jpg'),
                ('Bolinha de Tênis (Pack 3)', 'pacote com 3 bolinhas de tênis resistentes para cães, ideais para brincadeiras de buscar.', 29.90, 'https://images.dog.ceo/breeds/beagle/n02088364_10206.jpg');
        `;

        // executa as queries
        await connection.query(setupQueries);
        res.status(200).send('banco de dados recriado e populado com sucesso!');

    } catch (error) {
        // trata erros durante o setup
        console.error('erro ao configurar o banco:', error);
        res.status(500).json({ message: 'erro ao configurar o banco.', error: error.message });
    }
});

// --- middleware para rotas não encontradas (404) ---
// (deve ser o último middleware antes do app.listen)
app.use((req, res, next) => {
  // se a requisição começa com /api/, retorna erro JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: `endpoint não encontrado: ${req.method} ${req.originalUrl}` });
  }
  // caso contrário, serve o index.html (para SPAs ou refresh de páginas HTML)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- inicialização do servidor ---
app.listen(port, () => {
    console.log(`servidor rodando na porta ${port}`);
    console.log(`link: http://localhost:${port}`);
});