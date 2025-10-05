const express = require('express');
const connection = require('../db_config');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/products - Lista todos os produtos
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM products ORDER BY id DESC';
        const [results] = await connection.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// POST /api/products - Cria um novo produto (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { title, description, image_url, price } = req.body;
    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Título, descrição e preço são obrigatórios.' });
    }

    try {
        const query = 'INSERT INTO products (title, description, image_url, price) VALUES (?, ?, ?, ?)';
        const values = [title, description, image_url || null, price];
        await connection.query(query, values);
        res.status(201).json({ message: 'Produto inserido com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ message: 'Erro interno ao criar produto.' });
    }
});

// PUT /api/products/:id - Atualiza um produto existente (Admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, price } = req.body;

    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Título, descrição e preço são obrigatórios.' });
    }

    try {
        const query = 'UPDATE products SET title = ?, description = ?, image_url = ?, price = ? WHERE id = ?';
        const values = [title, description, image_url || null, price, id];
        const [results] = await connection.query(query, values);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto.' });
    }
});

module.exports = router;