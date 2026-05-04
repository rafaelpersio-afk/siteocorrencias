// Super Admin script
const API_URL = window.location.origin;

let currentUser = null;
let sidebar = null;
let dashboardCards = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeSuperAdmin();
});

async function initializeSuperAdmin() {
    try {
        // Get current user info from token
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = payload;

        // Initialize components
        const sidebarContainer = document.getElementById('sidebar-container');
        sidebar = new Sidebar(sidebarContainer, currentUser, 'schools');

        const cardsContainer = document.getElementById('dashboard-cards');
        dashboardCards = new DashboardCards(cardsContainer);

        // Load initial data
        await loadEscolas();
        await loadEmpresasSelect();
        await loadAllUsers();
        await loadPromoteSchools();

        // Listen for sidebar navigation
        document.addEventListener('sidebarNavigate', handleNavigation);

    } catch (error) {
        console.error('Error initializing superadmin:', error);
        logout();
    }
}

async function handleNavigation(event) {
    const { page } = event.detail;
    hideAllSections();

    switch(page) {
        case 'dashboard':
            // Show dashboard cards
            break;
        case 'schools':
            showSection('schools-section');
            await loadEscolas();
            break;
        case 'users':
            showSection('create-user-section');
            await loadEmpresasSelect();
            break;
        default:
            showSection('schools-section');
            break;
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

function hideAllSections() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function loadEscolas() {
    try {
        const response = await fetch(`${API_URL}/empresas`);

        if (!response.ok) throw new Error('Failed to load empresas');

        const data = await response.json();
        renderEscolas(data);
    } catch (error) {
        console.error('Error loading empresas:', error);
        showError('Erro ao carregar escolas');
    }
}

function renderEscolas(data) {
    const container = document.getElementById('escolas-list');

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <h4>Nenhuma escola encontrada</h4>
                <p>Não há escolas registradas no sistema.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(escola => `
        <div class="escola-item">
            <i class="fas fa-school"></i>
            <strong>${escola.nome}</strong> (ID: ${escola.id})
        </div>
    `).join('');
}

async function loadEmpresasSelect() {
    try {
        const response = await fetch(`${API_URL}/empresas`);

        if (!response.ok) throw new Error('Failed to load empresas');

        const data = await response.json();

        const select = document.getElementById('empresa_id');
        select.innerHTML = '<option value="">Selecione uma escola</option>';

        data.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.id;
            option.textContent = escola.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading empresas select:', error);
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_URL}/users-criados`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load all users');

        const data = await response.json();
        renderAllUsers(data);
    } catch (error) {
        console.error('Error loading all users:', error);
        showError('Erro ao carregar usuários');
    }
}

function renderAllUsers(data) {
    const container = document.getElementById('all-users-list');

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>Nenhum usuário encontrado</h4>
                <p>Não há usuários registrados no sistema.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Escola</th>
                    <th>Role</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="allUsersTable"></tbody>
        </table>
    `;

    const tbody = document.getElementById('allUsersTable');
    tbody.innerHTML = '';

    data.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td>${user.empresa_nome || 'N/A'}</td>
            <td><span style="background: #e7f3ff; padding: 5px 10px; border-radius: 3px; font-size: 12px;">${user.role}</span></td>
            <td class="status-${user.status}"><strong>${user.status}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadPromoteSchools() {
    try {
        const response = await fetch(`${API_URL}/empresas`);

        if (!response.ok) throw new Error('Failed to load empresas');

        const data = await response.json();

        const select = document.getElementById('promoteSchool');
        select.innerHTML = '<option value="">Selecione uma escola</option>';

        data.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.id;
            option.textContent = escola.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading promote schools:', error);
    }
}

async function loadUsersBySchool() {
    const schoolId = document.getElementById('promoteSchool').value;
    if (!schoolId) {
        document.getElementById('promote-users-list').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users?empresa_id=${schoolId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load users by school');

        const data = await response.json();
        renderPromoteUsers(data);
    } catch (error) {
        console.error('Error loading users by school:', error);
        showError('Erro ao carregar usuários da escola');
    }
}

function renderPromoteUsers(data) {
    const container = document.getElementById('promote-users-list');

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>Nenhum usuário encontrado</h4>
                <p>Não há usuários nesta escola.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="promoteUsersTable"></tbody>
        </table>
    `;

    const tbody = document.getElementById('promoteUsersTable');
    tbody.innerHTML = '';

    data.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td><span style="background: #e7f3ff; padding: 5px 10px; border-radius: 3px; font-size: 12px;">${user.role}</span></td>
            <td class="status-${user.status}"><strong>${user.status}</strong></td>
            <td>
                ${user.role === 'usuario' ? `<button class="btn" onclick="promoverAdmin(${user.id})"><i class="fas fa-arrow-up"></i> Promover</button>` : ''}
                ${user.role === 'admin' ? `<button class="btn btn-danger" onclick="rebaixarAdmin(${user.id})"><i class="fas fa-arrow-down"></i> Rebaixar</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showError(message) {
    // Simple error display
    alert(message);
}

// Legacy functions for backward compatibility
function fetchEmpresas() {
    loadEmpresasSelect();
}

function fetchAllUsers() {
    loadAllUsers();
}

function loadEscolasList() {
    loadEscolas();
}

function criarEscola() {
    const nome = document.getElementById('nomeEscola').value.trim();
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
        alert('Escola criada com sucesso!');
        document.getElementById('nomeEscola').value = '';
        loadEscolas();
        loadEmpresasSelect();
        loadPromoteSchools();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar escola');
    });
}

function criarUsuario() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const empresa_id = document.getElementById('empresa_id').value;

    if (!username || !password || !role || !empresa_id) {
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
        alert('Usuário criado com sucesso!');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loadAllUsers();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar usuário');
    });
}

function promoverAdmin(userId) {
    if (!confirm('Deseja promover este usuário a Admin?')) return;

    fetch(`${API_URL}/promover-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário promovido a Admin!');
        loadUsersBySchool();
        loadAllUsers();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao promover usuário');
    });
}

function rebaixarAdmin(userId) {
    if (!confirm('Deseja rebaixar este usuário?')) return;

    fetch(`${API_URL}/rebaixar-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário rebaixado!');
        loadUsersBySchool();
        loadAllUsers();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao rebaixar usuário');
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}