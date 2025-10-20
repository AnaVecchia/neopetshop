// /scripts/home.js

// Aguarda o conteúdo da página ser totalmente carregado para garantir que os elementos HTML existam
document.addEventListener('DOMContentLoaded', function () {
    
    // Pega os dados do usuário salvos no localStorage
    const userDataString = localStorage.getItem('user');

    // Verifica se existe algum dado de usuário salvo
    if (userDataString) {
        // Converte a string JSON de volta para um objeto
        const user = JSON.parse(userDataString);

        //Verifica se o objeto 'user' e a propriedade 'email' existem e se o email contém "admin"
        if (user && user.email && user.email.includes('admin')) {
            
            //Cria o botão
            const adminButton = document.createElement('a');
            adminButton.href = 'cadastro-produtos.html'; 
            adminButton.textContent = 'Cadastrar Produtos'; 
            adminButton.classList.add('btn-admin'); 

            // Adiciona o botão ao cabeçalho
            const container = document.querySelector('.header-area'); 
            if (container) {
                container.appendChild(adminButton);
            }
        }
    }

    // --- LÓGICA CORRIGIDA PARA O MENU MOBILE ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuMobileArea = document.getElementById('menu-mobile-area');

    if (menuToggle && menuMobileArea) {
        menuToggle.addEventListener('click', function() {
            menuMobileArea.classList.toggle('open');
        });
    }

    // Função de logout (MANTIDA)
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});