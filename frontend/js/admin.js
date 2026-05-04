// Admin script
const API_URL = window.location.origin;

let currentUser = null;
let sidebar = null;
let dashboardCards = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

async function initializeAdmin() {
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
        sidebar = new Sidebar(sidebarContainer, currentUser, 'users');

        const cardsContainer = document.getElementById('dashboard-cards');
        dashboardCards = new DashboardCards(cardsContainer);

        // Load initial data
        await loadUsers();
        await loadNiveisUsers();
        await loadOcorrencias();

        // Listen for sidebar navigation
        document.addEventListener('sidebarNavigate', handleNavigation);

    } catch (error) {
        console.error('Error initializing admin:', error);
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
        case 'users':
            showSection('aprovar-section');
            await loadUsers();
            break;
        case 'incidents':
            showSection('ocorrencias-section');
            await loadOcorrencias();
            break;
        default:
            showSection('aprovar-section');
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

function getCurrentUserId() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (error) {
        return null;
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        renderUsers(data);
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Erro ao carregar usuários');
    }
}

function renderUsers(data) {
    const container = document.getElementById('users-pending-list');

    const pendentes = data.filter(u => u.status === 'pendente');

    if (pendentes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>Nenhum usuário pendente</h4>
                <p>Todos os usuários foram aprovados ou não há solicitações pendentes.</p>
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
            <tbody id="usersTable"></tbody>
        </table>
    `;

    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';

    pendentes.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td><span style="background: #e7f3ff; padding: 5px 10px; border-radius: 3px; font-size: 12px;">${user.role}</span></td>
            <td class="status-${user.status}"><strong>${user.status}</strong></td>
            <td>
                <button class="btn" onclick="aprovar(${user.id})"><i class="fas fa-check"></i> Aprovar</button>
                <button class="btn btn-danger" onclick="recusar(${user.id})"><i class="fas fa-times"></i> Recusar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadNiveisUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        renderNiveisUsers(data);
    } catch (error) {
        console.error('Error loading users for niveis:', error);
        showError('Erro ao carregar usuários');
    }
}

function renderNiveisUsers(data) {
    const container = document.getElementById('users-niveis-list');

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>Nenhum usuário encontrado</h4>
                <p>Não há usuários para gerenciar.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <p style="color: #666; margin-bottom: 20px;">Aqui você pode promover usuários a Admin ou rebaixá-los para Usuário</p>
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Nível Atual</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="niveisTable"></tbody>
        </table>
    `;

    const tbody = document.getElementById('niveisTable');
    tbody.innerHTML = '';

    data.forEach(user => {
        if (user.id === currentUser.id) return; // Não mostrar o próprio usuário

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td><span style="background: #e7f3ff; padding: 5px 10px; border-radius: 3px; font-size: 12px;">${user.role}</span></td>
            <td class="status-${user.status}"><strong>${user.status}</strong></td>
            <td>
                ${user.role === 'usuario' ? `<button class="btn" onclick="promover(${user.id})"><i class="fas fa-arrow-up"></i> Promover</button>` : ''}
                ${user.role === 'admin' ? `<button class="btn btn-danger" onclick="rebaixar(${user.id})"><i class="fas fa-arrow-down"></i> Rebaixar</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadOcorrencias() {
    try {
        const response = await fetch(`${API_URL}/ocorrencias`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load ocorrencias');

        const data = await response.json();
        renderOcorrencias(data);
    } catch (error) {
        console.error('Error loading ocorrencias:', error);
        showError('Erro ao carregar ocorrências');
    }
}

function renderOcorrencias(data) {
    const container = document.getElementById('ocorrencias-list');

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Nenhuma ocorrência encontrada</h4>
                <p>Não há ocorrências registradas na escola.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(ocorrencia => `
        <div class="incident-card">
            <div class="incident-header">
                <div>
                    <div class="incident-title">${ocorrencia.aluno} - ${ocorrencia.turma}</div>
                    <div class="incident-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(ocorrencia.data)}</span>
                        <span><i class="fas fa-clock"></i> ${ocorrencia.hora}</span>
                    </div>
                </div>
            </div>
            <div class="incident-description">${ocorrencia.descricao}</div>
            <div class="incident-date">Criado em ${formatDateTime(ocorrencia.created_at || new Date().toISOString())}</div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function showError(message) {
    // Simple error display
    alert(message);
}

// Legacy functions for backward compatibility
function fetchUsers() {
    loadUsers();
}

function fetchAllUsersForNiveis() {
    loadNiveisUsers();
}

function fetchOcorrencias() {
    loadOcorrencias();
}

function aprovar(userId) {
    fetch(`${API_URL}/aprovar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário aprovado com sucesso!');
        loadUsers();
    })
    .catch(error => alert('Erro ao aprovar usuário'));
}

function recusar(userId) {
    if (!confirm('Deseja realmente recusar este usuário?')) return;

    fetch(`${API_URL}/recusar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário recusado!');
        loadUsers();
    })
    .catch(error => alert('Erro ao recusar usuário'));
}

function promover(userId) {
    if (!confirm('Deseja promover este usuário a Admin?')) return;

    fetch(`${API_URL}/promover-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário promovido a Admin!');
        loadNiveisUsers();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao promover usuário');
    });
}

function rebaixar(userId) {
    if (!confirm('Deseja rebaixar este usuário?')) return;

    fetch(`${API_URL}/rebaixar-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário rebaixado!');
        loadNiveisUsers();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao rebaixar usuário');
    });
}

async function createIncident(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const incidentData = {
        aluno: formData.get('aluno'),
        turma: formData.get('turma'),
        descricao: formData.get('descricao'),
        data: formData.get('data'),
        hora: formData.get('hora')
    };

    try {
        const response = await fetch(`${API_URL}/ocorrencia`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(incidentData)
        });

        if (!response.ok) throw new Error('Failed to create incident');

        const result = await response.json();
        alert('Ocorrência criada com sucesso!');

        // Reset form
        event.target.reset();

        // Refresh data
        await loadOcorrencias();

    } catch (error) {
        console.error('Error creating incident:', error);
        alert('Erro ao criar ocorrência');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}