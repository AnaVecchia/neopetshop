// Em routes/userRoutes.js

const express = require('express');
const connection = require('../db_config');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// PUT /api/users/:id - Atualiza o perfil do usuário logado
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    // CORREÇÃO: Extrai também o email do corpo da requisição
    const { username, email, phone } = req.body;

    // Garante que o usuário só pode editar seu próprio perfil
    if (parseInt(req.user.userId) !== parseInt(id)) {
        return res.status(403).json({ message: 'Acesso negado: você só pode editar seu próprio perfil.' });
    }

    // Validação dos campos obrigatórios
    if (!username || !email || !phone) {
        return res.status(400).json({ message: 'Nome de usuário, email e telefone são obrigatórios.' });
    }

    // Validação básica de formato de email (pode ser aprimorada)
    if (!/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    try {
        // CORREÇÃO: Inclui o campo email na query UPDATE
        const updateQuery = 'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?';
        await connection.query(updateQuery, [username, email, phone, id]);

        // Busca os dados atualizados para retornar ao frontend
        const selectQuery = 'SELECT id, username, email, phone, profile_image_url, role FROM users WHERE id = ?';
        const [updatedUsers] = await connection.query(selectQuery, [id]);

        if (updatedUsers.length === 0) {
            // Este caso não deveria acontecer se a validação do token funcionou, mas é uma boa prática
            return res.status(404).json({ message: 'Usuário não encontrado após atualização.' });
        }

        // Retorna o usuário completo (sem a senha)
        const { password: _, ...userWithoutPassword } = updatedUsers[0];

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: userWithoutPassword
        });
    } catch (error) {
        // Trata erro de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'O email informado já está em uso por outra conta.' });
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
    }
});

module.exports = router; // Certifique-se de que o router é exportado