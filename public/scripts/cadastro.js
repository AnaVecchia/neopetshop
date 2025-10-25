document.addEventListener('DOMContentLoaded', function () {
    const cadastroForm = document.getElementById('cadastro-form');

    if (!cadastroForm) return; // sai se o formulário não existir

    cadastroForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // previne o envio padrão do formulário

        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true; // desabilita botão para evitar cliques múltiplos
        submitButton.textContent = 'Cadastrando...';

        try {
            // busca url de imagem aleatória de cachorro
            let profileImageUrl = 'https://media.istockphoto.com/id/178482530/photo/placeholder-banner-dog.jpg?s=612x612&w=0&k=20&c=--7JEUvZkBkObHgs2-m0IIKbh-D4QO58GLxw_HyxPc4='; // fallback
            try {
                const dogApiResponse = await fetch('https://dog.ceo/api/breeds/image/random');
                if (dogApiResponse.ok) {
                    const dogApiData = await dogApiResponse.json();
                    profileImageUrl = dogApiData.message;
                } else {
                     console.warn(`API dog.ceo respondeu com status ${dogApiResponse.status}`);
                }
            } catch (apiError) {
                console.warn('falha ao buscar imagem da API dog.ceo, usando imagem padrão.', apiError);
            }

            // coleta dados do formulário
            const registrationData = {
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value,
                profile_image_url: profileImageUrl // inclui url da imagem
            };

            // envia dados para o endpoint de cadastro
            const response = await fetch('http://localhost:3030/api/auth/cadastro', { // rota corrigida para /cadastro
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            // verifica se a API retornou erro
            if (!response.ok) {
                throw new Error(data.message || 'ocorreu um erro no cadastro.');
            }

            // sucesso no cadastro
            alert(data.message || 'cadastro realizado com sucesso!');
            window.location.href = '/index.html'; // redireciona para login

        } catch (error) {
            // exibe erro para o usuário
            console.error('erro durante o cadastro:', error);
            alert(error.message || 'não foi possível completar o cadastro.');
        } finally {
            // reabilita o botão, independentemente do resultado
            submitButton.disabled = false;
            submitButton.textContent = 'Cadastrar';
        }
    });
});