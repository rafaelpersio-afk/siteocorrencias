// Login script
const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    fetchEmpresas();
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('createUserLink').addEventListener('click', () => {
        window.location.href = 'pages/createUser.html';
    });
});

function fetchEmpresas() {
    console.log('Buscando empresas de:', `${API_URL}/api/empresas`);
    fetch(`${API_URL}/api/empresas`)
        .then(response => {
            console.log('Resposta empresas:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Dados empresas:', data);
            const select = document.getElementById('empresa');
            data.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nome;
                select.appendChild(option);
            });
            console.log('Empresas carregadas no select');
        })
        .catch(error => {
            console.error('Erro ao buscar empresas:', error);
        });
}

function login(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const empresa_id = document.getElementById('empresa').value;

    const data = { username, password };
    if (empresa_id && empresa_id.trim()) {
        data.empresa_id = empresa_id;
    }

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            redirectUser(data.role);
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Erro no login:', error);
        alert('Erro ao conectar ao servidor');
    });
}

function redirectUser(role) {
    if (role === 'super_admin') {
        window.location.href = 'pages/superadmin.html';
    } else if (role === 'admin') {
        window.location.href = 'pages/admin.html';
    } else {
        window.location.href = 'pages/dashboard.html';
    }
}