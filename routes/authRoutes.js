const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../db_config'); // assume que exporta o pool mysql2/promise
require('dotenv').config(); // garante acesso a process.env

const router = express.Router();
const saltRounds = 10; // custo do hashing bcrypt

// POST /api/auth/login - autentica um usuário
/*
    #swagger.path = '/auth/login'
    #swagger.tags = ['Auth']
    #swagger.summary = 'autentica um usuário.'
    #swagger.description = 'recebe email e senha, verifica credenciais no banco (comparando hash bcrypt) e retorna um token jwt e dados básicos do usuário (sem senha) em caso de sucesso.'
    #swagger.parameters['obj'] = {
        in: 'body',
        description: 'credenciais de login.',
        required: true,
        schema: { $ref: "#/definitions/LoginCredentials" }
    }
    #swagger.responses[200] = {
        description: 'login bem-sucedido.',
        schema: {
            success: true,
            message: 'login bem-sucedido!',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: { $ref: "#/definitions/UserBase" } // refinar: definir UserBase em swagger.js
        }
    }
    #swagger.responses[400] = { description: 'email ou senha não fornecidos.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[401] = { description: 'email ou senha inválidos.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[500] = { description: 'erro interno do servidor.', schema: { $ref: "#/definitions/ErrorResponse" } }
*/

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
/*
    #swagger.path = '/auth/cadastro'
    #swagger.tags = ['Auth']
    #swagger.summary = 'registra um novo usuário.'
    #swagger.description = 'recebe dados do novo usuário (incluindo url de imagem opcional), gera hash da senha e salva no banco. verifica duplicidade de email.'
    #swagger.parameters['obj'] = {
        in: 'body',
        description: 'dados para cadastro do novo usuário.',
        required: true,
        schema: { $ref: "#/definitions/UserRegistration" }
    }
    #swagger.responses[201] = {
        description: 'usuário cadastrado com sucesso.',
        schema: { message: 'usuário cadastrado com sucesso!' }
    }
    #swagger.responses[400] = { description: 'campos obrigatórios ausentes ou email inválido.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[409] = { description: 'o email informado já está em uso.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[500] = { description: 'erro interno ao cadastrar usuário.', schema: { $ref: "#/definitions/ErrorResponse" } }
*/
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