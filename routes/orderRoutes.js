// /routes/orderRoutes.js

const express = require('express');
const connection = require('../db_config'); // assume exportação do pool mysql2/promise
const { verifyToken } = require('../middleware/auth'); // middleware de autenticação
const router = express.Router();

// post /api/orders - cria um novo pedido para o usuário autenticado
router.post('/', verifyToken, async (req, res) => {
    const { cart } = req.body; // extrai o carrinho do corpo da requisição
    const userId = req.user.userId; // obtém o ID do usuário a partir do token verificado

    // valida se o carrinho foi enviado e não está vazio
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: 'o carrinho está vazio ou é inválido.' });
    }

    // obtém uma conexão do pool para usar transações
    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction(); // inicia a transação

        // busca os preços atuais dos produtos no banco para validação e cálculo
        const productIds = cart.map(item => item.id);
        const [products] = await conn.query('SELECT id, price FROM products WHERE id IN (?)', [productIds]);

        // verifica se todos os produtos do carrinho existem no banco
        if (products.length !== productIds.length) {
            // identifica quais produtos são inválidos (opcional, mas bom para debug)
            const foundIds = new Set(products.map(p => p.id));
            const missingIds = productIds.filter(id => !foundIds.has(id));
            console.warn(`tentativa de pedido com produtos inválidos: ${missingIds.join(', ')}`);
            throw new Error(`um ou mais produtos no carrinho são inválidos (IDs: ${missingIds.join(', ')}).`);
        }

        // calcula o preço total do pedido baseado nos preços do banco (mais seguro)
        let totalPrice = 0;
        const priceMap = new Map(products.map(p => [p.id, parseFloat(p.price)])); // garante que o preço é numérico
        for (const item of cart) {
            const price = priceMap.get(item.id);
            const quantity = parseInt(item.quantity, 10); // garante que a quantidade é inteira
            if (isNaN(quantity) || quantity <= 0) {
                 throw new Error(`quantidade inválida para o produto ID ${item.id}.`);
            }
            totalPrice += price * quantity;
        }

        // insere o registro do pedido principal na tabela 'orders'
        const orderQuery = 'INSERT INTO orders (user_id, total_price) VALUES (?, ?)';
        const [orderResult] = await conn.query(orderQuery, [userId, totalPrice]);
        const orderId = orderResult.insertId; // obtém o ID do pedido recém-criado

        // prepara os dados para inserção em lote dos itens do pedido
        const itemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?';
        const itemsValues = cart.map(item => [
            orderId,
            item.id,
            parseInt(item.quantity, 10),
            priceMap.get(item.id) // usa o preço do banco no momento da compra
        ]);
        await conn.query(itemsQuery, [itemsValues]); // insere todos os itens de uma vez

        await conn.commit(); // confirma a transação se tudo deu certo
        res.status(201).json({ message: 'pedido realizado com sucesso!', orderId });

    } catch (error) {
        await conn.rollback(); // desfaz a transação em caso de erro
        console.error('erro ao criar pedido:', error);
        res.status(500).json({ message: error.message || 'erro interno do servidor ao criar pedido.' });
    } finally {
        conn.release(); // libera a conexão de volta para o pool
    }
});

// get /api/orders/user - busca o histórico de pedidos do usuário autenticado
router.get('/user', verifyToken, async (req, res) => {
    const userId = req.user.userId; // obtém o ID do usuário a partir do token
    try {
        // busca os pedidos do usuário ordenados por data
        const query = 'SELECT id, order_date, total_price, status FROM orders WHERE user_id = ? ORDER BY order_date DESC';
        const [results] = await connection.query(query, [userId]);
        res.status(200).json(results); // retorna a lista de pedidos
    } catch (error) {
        console.error('erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'erro interno do servidor ao buscar pedidos.' });
    }
});

module.exports = router;