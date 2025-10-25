const jwt = require('jsonwebtoken');
require('dotenv').config(); // garante que process.env seja carregado

// middleware para verificar a validade do token jwt
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null; // extrai token do cabeçalho 'Bearer TOKEN'

    // retorna erro se o token não for encontrado
    if (!token) {
        return res.status(401).json({ message: `token de autenticação não fornecido., ${token}` }); // 401 para não autorizado
    }

    // verifica o token usando o segredo do .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // retorna erro se o token for inválido ou expirado
        if (err) {
            console.error('erro na verificação do token:', err.name); // log do erro para debug
            let message = 'token inválido.';
            if (err.name === 'TokenExpiredError') {
                message = 'token expirado.';
            }
            return res.status(401).json({ message: message }); // 401 para token inválido/expirado
        }

        // anexa os dados decodificados (payload) do token ao objeto req.user
        req.user = decoded; // contém { userId, role }
        next(); // passa para o próximo middleware ou rota
    });
}

// middleware para verificar se o usuário autenticado tem a role 'admin'
function isAdmin(req, res, next) {
    // verifica a role anexada pelo middleware verifyToken
    if (req.user?.role !== 'admin') { // usa optional chaining por segurança
        return res.status(403).json({ message: 'acesso negado. rota exclusiva para administradores.' }); // 403 para acesso proibido
    }
    next(); // permite o acesso se for admin
}

module.exports = { verifyToken, isAdmin };