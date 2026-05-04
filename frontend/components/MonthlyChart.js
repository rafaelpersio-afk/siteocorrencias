// Simple Chart component for monthly incidents
class MonthlyChart {
  constructor(container) {
    this.container = container;
    this.data = [];
    this.render();
    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch('/api/incidents/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      this.data = data.monthly || [];
      this.render();
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  }

  render() {
    if (this.data.length === 0) {
      this.container.innerHTML = `
        <div class="chart-container">
          <div class="chart-header">
            <h3>Ocorrências por Mês</h3>
          </div>
          <div class="chart-placeholder">
            <i class="fas fa-chart-line"></i>
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      `;
      return;
    }

    // Sort data by month
    const sortedData = this.data.sort((a, b) => a.month.localeCompare(b.month));

    // Get last 6 months
    const recentData = sortedData.slice(-6);

    // Calculate max value for scaling
    const maxValue = Math.max(...recentData.map(d => d.count));

    this.container.innerHTML = `
      <div class="chart-container">
        <div class="chart-header">
          <h3>Ocorrências por Mês</h3>
        </div>
        <div class="simple-chart">
          ${recentData.map(item => `
            <div class="chart-bar">
              <div class="bar-container">
                <div class="bar" style="height: ${maxValue > 0 ? (item.count / maxValue) * 100 : 0}%">
                  <span class="bar-value">${item.count}</span>
                </div>
              </div>
              <div class="bar-label">${this.formatMonth(item.month)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }

  refresh() {
    this.loadData();
  }
}

// Export for use in other files
window.MonthlyChart = MonthlyChart;