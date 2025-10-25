const express = require('express');
const connection = require('../db_config'); // assume exportação do pool mysql2/promise
const { verifyToken, isAdmin } = require('../middleware/auth'); // middlewares de autenticação e autorização
const router = express.Router();

// get /api/products - lista todos os produtos (público)
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM products ORDER BY id DESC';
        const [products] = await connection.query(query);
        res.status(200).json(products); // retorna array de produtos
    } catch (error) {
        console.error('erro ao buscar produtos:', error);
        res.status(500).json({ message: 'erro interno ao buscar produtos.' });
    }
});

// get /api/products/:id - busca detalhes de um produto específico (público)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    // validação básica do ID (se é um número inteiro positivo)
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'ID do produto inválido.' });
    }
    try {
        const query = 'SELECT * FROM products WHERE id = ?';
        const [results] = await connection.query(query, [id]);

        // verifica se o produto foi encontrado
        if (results.length === 0) {
            return res.status(404).json({ message: 'produto não encontrado.' }); // 404 Not Found
        }
        res.status(200).json(results[0]); // retorna o objeto do produto
    } catch (error) {
        console.error('erro ao buscar detalhes do produto:', error);
        res.status(500).json({ message: 'erro interno ao buscar detalhes do produto.' });
    }
});

// post /api/products - cria um novo produto (requer admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { title, description, image_url, price } = req.body;
    const numericPrice = parseFloat(price); // converte preço para número

    // valida campos obrigatórios e formato do preço
    if (!title || !description || isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: 'dados inválidos. título, descrição e preço (numérico >= 0) são obrigatórios.' });
    }

    try {
        // insere o novo produto no banco
        const query = 'INSERT INTO products (title, description, image_url, price) VALUES (?, ?, ?, ?)';
        const values = [title, description, image_url || null, numericPrice];
        await connection.query(query, values);
        res.status(201).json({ message: 'produto inserido com sucesso!' }); // 201 Created
    } catch (error) {
        console.error('erro ao criar produto:', error);
        res.status(500).json({ message: 'erro interno ao criar produto.' });
    }
});

// put /api/products/:id - atualiza um produto existente (requer admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, price } = req.body;
    const numericPrice = parseFloat(price);

     // validação básica do ID
     if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'ID do produto inválido.' });
    }

    // valida campos obrigatórios e formato do preço
    if (!title || !description || isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: 'dados inválidos. título, descrição e preço (numérico >= 0) são obrigatórios.' });
    }

    try {
        // atualiza o produto no banco
        const query = 'UPDATE products SET title = ?, description = ?, image_url = ?, price = ? WHERE id = ?';
        const values = [title, description, image_url || null, numericPrice, id];
        const [results] = await connection.query(query, values);

        // verifica se alguma linha foi afetada (se o produto existia)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'produto não encontrado para atualização.' }); // 404 Not Found
        }
        res.status(200).json({ message: 'produto atualizado com sucesso!' }); // 200 OK
    } catch (error) {
        console.error('erro ao atualizar produto:', error);
        res.status(500).json({ message: 'erro interno ao atualizar produto.' });
    }
});

module.exports = router;