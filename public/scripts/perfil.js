document.addEventListener('DOMContentLoaded', function () {
    // seletores de elementos do DOM
    const profileImg = document.getElementById('profile-img');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const profileForm = document.getElementById('profile-form');
    const menuToggle = document.getElementById('menu-toggle'); // menu mobile
    const mainMenu = document.getElementById('main-menu');       // menu mobile

    // verifica se todos os elementos essenciais do formulário existem
    if (!profileImg || !usernameInput || !emailInput || !phoneInput || !editBtn || !saveBtn || !cancelBtn || !profileForm) {
        console.error('erro: um ou mais elementos do formulário de perfil não foram encontrados.');
        return; // interrompe a execução se elementos cruciais faltarem
    }

    let originalUserData = {}; // armazena os dados originais do usuário para cancelamento

    // função auxiliar para requisições autenticadas (anexa token JWT)
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }

    // preenche os campos do formulário com os dados do usuário do localStorage
    function populateProfileData() {
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('user');

        // redireciona para login se não houver sessão ativa
        if (!token || !userDataString) {
            alert('sessão inválida ou expirada. por favor, faça o login novamente.');
            window.location.href = '/index.html';
            return;
        }

        try {
            const user = JSON.parse(userDataString);
            originalUserData = { ...user }; // clona os dados para restauração

            // preenche os campos
            profileImg.src = user.profile_image_url || 'https://via.placeholder.com/150'; // usa placeholder se não houver imagem
            profileImg.alt = `foto de perfil de ${user.username || 'usuário'}`;
            usernameInput.value = user.username || '';
            emailInput.value = user.email || '';
            phoneInput.value = user.phone || '';
        } catch (e) {
            // lida com dados corrompidos no localStorage
            console.error('erro ao processar dados do usuário do localStorage:', e);
            alert('dados de usuário corrompidos. por favor, faça o login novamente.');
            localStorage.clear(); // limpa localStorage corrompido
            window.location.href = '/index.html'; // redireciona para login
        }
    }

    // alterna a UI entre modo de visualização e modo de edição
    function toggleEditMode(isEditing) {
        // habilita/desabilita campos editáveis
        usernameInput.disabled = !isEditing;
        emailInput.disabled = !isEditing;
        phoneInput.disabled = !isEditing;

        // mostra/esconde botões de ação
        editBtn.hidden = isEditing;
        saveBtn.hidden = !isEditing;
        cancelBtn.hidden = !isEditing;
    }

    // --- event listeners ---

    // botão editar: ativa o modo de edição
    editBtn.addEventListener('click', () => {
        toggleEditMode(true);
    });

    // botão cancelar: restaura dados originais e desativa edição
    cancelBtn.addEventListener('click', () => {
        usernameInput.value = originalUserData.username || '';
        emailInput.value = originalUserData.email || '';
        phoneInput.value = originalUserData.phone || '';
        toggleEditMode(false);
    });

    // submissão do formulário: envia dados atualizados para a API
    profileForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // previne recarregamento

        saveBtn.disabled = true; // desabilita botão durante envio
        saveBtn.textContent = 'salvando...';

        // coleta dados atualizados dos inputs
        const updatedData = {
            username: usernameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
        };

        try {
            // envia requisição PUT autenticada
            const response = await fetchWithAuth(`http://localhost:3030/api/users/${originalUserData.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            // verifica se a API retornou erro
            if (!response.ok) {
                throw new Error(result.message || 'falha ao atualizar o perfil.');
            }

            // sucesso: atualiza localStorage e UI
            localStorage.setItem('user', JSON.stringify(result.user)); // atualiza dados locais
            originalUserData = { ...result.user }; // atualiza backup dos dados
            alert(result.message || 'perfil atualizado com sucesso!');
            toggleEditMode(false); // retorna ao modo de visualização

        } catch (error) {
            // falha: exibe erro e restaura campos para valores originais
            alert(`erro: ${error.message}`);
            usernameInput.value = originalUserData.username || '';
            emailInput.value = originalUserData.email || '';
            phoneInput.value = originalUserData.phone || '';
        } finally {
            // reabilita o botão, ocorrendo sucesso ou falha
            saveBtn.disabled = false;
            saveBtn.textContent = 'salvar alterações';
        }
    });

    // listener para o menu mobile (se existir)
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            mainMenu.classList.toggle('menu-open');
        });
    } else {
        // console.warn('elementos do menu mobile (menu-toggle ou main-menu) não encontrados.');
    }

    // carrega os dados do perfil ao iniciar a página
    populateProfileData();
});