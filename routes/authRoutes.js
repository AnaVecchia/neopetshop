const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../db_config');
const router = express.Router();

const saltRounds = 10;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [users] = await connection.query(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
        }

        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            message: 'Login bem-sucedido!',
            token: token,
            user: userWithoutPassword
        });
        console.log(token);
        
    } catch (error) {
        console.error("Erro no processo de login:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

router.post('/register', async (req, res) => {
    const { email, username, password, phone, profile_image_url } = req.body;
    if (!email || !username || !password || !phone) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO users (email, username, password, phone, profile_image_url) VALUES (?, ?, ?, ?, ?)';
        const values = [email, username, hashedPassword, phone, profile_image_url];
        await connection.query(query, values);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
    }
});

module.exports = router;