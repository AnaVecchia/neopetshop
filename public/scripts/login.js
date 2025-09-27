document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3030/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            localStorage.setItem('user', JSON.stringify(data.user)); // Armazena dados do usuário
            window.location.href = 'home.html';
        } else {
            alert(data.message);
        }
    });
});