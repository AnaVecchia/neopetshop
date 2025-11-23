// /scripts/cadastro.js

document.addEventListener('DOMContentLoaded', function () {
    const cadastroForm = document.getElementById('cadastro-form');

    if (!cadastroForm) {
        console.error('erro: formulário #cadastro-form não encontrado.');
        return; // sai se o formulário não existir
    }

    cadastroForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // previne o envio padrão do formulário

        const submitButton = this.querySelector('button[type="submit"]');
        const passwordInput = document.getElementById('password'); // seleciona campo de senha para validação

        // desabilita botão para evitar cliques múltiplos
        submitButton.disabled = true;
        submitButton.textContent = 'cadastrando...';

        // --- validação de senha no frontend ---
        const password = passwordInput.value;
        if (password.length < 6) {
            alert('a senha deve ter no mínimo 6 caracteres.');
            submitButton.disabled = false; // reabilita botão
            submitButton.textContent = 'cadastrar';
            return; // impede envio
        }
        if (!/[A-Z]/.test(password)) {
            alert('a senha deve conter pelo menos uma letra maiúscula.');
            submitButton.disabled = false; // reabilita botão
            submitButton.textContent = 'cadastrar';
            return; // impede envio
        }
        // --- fim da validação de senha ---

        try {
            // busca url de imagem aleatória de cachorro (com fallback)
            let profileImageUrl = 'https://media.istockphoto.com/id/178482530/photo/placeholder-banner-dog.jpg?s=612x612&w=0&k=20&c=--7JEUvZkBkObHgs2-m0IIKbh-D4QO58GLxw_HyxPc4='; // fallback
            try {
                const dogApiResponse = await fetch('https://dog.ceo/api/breeds/image/random');
                if (dogApiResponse.ok) {
                    const dogApiData = await dogApiResponse.json();
                    profileImageUrl = dogApiData.message;
                } else {
                     console.warn(`api dog.ceo respondeu com status ${dogApiResponse.status}, usando imagem padrão.`);
                }
            } catch (apiError) {
                console.warn('falha ao buscar imagem da api dog.ceo, usando imagem padrão.', apiError);
            }

            // coleta dados do formulário
            const registrationData = {
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: password, // usa a variável já lida
                phone: document.getElementById('phone').value,
                profile_image_url: profileImageUrl // inclui url da imagem
            };

            // envia dados para o endpoint de cadastro
            const response = await fetch('/api/auth/cadastro', {
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
            // reabilita o botão apenas em caso de erro, pois o sucesso redireciona
            submitButton.disabled = false;
            submitButton.textContent = 'cadastrar';
        }
        // 'finally' removido pois o botão só precisa ser reabilitado no erro
    });
});