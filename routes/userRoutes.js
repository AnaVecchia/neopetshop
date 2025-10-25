const express = require('express');
const connection = require('../db_config'); // assume exportação do pool mysql2/promise
const { verifyToken } = require('../middleware/auth'); // middleware de autenticação
const router = express.Router();

// put /api/users/:id - atualiza o perfil do usuário autenticado
/*
    #swagger.tags = ['Users']
    #swagger.summary = 'atualiza o perfil do usuário autenticado.'
    #swagger.description = 'permite que o usuário autenticado atualize seu nome de usuário, email e telefone. o id na url deve corresponder ao id do token.'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'id do usuário a ser atualizado.',
        required: true,
        type: 'integer'
    }
    #swagger.parameters['obj'] = {
        in: 'body',
        description: 'dados a serem atualizados.',
        required: true,
        schema: { $ref: "#/definitions/UserProfileUpdate" }
    }
    #swagger.responses[200] = {
        description: 'perfil atualizado com sucesso.',
        schema: {
            message: 'perfil atualizado com sucesso!',
            user: { $ref: "#/definitions/UserBase" } // refinar: definir UserBase em swagger.js
        }
    }
    #swagger.responses[400] = { description: 'dados inválidos (campos obrigatórios, formato de id/email).', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[401] = { description: 'token inválido ou expirado.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[403] = { description: 'tentativa de editar perfil de outro usuário.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[404] = { description: 'usuário não encontrado.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[409] = { description: 'o email informado já está em uso por outra conta.', schema: { $ref: "#/definitions/ErrorResponse" } }
    #swagger.responses[500] = { description: 'erro interno ao atualizar usuário.', schema: { $ref: "#/definitions/ErrorResponse" } }
*/
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, phone } = req.body; // extrai dados do corpo da requisição

    // validação: usuário só pode editar o próprio perfil
    if (parseInt(req.user.userId) !== parseInt(id)) {
        return res.status(403).json({ message: 'acesso negado: você só pode editar seu próprio perfil.' }); // 403 Forbidden
    }

    // validação: campos obrigatórios
    if (!username || !email || !phone) {
        return res.status(400).json({ message: 'nome de usuário, email e telefone são obrigatórios.' }); // 400 Bad Request
    }

    // validação: formato básico de email
    if (!/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'formato de email inválido.' }); // 400 Bad Request
    }

     // validação básica do ID (número inteiro positivo)
     if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'ID do usuário inválido.' });
    }

    try {
        // atualiza os dados do usuário no banco
        const updateQuery = 'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?';
        const [updateResult] = await connection.query(updateQuery, [username, email, phone, id]);

        // verifica se o usuário foi encontrado e atualizado
        if (updateResult.affectedRows === 0) {
             // teoricamente não deve ocorrer devido à verificação do token, mas é uma segurança
             return res.status(404).json({ message: 'usuário não encontrado para atualização.' }); // 404 Not Found
        }

        // busca os dados atualizados (sem a senha) para retornar ao frontend
        const selectQuery = 'SELECT id, username, email, phone, profile_image_url, role FROM users WHERE id = ?';
        const [updatedUsers] = await connection.query(selectQuery, [id]);

        // verifica se a busca pós-update retornou o usuário (confirmação extra)
         if (updatedUsers.length === 0) {
             console.error(`usuário id ${id} atualizado, mas não encontrado imediatamente após.`);
             return res.status(404).json({ message: 'usuário não encontrado após atualização.' });
         }

        // remove hash da senha antes de retornar
        const { password: _, ...userWithoutPassword } = updatedUsers[0];

        // envia resposta de sucesso com os dados atualizados
        res.status(200).json({
            message: 'perfil atualizado com sucesso!',
            user: userWithoutPassword
        });

    } catch (error) {
        // trata erro específico de email duplicado (constraint UNIQUE)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'o email informado já está em uso por outra conta.' }); // 409 Conflict
        }
        // trata outros erros de banco ou inesperados
        console.error('erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'erro interno ao atualizar usuário.' }); // 500 Internal Server Error
    }
});

module.exports = router;