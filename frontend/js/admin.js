// Admin script
const API_URL = window.location.origin;

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

const currentUserId = getCurrentUserId();

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    
    // Set current time as default
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('hora').value = `${hours}:${minutes}`;
    
    fetchUsers();
    fetchAllUsersForNiveis();
    fetchOcorrencias();
});

function showTab(tabId, event) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tabId === 'ocorrencias') {
        fetchOcorrencias();
    }
    if (tabId === 'niveis') {
        fetchAllUsersForNiveis();
    }
}

function fetchUsers() {
    fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = '';
        
        const pendentes = data.filter(u => u.status === 'pendente');
        
        if (pendentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhum usuário pendente</td></tr>';
            return;
        }
        
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
    });
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
        fetchUsers();
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
        fetchUsers();
    })
    .catch(error => alert('Erro ao recusar usuário'));
}

function criarOcorrencia() {
    const aluno = document.getElementById('aluno').value.trim();
    const turma = document.getElementById('turma').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    if (!aluno || !turma || !descricao || !data || !hora) {
        alert('Preencha todos os campos');
        return;
    }

    fetch(`${API_URL}/ocorrencia`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ aluno, turma, descricao, data, hora })
    })
    .then(response => response.json())
    .then(data => {
        alert('Ocorrência registrada com sucesso!');
        document.getElementById('aluno').value = '';
        document.getElementById('turma').value = '';
        document.getElementById('descricao').value = '';
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('data').value = today;
        
        fetchOcorrencias();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao registrar ocorrência');
    });
}

function fetchOcorrencias() {
    fetch(`${API_URL}/ocorrencias`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const div = document.getElementById('ocorrenciasList');
        div.innerHTML = '';
        
        if (data.length === 0) {
            div.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhuma ocorrência registrada</p>';
            return;
        }
        
        data.forEach(ocorrencia => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.borderLeft = '4px solid #ffc107';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #333;">
                            <i class="fas fa-user"></i> ${ocorrencia.aluno}
                        </h4>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>Turma:</strong> ${ocorrencia.turma}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>Descrição:</strong> ${ocorrencia.descricao}
                        </p>
                        <p style="margin: 5px 0; color: #999; font-size: 12px;">
                            <i class="fas fa-calendar"></i> ${ocorrencia.data} às ${ocorrencia.hora}
                        </p>
                    </div>
                </div>
            `;
            div.appendChild(card);
        });
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}

function fetchAllUsersForNiveis() {
    fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('niveisTable');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhum usuário na sua escola</td></tr>';
            return;
        }
        
        data.forEach(user => {
            const tr = document.createElement('tr');
            let acoes = '';
            
            if (user.id !== currentUserId) {
                if (user.role === 'usuario') {
                    acoes = `<button class="btn" onclick="promoverAdmin(${user.id})"><i class="fas fa-arrow-up"></i> Promover a Admin</button>`;
                } else if (user.role === 'admin') {
                    acoes = `<button class="btn btn-danger" onclick="rebaixarAdmin(${user.id})"><i class="fas fa-arrow-down"></i> Rebaixar</button>`;
                }
            }
            
            tr.innerHTML = `
                <td><strong>${user.username}</strong></td>
                <td><span style="background: ${user.role === 'admin' ? '#ffc107' : '#e7f3ff'}; padding: 5px 10px; border-radius: 3px; font-size: 12px; color: ${user.role === 'admin' ? '#000' : '#000'};">${user.role}</span></td>
                <td class="status-${user.status}">${user.status}</td>
                <td>${acoes}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar usuários:', error);
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
        fetchAllUsersForNiveis();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao promover usuário');
    });
}

function rebaixarAdmin(userId) {
    if (!confirm('Deseja rebaixar este usuário para Usuário normal?')) return;
    
    fetch(`${API_URL}/rebaixar-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário rebaixado!');
        fetchAllUsersForNiveis();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao rebaixar usuário');
    });
}