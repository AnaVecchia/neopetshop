document.getElementById('cadastro-form').addEventListener('submit', async function(event) { // A função se torna async
    event.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Desabilita o botão para evitar cliques duplos
    submitButton.textContent = 'Cadastrando...';

    try {
        // --- ETAPA 1: Busca a foto do cachorro primeiro ---
        let profileImageUrl = 'https://media.istockphoto.com/id/178482530/photo/placeholder-banner-dog.jpg?s=612x612&w=0&k=20&c=--7JEUvZkBkObHgs2-m0IIKbh-D4QO58GLxw_HyxPc4='; // Uma imagem padrão caso a API falhe
        try {
            const dogApiResponse = await fetch('https://dog.ceo/api/breeds/image/random');
            if (dogApiResponse.ok) {
                const dogApiData = await dogApiResponse.json();
                profileImageUrl = dogApiData.message;
            }
        } catch (apiError) {
            console.warn('API de fotos de cachorro falhou, usando imagem padrão.', apiError);
        }
        
        // --- ETAPA 2: Coleta os dados do formulário ---
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value;

        // --- ETAPA 3: Monta o corpo da requisição COM a URL da foto ---
        const registrationData = {
            email,
            username,
            password,
            phone,
            profile_image_url: profileImageUrl // Envia a URL pronta
        };

        // --- ETAPA 4: Envia tudo para o seu backend ---
        const response = await fetch('http://localhost:3030/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        const data = await response.json();

        if (!response.ok) {
            // Se a resposta do servidor não for de sucesso (ex: 409 - email duplicado)
            throw new Error(data.message || 'Ocorreu um erro no cadastro.');
        }

        // Se o cadastro deu certo
        alert(data.message);
        window.location.href = 'index.html'; // Redireciona para a página de login

    } catch (error) {
        // Se qualquer parte do processo falhar
        alert(error.message);
    } finally {
        // Garante que o botão seja reativado, mesmo se der erro
        submitButton.disabled = false;
        submitButton.textContent = 'Cadastrar';
    }
});