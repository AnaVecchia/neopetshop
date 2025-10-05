const express = require('express');
const connection = require('../db_config');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { username, phone } = req.body;

    if (parseInt(req.user.userId) !== parseInt(id)) {
        return res.status(403).json({ message: 'Acesso negado: você só pode editar seu próprio perfil.' });
    }

    if (!username || !phone) {
        return res.status(400).json({ message: 'Nome de usuário e telefone são obrigatórios.' });
    }

    try {
        await connection.query('UPDATE users SET username = ?, phone = ? WHERE id = ?', [username, phone, id]);
        const [updatedUsers] = await connection.query('SELECT id, username, email, phone, profile_image_url FROM users WHERE id = ?', [id]);

        if (updatedUsers.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUsers[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
    }
});

module.exports = router;