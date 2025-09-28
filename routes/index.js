// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const connection = require('./db_config'); // Assumindo que db_config.js configura a conexão MySQL
const app = express();

app.use(cors());
app.use(express.json());

const port = 3030;


app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

// -------------- USUARIO:
// Endpoint para CADASTRAR um novo usuário (modificado)
// Se você não tiver o bcrypt, instale com: npm install bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 5; // Fator de segurança para o hash

// Endpoint para CADASTRAR um novo usuário (versão simplificada)
app.post('/cadastro', async (req, res) => { // Mantemos async por causa do bcrypt
    // AGORA RECEBEMOS A URL DA FOTO DO FRONTEND
    const { email, username, password, phone, profile_image_url } = req.body;

    if (!email || !username || !password || !phone) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // O servidor agora só tem duas responsabilidades: criptografar e salvar.
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO users (email, username, password, phone, profile_image_url) VALUES (?, ?, ?, ?, ?)';
        const values = [email, username, hashedPassword, phone, profile_image_url]; // Usa a URL recebida

        connection.query(query, values, (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Este e-mail já está em uso.' });
                }
                console.error('Erro ao cadastrar usuário:', error);
                return res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
            }
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        });

    } catch (error) {
        console.error('Erro no processo de cadastro (bcrypt):', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Endpoint para ATUALIZAR o perfil de um usuário (PUT)
app.put('/usuario/:id', (req, res) => {
    const { id } = req.params;
    const { username, phone } = req.body; // Apenas os campos que podem ser editados

    if (!username || !phone) {
        return res.status(400).json({ message: 'Nome de usuário e telefone são obrigatórios.' });
    }

    const query = 'UPDATE users SET username = ?, phone = ? WHERE id = ?';
    const values = [username, phone, id];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Retorna os dados atualizados para o frontend
        const updatedUserQuery = 'SELECT id, username, email, phone, profile_image_url FROM users WHERE id = ?';
        connection.query(updatedUserQuery, [id], (err, users) => {
            if (err) {
                 return res.status(500).json({ message: 'Erro ao buscar usuário atualizado.' });
            }
            res.status(200).json({ 
                message: 'Perfil atualizado com sucesso!',
                user: users[0] 
            });
        });
    });
});

// Login
// Não se esqueça de ter o bcrypt importado no topo do arquivo
// const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => { // A função precisa ser async
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. Encontra o usuário pelo email
        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], async (error, users) => {
            if (error) {
                console.error("Erro no banco de dados:", error);
                return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
            }

            // Verifica se o usuário foi encontrado
            if (users.length === 0) {
                // Mensagem genérica por segurança
                return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
            }

            const user = users[0];

            // 2. Compara a senha do formulário com o hash do banco de dados
            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (!isPasswordMatch) {
                // Se as senhas não batem, retorna o mesmo erro genérico
                return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
            }
            
            // 3. Se as senhas batem, o login é um sucesso!
            // Removemos a senha do objeto antes de enviar para o frontend
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                message: 'Login bem-sucedido!',
                user: userWithoutPassword
            });
        });

    } catch (error) {
        console.error("Erro no processo de login:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

//--------------- PRODUTOS:

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

app.put('/produto/:id', (req, res) => {
    const { id } = req.params; // Pega o ID do produto da URL
    const { title, description, image_url, price } = req.body; // Pega os novos dados do corpo da requisição

    // Validação simples
    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Título, descrição e preço são obrigatórios.' });
    }

    const query = `
        UPDATE products 
        SET title = ?, description = ?, image_url = ?, price = ? 
        WHERE id = ?
    `;
    const values = [title, description, image_url || null, price, id];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Erro ao atualizar produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto.' });
        }

        // Verifica se alguma linha foi de fato alterada
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    });
});

//---------- COMPRAS:

// Endpoint para CRIAR um novo pedido
app.post('/pedidos', (req, res) => {
    const { userId, cart } = req.body;

    if (!userId || !cart || cart.length === 0) {
        return res.status(400).json({ message: 'Dados do pedido inválidos.' });
    }

    connection.beginTransaction(err => {
        if (err) {
            console.error('Erro ao iniciar transação:', err);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }

        // 1. Calcular o preço total no backend para segurança
        const productIds = cart.map(item => item.id);
        connection.query('SELECT id, price FROM products WHERE id IN (?)', [productIds], (err, products) => {
            if (err) {
                return connection.rollback(() => res.status(500).json({ message: 'Erro ao buscar produtos.' }));
            }
            
            let totalPrice = 0;
            const priceMap = new Map(products.map(p => [p.id, p.price]));
            for (const item of cart) {
                totalPrice += priceMap.get(item.id) * item.quantity;
            }

            // 2. Inserir o pedido na tabela 'orders'
            const orderQuery = 'INSERT INTO orders (user_id, total_price) VALUES (?, ?)';
            connection.query(orderQuery, [userId, totalPrice], (err, result) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json({ message: 'Erro ao criar pedido.' }));
                }

                const orderId = result.insertId;

                // 3. Inserir cada item do carrinho na tabela 'order_items'
                const itemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?';
                const itemsValues = cart.map(item => [
                    orderId,
                    item.id,
                    item.quantity,
                    priceMap.get(item.id) // Preço do momento da compra
                ]);

                connection.query(itemsQuery, [itemsValues], (err, result) => {
                    if (err) {
                        return connection.rollback(() => res.status(500).json({ message: 'Erro ao inserir itens do pedido.' }));
                    }

                    // 4. Se tudo deu certo, confirmar a transação
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => res.status(500).json({ message: 'Erro ao confirmar pedido.' }));
                        }
                        res.status(201).json({ message: 'Pedido realizado com sucesso!', orderId });
                    });
                });
            });
        });
    });
});

// Endpoint para BUSCAR todos os pedidos de um usuário
app.get('/pedidos/usuario/:userId', (req, res) => {
    const { userId } = req.params;

    const query = 'SELECT id, order_date, total_price, status FROM orders WHERE user_id = ? ORDER BY order_date DESC';

    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar pedidos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        res.status(200).json(results);
    });
});