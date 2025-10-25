document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('product-form');

    // envia requisições à API anexando o token JWT, se disponível
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // removemos os logs de debug do token

        return fetch(url, { ...options, headers });
    }

    // lida com a submissão do formulário de cadastro de produto
    productForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // previne recarregamento da página

        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true; // desabilita botão durante envio
        submitButton.textContent = 'Cadastrando...';

        // coleta dados do formulário
        const productData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            image_url: document.getElementById('image_url').value
        };

        try {
            // envia dados para a API usando POST autenticado
            const response = await fetchWithAuth('http://localhost:3030/api/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            const data = await response.json(); // processa a resposta JSON

            // verifica se a API retornou um erro
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao cadastrar o produto.');
            }

            // sucesso
            alert(data.message || 'Produto cadastrado com sucesso!');
            productForm.reset(); // limpa o formulário

        } catch (error) {
            // falha na requisição ou erro da API
            console.error('Erro na requisição de cadastro:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        } finally {
            // reabilita o botão, ocorrendo sucesso ou falha
            submitButton.disabled = false;
            submitButton.textContent = 'Cadastrar Produto';
        }
    });
});