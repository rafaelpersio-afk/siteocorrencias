// Super Admin script
const API_URL = window.location.origin;

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

document.addEventListener('DOMContentLoaded', function() {
    fetchEmpresas();
    fetchAllUsers();
    loadEscolasList();
});

function showTab(tabId, event) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');

    if (tabId === 'allUsers') {
        fetchAllUsersWithPasswords();
    }
    if (tabId === 'promover') {
        loadUsersBySchool();
    }
}

function loadEscolasList() {
    fetch(`${API_URL}/empresas`)
        .then(response => response.json())
        .then(data => {
            const div = document.getElementById('escolasList');
            div.innerHTML = '';
            if (data.length === 0) {
                div.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma escola registrada</p>';
                return;
            }
            data.forEach(escola => {
                const item = document.createElement('div');
                item.className = 'escola-item';
                item.innerHTML = `<i class="fas fa-school"></i> <strong>${escola.nome}</strong> (ID: ${escola.id})`;
                div.appendChild(item);
            });
        });
}

function fetchEmpresas() {
    fetch(`${API_URL}/empresas`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('empresa_id');
            const promoteSelect = document.getElementById('promoteSchool');
            select.innerHTML = '<option value="">Selecione uma escola</option>';
            promoteSelect.innerHTML = '<option value="">Selecione uma escola</option>';
            data.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nome;
                select.appendChild(option);

                const promoteOption = document.createElement('option');
                promoteOption.value = empresa.id;
                promoteOption.textContent = empresa.nome;
                promoteSelect.appendChild(promoteOption);
            });
        });
}

function fetchAllUsers() {
    fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('allUsersTable');
        tbody.innerHTML = '';
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.escola || 'N/A'}</td>
                <td>${user.role}</td>
                <td class="status-${user.status}">${user.status}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function fetchAllUsersWithPasswords() {
    fetch(`${API_URL}/users-criados`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('allUsersTable');
        tbody.innerHTML = '';
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.escola || 'N/A'}</td>
                <td>${user.role}</td>
                <td class="status-${user.status}">${user.status}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function loadUsersBySchool() {
    const schoolId = document.getElementById('promoteSchool').value;
    if (!schoolId) {
        document.getElementById('promoteUsersTable').innerHTML = '';
        return;
    }
    fetch(`${API_URL}/users?empresa_id=${schoolId}`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('promoteUsersTable');
        tbody.innerHTML = '';
        data.forEach(user => {
            const tr = document.createElement('tr');
            let acoes = '';
            if (user.role === 'usuario') {
                acoes = `<button class="btn" onclick="promoverUsuario(${user.id})"><i class="fas fa-arrow-up"></i> Promover</button>`;
            } else if (user.role === 'admin') {
                acoes = `<button class="btn btn-danger" onclick="rebaixarUsuario(${user.id})"><i class="fas fa-arrow-down"></i> Rebaixar</button>`;
            }
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.escola || 'N/A'}</td>
                <td>${user.role}</td>
                <td class="status-${user.status}">${user.status}</td>
                <td>${acoes}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function criarEscola() {
    const nome = document.getElementById('nomeEscola').value;
    if (!nome) {
        alert('Digite o nome da escola');
        return;
    }
    fetch(`${API_URL}/empresa`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nome })
    })
    .then(response => response.json())
    .then(data => {
        alert('Escola criada!');
        document.getElementById('nomeEscola').value = '';
        fetchEmpresas();
        loadEscolasList();
    });
}

function criarUsuario() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const empresa_id = document.getElementById('empresa_id').value;
    
    if (!username || !password || !empresa_id) {
        alert('Preencha todos os campos');
        return;
    }
    
    fetch(`${API_URL}/createUser`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, password, role, empresa_id })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário criado!');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        fetchAllUsers();
    });
}

function promoverUsuario(userId) {
    fetch(`${API_URL}/promover`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário promovido a Admin!');
        loadUsersBySchool();
        fetchAllUsers();
    });
}

function rebaixarUsuario(userId) {
    if (!confirm('Deseja rebaixar este usuário para Usuário normal?')) return;
    
    fetch(`${API_URL}/rebaixar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário rebaixado!');
        loadUsersBySchool();
        fetchAllUsers();
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}