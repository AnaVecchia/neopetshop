document.addEventListener('DOMContentLoaded', function() {
    const profileImg = document.getElementById('profile-img');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const profileForm = document.getElementById('profile-form');
    
    let originalUserData = {};

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

    function populateProfileData() {
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('user');

        if (!token || !userDataString) {
            alert('Sessão inválida ou expirada. Por favor, faça o login novamente.');
            window.location.href = '/index.html';
            return;
        }

        try {
            const user = JSON.parse(userDataString);
            originalUserData = { ...user };

            profileImg.src = user.profile_image_url || 'https://via.placeholder.com/150';
            usernameInput.value = user.username;
            emailInput.value = user.email;
            phoneInput.value = user.phone;
        } catch (e) {
            console.error('Erro ao processar dados do usuário:', e);
            alert('Dados de usuário corrompidos. Por favor, faça o login novamente.');
            localStorage.clear();
            window.location.href = '/index.html';
        }
    }

    function toggleEditMode(isEditing) {
        usernameInput.disabled = !isEditing;
        phoneInput.disabled = !isEditing;
        editBtn.hidden = isEditing;
        saveBtn.hidden = !isEditing;
        cancelBtn.hidden = !isEditing;
    }

    editBtn.addEventListener('click', () => {
        toggleEditMode(true);
    });

    cancelBtn.addEventListener('click', () => {
        usernameInput.value = originalUserData.username;
        phoneInput.value = originalUserData.phone;
        toggleEditMode(false);
    });

    profileForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';

        const updatedData = {
            username: usernameInput.value,
            phone: phoneInput.value,
        };

        try {
            const response = await fetchWithAuth(`http://localhost:3030/api/users/${originalUserData.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Falha ao atualizar o perfil.');
            }
            
            localStorage.setItem('user', JSON.stringify(result.user));
            originalUserData = { ...result.user };

            alert(result.message);
            toggleEditMode(false);

        } catch (error) {
            alert(`Erro: ${error.message}`);
            // Restaura o formulário para o estado original em caso de erro
            usernameInput.value = originalUserData.username;
            phoneInput.value = originalUserData.phone;
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar Alterações';
        }
    });

    populateProfileData();

    // --- NOVO CÓDIGO PARA O MENU MOBILE RESPONSIVO ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            mainMenu.classList.toggle('menu-open');
        });
    }
});