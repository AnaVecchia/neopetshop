document.addEventListener('DOMContentLoaded', function() {
    // --- SELETORES DE ELEMENTOS ---
    const profileImg = document.getElementById('profile-img');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const profileForm = document.getElementById('profile-form');
    
    let originalUserData = {}; // Para guardar os dados originais ao cancelar

    // --- FUNÇÕES ---

    // Carrega os dados do perfil do localStorage e preenche a página
    function populateProfileData() {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) {
            alert('Você precisa estar logado para ver seu perfil.');
            window.location.href = 'index.html'; // Redireciona para o login
            return;
        }

        const user = JSON.parse(userDataString);
        originalUserData = { ...user }; // Clona os dados do usuário

        profileImg.src = user.profile_image_url;
        usernameInput.value = user.username;
        emailInput.value = user.email;
        phoneInput.value = user.phone;
    }

    // Alterna entre o modo de visualização e edição
    function toggleEditMode(isEditing) {
        usernameInput.disabled = !isEditing;
        phoneInput.disabled = !isEditing;

        editBtn.hidden = isEditing;
        saveBtn.hidden = !isEditing;
        cancelBtn.hidden = !isEditing;
    }

    // --- EVENT LISTENERS ---

    // Habilita o modo de edição
    editBtn.addEventListener('click', () => {
        toggleEditMode(true);
    });

    // Cancela a edição e restaura os dados originais
    cancelBtn.addEventListener('click', () => {
        usernameInput.value = originalUserData.username;
        phoneInput.value = originalUserData.phone;
        toggleEditMode(false);
    });

    // Salva as alterações
    profileForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const updatedData = {
            username: usernameInput.value,
            phone: phoneInput.value,
        };

        try {
            const response = await fetch(`http://localhost:3030/usuario/${originalUserData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o perfil.');
            }

            const result = await response.json();
            
            // CRUCIAL: Atualiza os dados no localStorage com as novas informações
            localStorage.setItem('user', JSON.stringify(result.user));
            originalUserData = { ...result.user }; // Atualiza os dados originais também

            alert(result.message);
            toggleEditMode(false); // Volta para o modo de visualização

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    // Carrega os dados assim que a página é aberta
    populateProfileData();
});