const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../db_config'); // assume que exporta o pool mysql2/promise
require('dotenv').config(); // garante acesso a process.env

const router = express.Router();
const saltRounds = 10; // custo do hashing bcrypt

// POST /api/auth/login - autentica um usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // validação básica de entrada
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email e senha são obrigatórios.' });
    }

    try {
        // busca usuário pelo email no banco
        const query = 'SELECT id, email, password, role FROM users WHERE email = ?'; // busca apenas campos necessários
        const [users] = await connection.query(query, [email]);

        // verifica se o usuário existe
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'email ou senha inválidos.' }); // mensagem genérica
        }

        const user = users[0];

        // compara a senha fornecida com o hash armazenado
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // verifica se a senha corresponde
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'email ou senha inválidos.' }); // mensagem genérica
        }

        // gera o token jwt incluindo id e role do usuário
        const tokenPayload = { userId: user.id, role: user.role };
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // define expiração do token (ex: 1 hora)
        );

        // remove o hash da senha do objeto retornado ao frontend
        const { password: _, ...userWithoutPassword } = user;

        // envia resposta de sucesso com token e dados do usuário (sem senha)
        res.status(200).json({
            success: true,
            message: 'login bem-sucedido!',
            token: token,
            user: userWithoutPassword // retorna dados básicos do usuário
        });

    } catch (error) {
        console.error("erro no processo de login:", error);
        res.status(500).json({ success: false, message: 'erro interno do servidor.' });
    }
});

// POST /api/auth/cadastro - registra um novo usuário
router.post('/cadastro', async (req, res) => {
    const { email, username, password, phone, profile_image_url } = req.body;

    // validação de campos obrigatórios
    if (!email || !username || !password || !phone) {
        return res.status(400).json({ message: 'todos os campos são obrigatórios.' });
    }
     // validação básica de formato de email (pode ser aprimorada)
     if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'formato de email inválido.' });
     }


    try {
        // gera o hash da senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // insere o novo usuário no banco de dados
        const query = 'INSERT INTO users (email, username, password, phone, profile_image_url) VALUES (?, ?, ?, ?, ?)';
        const values = [email, username, hashedPassword, phone, profile_image_url];
        await connection.query(query, values);

        // envia resposta de sucesso
        res.status(201).json({ message: 'usuário cadastrado com sucesso!' });

    } catch (error) {
        // trata erro específico de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'este e-mail já está em uso.' }); // 409 Conflict
        }
        // trata outros erros
        console.error('erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'erro interno ao cadastrar usuário.' });
    }
});

module.exports = router;