document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) return; // sai se o formulário não existir

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // previne recarregamento da página

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitButton = this.querySelector('button[type="submit"]');

        const email = emailInput.value;
        const password = passwordInput.value;

        // validação básica de entrada (opcional)
        if (!email || !password) {
            alert('por favor, preencha o email e a senha.');
            return;
        }

        submitButton.disabled = true; // desabilita botão durante a requisição
        submitButton.textContent = 'entrando...';

        try {
            // envia credenciais para a API de login
            const response = await fetch('http://localhost:3030/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json(); // processa a resposta JSON

            // verifica se a API retornou erro (ex: 401 Unauthorized)
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'email ou senha inválidos.');
            }

            // sucesso no login
            // alert(data.message); // alerta de sucesso pode ser redundante antes do redirect
            localStorage.setItem('token', data.token); // salva o token JWT
            localStorage.setItem('user', JSON.stringify(data.user)); // salva dados do usuário
            localStorage.removeItem('cart'); // limpa o carrinho antigo
            window.location.href = '/home.html'; // redireciona para a página inicial

        } catch (error) {
            // exibe erro para o usuário
            console.error('erro durante o login:', error);
            alert(error.message || 'ocorreu um erro ao tentar fazer login.');
            submitButton.disabled = false; // reabilita botão em caso de falha
            submitButton.textContent = 'entrar';
        }
    });
});