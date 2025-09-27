document.getElementById('product-form').addEventListener('submit', function(event) {
    // Impede o recarregamento padrão da página ao submeter o formulário
    event.preventDefault();

    // Coleta os valores dos campos do formulário
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const image_url = document.getElementById('image_url').value;

    // Cria o objeto de dados para enviar na requisição
    const productData = {
        title,
        description,
        price: parseFloat(price), // Garante que o preço seja enviado como número
        image_url
    };

    // Envia a requisição para o backend
    fetch('http://localhost:3030/produto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Exibe a mensagem de sucesso ou erro do servidor
        if (data.message.includes('sucesso')) {
            // Se o produto foi inserido, limpa o formulário
            document.getElementById('product-form').reset();
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro ao tentar cadastrar o produto.');
    });
});