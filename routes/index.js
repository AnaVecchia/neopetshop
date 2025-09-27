// server.js
const express = require('express');
const cors = require('cors');
const connection = require('./db_config'); // Assumindo que db_config.js configura a conexão MySQL
const app = express();

app.use(cors());
app.use(express.json());

const port = 3030;


app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

// Cadastro de usuário
app.post('/cadastro', (req, res) => {
    const { username, password, email, phone } = req.body;
    const query = 'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, password, email, phone], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
        }
        res.json({ success: true, message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }
        if (results.length > 0) {
            res.json({ success: true, message: 'Login bem-sucedido!', user: results[0] }); // Envia os dados do user
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos!' });
        }
    });
});

app.get('/produtos', (req, res) => {
    try {
        connection.query('SELECT * FROM products ORDER BY id DESC', (error, results) => {
            if (error) {
                console.error('Erro ao buscar produtos:', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Erro inesperado no endpoint /produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/produto', (req, res) => {
    const { title, description, image_url, price } = req.body;

    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Título, descrição e preço são obrigatórios.' });
    }

    try {
        const query = 'INSERT INTO products (title, description, image_url, price) VALUES (?, ?, ?, ?)';
        const values = [title, description, image_url || null, price];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Erro ao criar produto:', error);
                return res.status(500).json({ message: 'Erro interno do servidor ao criar produto.' });
            }
            res.status(201).json({ message: 'Produto inserido com sucesso!'});
        });
    } catch (error) {
        console.error('Erro inesperado no endpoint /produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});