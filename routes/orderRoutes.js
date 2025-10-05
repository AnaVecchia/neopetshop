const express = require('express');
const connection = require('../db_config');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/orders - Cria um novo pedido para o usuário autenticado
router.post('/', verifyToken, async (req, res) => {
    const { cart } = req.body;
    const userId = req.user.userId; // **CORRIGIDO:** Pega o userId do token, não do body.

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'O carrinho está vazio.' });
    }

    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();

        const productIds = cart.map(item => item.id);
        const [products] = await conn.query('SELECT id, price FROM products WHERE id IN (?)', [productIds]);
        
        if (products.length !== productIds.length) {
            throw new Error('Um ou mais produtos no carrinho são inválidos ou não foram encontrados.');
        }

        let totalPrice = 0;
        const priceMap = new Map(products.map(p => [p.id, p.price]));
        for (const item of cart) {
            totalPrice += priceMap.get(item.id) * item.quantity;
        }

        const orderQuery = 'INSERT INTO orders (user_id, total_price) VALUES (?, ?)';
        const [orderResult] = await conn.query(orderQuery, [userId, totalPrice]);
        const orderId = orderResult.insertId;

        const itemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?';
        const itemsValues = cart.map(item => [orderId, item.id, item.quantity, priceMap.get(item.id)]);
        await conn.query(itemsQuery, [itemsValues]);

        await conn.commit();
        res.status(201).json({ message: 'Pedido realizado com sucesso!', orderId });
    } catch (error) {
        await conn.rollback();
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: error.message || 'Erro interno do servidor ao criar pedido.' });
    } finally {
        conn.release();
    }
});

// GET /api/orders/user - Busca o histórico de pedidos do usuário autenticado
router.get('/user', verifyToken, async (req, res) => {
    const userId = req.user.userId; // Pega o userId do token.
    try {
        const query = 'SELECT id, order_date, total_price, status FROM orders WHERE user_id = ? ORDER BY order_date DESC';
        const [results] = await connection.query(query, [userId]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


module.exports = router;