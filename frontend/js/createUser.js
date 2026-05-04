// Create User script
const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    fetchEmpresas();
    document.getElementById('createUserForm').addEventListener('submit', createUser);
});

function fetchEmpresas() {
    fetch(`${API_URL}/api/empresas`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('empresa');
            data.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nome;
                select.appendChild(option);
            });
        });
}

function createUser(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const empresa_id = document.getElementById('empresa').value;

    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${API_URL}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password, empresa_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            alert('Usuário criado com sucesso! Aguarde aprovação.');
            window.location.href = '/index.html';
        } else {
            alert(data.error);
        }
    });
}