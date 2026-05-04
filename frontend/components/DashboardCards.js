// Dashboard Cards component
class DashboardCards {
  constructor(container) {
    this.container = container;
    this.stats = {};
    this.loading = true;
    this.render();
    this.loadStats();
  }

  async loadStats() {
    try {
      this.loading = true;
      this.render();

      // Load user stats
      const userResponse = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const userData = await userResponse.json();

      // Load incident stats
      const incidentResponse = await fetch('/api/incidents/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const incidentData = await incidentResponse.json();

      this.stats = {
        totalUsers: userData.stats.total,
        pendingUsers: userData.stats.pending,
        approvedUsers: userData.stats.approved,
        totalIncidents: incidentData.total,
        monthlyIncidents: incidentData.monthly
      };

      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Error loading stats:', error);
      this.loading = false;
      this.render();
    }
  }

  render() {
    if (this.loading) {
      this.container.innerHTML = `
        <div class="dashboard-cards">
          <div class="card loading">
            <div class="card-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="card-content">
              <div class="card-title">Carregando...</div>
              <div class="card-value">--</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const cards = [
      {
        title: 'Total de Usuários',
        value: this.stats.totalUsers || 0,
        icon: 'fas fa-users',
        color: 'blue',
        trend: null
      },
      {
        title: 'Usuários Pendentes',
        value: this.stats.pendingUsers || 0,
        icon: 'fas fa-clock',
        color: 'orange',
        trend: null
      },
      {
        title: 'Usuários Aprovados',
        value: this.stats.approvedUsers || 0,
        icon: 'fas fa-check-circle',
        color: 'green',
        trend: null
      },
      {
        title: 'Total de Ocorrências',
        value: this.stats.totalIncidents || 0,
        icon: 'fas fa-exclamation-triangle',
        color: 'red',
        trend: this.calculateTrend()
      }
    ];

    this.container.innerHTML = `
      <div class="dashboard-cards">
        ${cards.map(card => `
          <div class="card ${card.color}">
            <div class="card-icon">
              <i class="${card.icon}"></i>
            </div>
            <div class="card-content">
              <div class="card-title">${card.title}</div>
              <div class="card-value">${card.value}</div>
              ${card.trend ? `<div class="card-trend ${card.trend.type}">${card.trend.value}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  calculateTrend() {
    if (!this.stats.monthlyIncidents || this.stats.monthlyIncidents.length < 2) {
      return null;
    }

    const sorted = this.stats.monthlyIncidents.sort((a, b) => a.month.localeCompare(b.month));
    const current = sorted[sorted.length - 1].count;
    const previous = sorted[sorted.length - 2].count;

    if (previous === 0) return null;

    const change = ((current - previous) / previous) * 100;
    const type = change >= 0 ? 'positive' : 'negative';
    const icon = change >= 0 ? '↑' : '↓';

    return {
      type,
      value: `${icon} ${Math.abs(change).toFixed(1)}%`
    };
  }

  refresh() {
    this.loadStats();
  }
}

// Export for use in other files
window.DashboardCards = DashboardCards;