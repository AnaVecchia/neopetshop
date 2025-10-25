const swaggerAutogen = require('swagger-autogen')();
require('dotenv').config(); // para carregar a porta, se necessário

const doc = {
    info: {
        version: '1.0.0',              
        title: 'API Pelos & Patas E-commerce',
        description: 'documentação da API RESTful para o TCC Pelos & Patas.'
    },
    host: `localhost:${process.env.PORT || 3030}`,
    basePath: '/api',                  // prefixo base das rotas da api
    schemes: ['http'],                 // esquemas suportados (http, https)
    consumes: ['application/json'],    // formatos de entrada esperados
    produces: ['application/json'],    // formatos de saída fornecidos
    tags: [                            // agrupando rotas por funcionalidade 
        {
            name: 'Auth',
            description: 'endpoints de autenticação e cadastro'
        },
        {
            name: 'Users',
            description: 'endpoints de gerenciamento de usuários'
        },
        {
            name: 'Products',
            description: 'endpoints de gerenciamento de produtos'
        },
        {
            name: 'Orders',
            description: 'endpoints de gerenciamento de pedidos'
        }
    ],
    securityDefinitions: {             // define como a autenticação funciona
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'insira o token JWT no formato: Bearer <token>'
        }
    },
    definitions: {                     // definições de schemas reutilizáveis
        LoginCredentials: {
            $email: 'admin@pep.com',
            $password: 'pep123'
        },
        UserRegistration: {
            $email: 'admin@pep.com',
            $username: 'Admin Pelos',
            $password: 'pep123',
            $phone: '51999998888',
            profile_image_url: 'https://dog.ceo/api/breeds/image/random'
        },
        UserProfileUpdate: {
             $username: 'Usuário Admin Atualizado da Silva',
             $email: 'atualizado@pep.com',
             $phone: '51988887777'
        },
        Product: {
            $title: 'Ração Para Cachorros',
            $description: 'Descrição detalhada do produto.',
            image_url: 'https://dog.ceo/api/breeds/image/random',
            $price: 49.99
        },
        CartItem: {
             $id: 1,
             $quantity: 2
        },
        OrderPayload: {
             $cart: [{ $ref: '#/definitions/CartItem' }]
        },
        ErrorResponse: {
            message: 'mensagem de erro detalhada'
        }
        // adicione outras definições conforme necessário
    }
};

const outputFile = './swagger_output.json'; // arquivo de saída
// array com os arquivos que contêm suas rotas express
const endpointsFiles = [
    './routes/authRoutes.js',
    './routes/userRoutes.js',
    './routes/productRoutes.js',
    './routes/orderRoutes.js'
];

// gera o arquivo swagger_output.json
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('documentação swagger gerada em swagger_output.json');
});