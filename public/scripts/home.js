document.addEventListener('DOMContentLoaded', function () {
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