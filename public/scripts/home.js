document.addEventListener('DOMContentLoaded', function () {

    // --- verificação de admin e adição do botão de cadastro ---
    const userDataString = localStorage.getItem('user'); // pega dados do usuário do localStorage

    if (userDataString) {
        try {
            const user = JSON.parse(userDataString);

            // verifica se o usuário é admin pela 'role' (mais seguro que verificar email)
            if (user && user.role === 'admin') {
                const adminButton = document.createElement('a');
                adminButton.href = '/cadastro-produtos.html'; // usa caminho relativo à raiz
                adminButton.textContent = 'cadastrar produtos';
                adminButton.classList.add('btn-admin'); // classe para estilização

                // adiciona o botão ao container do cabeçalho
                const headerContainer = document.querySelector('.header-area'); // container específico no header
                if (headerContainer) {
                    headerContainer.appendChild(adminButton);
                } else {
                    console.warn('container do cabeçalho (.header-area) não encontrado para adicionar o botão de admin.');
                }
            }
        } catch (e) {
            console.error('erro ao processar dados do usuário do localStorage:', e);
            // opcionalmente, limpar dados corrompidos: localStorage.removeItem('user');
        }
    }

    // --- lógica do menu mobile ---
    const menuToggle = document.getElementById('menu-toggle');       // botão de abrir/fechar
    const menuMobileArea = document.getElementById('menu-mobile-area'); // área do menu

    if (menuToggle && menuMobileArea) {
        menuToggle.addEventListener('click', function() {
            menuMobileArea.classList.toggle('open'); // alterna a classe 'open' para exibir/ocultar
        });
    } else {
        console.warn('elementos do menu mobile (menu-toggle ou menu-mobile-area) não encontrados.');
    }

    // --- função de logout ---
    function logout() {
        localStorage.removeItem('token'); // remove o token de autenticação
        localStorage.removeItem('user');  // remove os dados do usuário
        window.location.href = '/index.html'; // redireciona para a página de login
    }

    // --- anexa a função de logout ao botão correspondente ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // previne a ação padrão do link, se houver
            logout();
        });
    }
    // se o botão tiver outra ID, ajuste o seletor acima.

});