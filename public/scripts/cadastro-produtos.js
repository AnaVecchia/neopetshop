document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('product-form');

    // Função auxiliar para realizar requisições autenticadas
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');

        // --- LINHA DE DEBUG ---
        console.log('Tentando fazer requisição para:', url);
        console.log('Token recuperado do localStorage:', token);
        // --------------------

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Cabeçalho Authorization sendo enviado.');
        } else {
            // --- AVISO DE DEBUG ---
            console.error('ALERTA: NENHUM TOKEN ENCONTRADO NO LOCALSTORAGE!');
            // ----------------------
        }

        return fetch(url, { ...options, headers });
    }

    productForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Cadastrando...';

        const productData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            image_url: document.getElementById('image_url').value
        };

        try {
            const response = await fetchWithAuth('http://localhost:3030/api/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Lança um erro que será capturado pelo bloco catch
                throw new Error(data.message || 'Falha ao cadastrar o produto.');
            }

            alert(data.message);
            productForm.reset();

        } catch (error) {
            console.error('Erro na requisição:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        } finally {
            // Reabilita o botão, independentemente do resultado
            submitButton.disabled = false;
            submitButton.textContent = 'Cadastrar Produto';
        }
    });
});