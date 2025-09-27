// Aguarda o conteúdo da página ser totalmente carregado para garantir que os elementos HTML existam
document.addEventListener('DOMContentLoaded', function() {
    // 1. Pega os dados do usuário salvos no localStorage
    const userDataString = localStorage.getItem('user');
    console.log(userDataString);
    

    // Verifica se existe algum dado de usuário salvo
    if (userDataString) {
        // 2. Converte a string JSON de volta para um objeto
        const user = JSON.parse(userDataString);

        // 3. Verifica se o objeto 'user' e a propriedade 'email' existem e se o email contém "admin"
        if (user && user.email && user.email.includes('admin')) {
            console.log('Usuário administrador detectado!'); // Mensagem para depuração

            // 4. Cria o botão (usaremos uma tag 'a' para facilitar o link)
            const adminButton = document.createElement('a');
            adminButton.href = 'cadastro-produtos.html'; // O link para a página de cadastro
            adminButton.textContent = 'Cadastrar Produtos'; // O texto do botão

            // Adiciona uma classe para que você possa estilizar o botão com CSS, se quiser
            adminButton.classList.add('btn', 'btn-admin'); 
            
            // 5. Adiciona o botão à página
            // Encontra um local na sua página para adicionar o botão. 
            // Por exemplo, em um container com o id="admin-controls".
            // Se não encontrar, ele será adicionado ao final do body.
            const container = document.getElementById('header-area') || document.body;
            container.appendChild(adminButton);
        } else {
            console.log("User admin não detectado!");
        }
    } else {
        // Opcional: Redireciona para a página de login se não houver usuário logado
        console.log('Nenhum usuário logado. Redirecionando para o login.');
        // window.location.href = 'login.html'; // Descomente esta linha se quiser forçar o redirecionamento
    }
});