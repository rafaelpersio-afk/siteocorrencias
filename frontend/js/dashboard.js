// Modern Dashboard Script
const API_URL = window.location.origin;

let currentUser = null;
let sidebar = null;
let dashboardCards = null;
let monthlyChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Get current user info from token
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        // Decode token to get user info (simple decode, not secure)
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = payload;

        // Initialize components
        const sidebarContainer = document.getElementById('sidebar-container');
        sidebar = new Sidebar(sidebarContainer, currentUser, 'dashboard');

        const cardsContainer = document.getElementById('dashboard-cards');
        dashboardCards = new DashboardCards(cardsContainer);

        const chartContainer = document.getElementById('monthly-chart');
        monthlyChart = new MonthlyChart(chartContainer);

        // Load initial data
        await loadIncidents();

        // Listen for sidebar navigation
        document.addEventListener('sidebarNavigate', handleNavigation);

        // Add edit incident form listener
        document.getElementById('edit-incident-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const incidentId = e.target.dataset.incidentId;

            const incidentData = {
                aluno: formData.get('aluno'),
                turma: formData.get('turma'),
                descricao: formData.get('descricao'),
                data: formData.get('data'),
                hora: formData.get('hora')
            };

            try {
                const response = await fetch(`${API_URL}/api/incidents/${incidentId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(incidentData)
                });

                if (!response.ok) throw new Error('Failed to update incident');

                showSuccess('Ocorrência atualizada com sucesso!');
                closeEditModal();
                await loadIncidents();
                if (dashboardCards) dashboardCards.refresh();
                if (monthlyChart) monthlyChart.refresh();
            } catch (error) {
                console.error('Error updating incident:', error);
                showError('Erro ao atualizar ocorrência');
            }
        });

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        logout();
    }
}

async function handleNavigation(event) {
    const { page } = event.detail;
    hideAllSections();

    switch (page) {
        case 'dashboard':
            document.getElementById('dashboard-cards').style.display = 'block';
            document.getElementById('monthly-chart').style.display = 'block';
            document.getElementById('incidents-section').style.display = 'block';
            break;
        case 'incidents':
            document.getElementById('incidents-section').style.display = 'block';
            break;
        case 'users':
            if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
                document.getElementById('users-section').style.display = 'block';
                await loadUsers();
            }
            break;
        case 'schools':
            if (currentUser.role === 'super_admin') {
                document.getElementById('schools-section').style.display = 'block';
                await loadSchools();
            }
            break;
    }
}

function hideAllSections() {
    const sections = ['dashboard-cards', 'monthly-chart', 'incidents-section', 'new-incident-section', 'users-section', 'schools-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

async function loadIncidents() {
    try {
        const response = await fetch(`${API_URL}/api/incidents`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to load incidents');

        const data = await response.json();
        renderIncidents(data.incidents);
    } catch (error) {
        console.error('Error loading incidents:', error);
        showError('Erro ao carregar ocorrências');
    }
}

function renderIncidents(incidents) {
    const container = document.getElementById('incidents-list');

    if (!incidents || incidents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Nenhuma ocorrência encontrada</h4>
                <p>Crie sua primeira ocorrência usando o botão acima.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = incidents.map(incident => `
        <div class="incident-card">
            <div class="incident-header">
                <div>
                    <div class="incident-title">${incident.aluno} - ${incident.turma}</div>
                    <div class="incident-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(incident.data)}</span>
                        <span><i class="fas fa-clock"></i> ${incident.hora}</span>
                    </div>
                </div>
                <div class="incident-actions">
                    <button class="btn btn-sm" onclick="editarIncidente(${incident.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirIncidente(${incident.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>
                </div>
            </div>
            <div class="incident-description">${incident.descricao}</div>
            <div class="incident-date">Criado em ${formatDateTime(incident.created_at)}</div>
        </div>
    `).join('');
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        renderUsers(data.users);
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Erro ao carregar usuários');
    }
}

function renderUsers(users) {
    const container = document.getElementById('users-list');

    if (!users || users.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h4>Nenhum usuário encontrado</h4></div>';
        return;
    }

    const tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Escola</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.role}</td>
                        <td><span class="status-${user.status}">${user.status}</span></td>
                        <td>${user.escola || '-'}</td>
                        <td>
                            ${user.status === 'pendente' ? `
                                <button class="btn btn-success" onclick="approveUser(${user.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-danger" onclick="rejectUser(${user.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            ${currentUser.role === 'super_admin' && user.role !== 'super_admin' ? `
                                <button class="btn btn-warning" onclick="toggleRole(${user.id}, '${user.role === 'admin' ? 'usuario' : 'admin'}')">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

async function loadSchools() {
    try {
        const response = await fetch(`${API_URL}/empresas`);
        if (!response.ok) throw new Error('Failed to load schools');

        const schools = await response.json();
        renderSchools(schools);
    } catch (error) {
        console.error('Error loading schools:', error);
        showError('Erro ao carregar escolas');
    }
}

function renderSchools(schools) {
    const container = document.getElementById('schools-list');

    if (!schools || schools.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><h4>Nenhuma escola encontrada</h4></div>';
        return;
    }

    const tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome da Escola</th>
                </tr>
            </thead>
            <tbody>
                ${schools.map(school => `
                    <tr>
                        <td>${school.id}</td>
                        <td>${school.nome}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

// Form handling
function showNewIncidentForm() {
    document.getElementById('incidents-section').style.display = 'none';
    document.getElementById('new-incident-section').style.display = 'block';
}

function hideNewIncidentForm() {
    document.getElementById('new-incident-section').style.display = 'none';
    document.getElementById('incidents-section').style.display = 'block';
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
        const response = await fetch(`${API_URL}/api/incidents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(incidentData)
        });

        if (!response.ok) throw new Error('Failed to create incident');

        const result = await response.json();
        showSuccess('Ocorrência criada com sucesso!');

        // Reset form and hide
        event.target.reset();
        hideNewIncidentForm();

        // Refresh data
        await loadIncidents();
        if (dashboardCards) dashboardCards.refresh();
        if (monthlyChart) monthlyChart.refresh();

    } catch (error) {
        console.error('Error creating incident:', error);
        showError('Erro ao criar ocorrência');
    }
}

function showNewUserForm() {
    // TODO: Implement new user form
    showInfo('Funcionalidade em desenvolvimento');
}

function showNewSchoolForm() {
    // TODO: Implement new school form
    showInfo('Funcionalidade em desenvolvimento');
}

// User management
async function approveUser(userId) {
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'aprovado' })
        });

        if (!response.ok) throw new Error('Failed to approve user');

        showSuccess('Usuário aprovado com sucesso!');
        await loadUsers();
        if (dashboardCards) dashboardCards.refresh();

    } catch (error) {
        console.error('Error approving user:', error);
        showError('Erro ao aprovar usuário');
    }
}

async function rejectUser(userId) {
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'rejeitado' })
        });

        if (!response.ok) throw new Error('Failed to reject user');

        showSuccess('Usuário rejeitado');
        await loadUsers();
        if (dashboardCards) dashboardCards.refresh();

    } catch (error) {
        console.error('Error rejecting user:', error);
        showError('Erro ao rejeitar usuário');
    }
}

async function toggleRole(userId, newRole) {
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) throw new Error('Failed to update role');

        showSuccess('Role atualizado com sucesso!');
        await loadUsers();

    } catch (error) {
        console.error('Error updating role:', error);
        showError('Erro ao atualizar role');
    }
}

async function editarIncidente(incidentId) {
    try {
        const response = await fetch(`${API_URL}/api/incidents/${incidentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to load incident');

        const incident = await response.json();

        // Preencher o formulário de edição
        document.getElementById('edit-aluno').value = incident.aluno;
        document.getElementById('edit-turma').value = incident.turma;
        document.getElementById('edit-descricao').value = incident.descricao;
        document.getElementById('edit-data').value = incident.data;
        document.getElementById('edit-hora').value = incident.hora;

        // Armazenar o ID da ocorrência sendo editada
        document.getElementById('edit-incident-form').dataset.incidentId = incidentId;

        // Mostrar o modal
        document.getElementById('edit-incident-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading incident for edit:', error);
        showError('Erro ao carregar ocorrência para edição');
    }
}

async function excluirIncidente(incidentId) {
    if (!confirm('Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/incidents/${incidentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to delete incident');

        showSuccess('Ocorrência excluída com sucesso!');
        await loadIncidents();
        if (dashboardCards) dashboardCards.refresh();
        if (monthlyChart) monthlyChart.refresh();
    } catch (error) {
        console.error('Error deleting incident:', error);
        showError('Erro ao excluir ocorrência');
    }
}

function closeEditModal() {
    document.getElementById('edit-incident-modal').style.display = 'none';
    document.getElementById('edit-incident-form').reset();
}

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
}

function showSuccess(message) {
    // Simple alert for now, could be replaced with toast notifications
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

function showInfo(message) {
    alert('ℹ️ ' + message);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}