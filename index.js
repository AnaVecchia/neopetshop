require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./db_config');

const app = express();
const port = process.env.PORT || 3030;

// --- CONFIGURAÇÃO E MIDDLEWARES ---

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname, 'public')

// --- ROTAS DA API ---
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/setup-database', async (req, res) => {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    try {
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const userPassword = await bcrypt.hash('user123', saltRounds);

        const queries = `
            DROP TABLE IF EXISTS order_items, orders, products, users;
            CREATE TABLE users ( id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, phone VARCHAR(20), profile_image_url VARCHAR(255) NULL, role VARCHAR(10) NOT NULL DEFAULT 'cliente' );
            CREATE TABLE products ( id INT AUTO_INCREMENT PRIMARY KEY, image_url VARCHAR(255), title VARCHAR(255) NOT NULL, description TEXT NOT NULL, price DECIMAL(10, 2) NOT NULL );
            CREATE TABLE orders ( id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, total_price DECIMAL(10, 2) NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'Aguardando Pagamento', FOREIGN KEY (user_id) REFERENCES users(id) );
            CREATE TABLE order_items ( id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL, price_at_purchase DECIMAL(10, 2) NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id) );
            INSERT INTO users (email, username, password, role, profile_image_url) VALUES ('admin@email.com', 'Admin User', '${adminPassword}', 'admin', 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg');
            INSERT INTO users (email, username, password, role, profile_image_url) VALUES ('cliente@email.com', 'Cliente Teste', '${userPassword}', 'cliente', 'https://images.dog.ceo/breeds/terrier-patterdale/Patterdale.jpg');
            INSERT INTO products (title, description, price, image_url) VALUES ('Ração Premium', 'Ração super gostosa para cães adultos.', 149.90, 'https://images.dog.ceo/breeds/affenpinscher/n02110627_13553.jpg');
            INSERT INTO products (title, description, price, image_url) VALUES ('Bolinha de Tênis', 'Pacote com 3 bolinhas resistentes.', 29.90, 'https://images.dog.ceo/breeds/beagle/n02088364_10206.jpg');
        `;
        await connection.query(queries);
        res.status(200).send('Banco de dados recriado e populado com sucesso!');
    } catch (error) {
        res.status(500).json({ message: 'Erro ao configurar o banco.', error: error.message });
    }
})

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));