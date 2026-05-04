// Sidebar component
class Sidebar {
  constructor(container, user, currentPage = 'dashboard') {
    this.container = container;
    this.user = user;
    this.currentPage = currentPage;
    this.render();
  }

  render() {
    const menuItems = this.getMenuItems();
    const sidebarHtml = `
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="fas fa-school"></i>
            <span>Sistema Escolar</span>
          </div>
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <div class="user-name">${this.user.username}</div>
              <div class="user-role">${this.getRoleDisplay(this.user.role)}</div>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${menuItems.map(item => `
            <a href="#" class="nav-item ${this.currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
              <i class="${item.icon}"></i>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = sidebarHtml;
    this.attachEventListeners();
  }

  getMenuItems() {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
      { id: 'incidents', label: 'Ocorrências', icon: 'fas fa-exclamation-triangle' }
    ];

    if (this.user.role === 'admin' || this.user.role === 'super_admin') {
      baseItems.push(
        { id: 'users', label: 'Gerenciar Usuários', icon: 'fas fa-users' }
      );
    }

    if (this.user.role === 'super_admin') {
      baseItems.push(
        { id: 'schools', label: 'Gerenciar Escolas', icon: 'fas fa-building' }
      );
    }

    return baseItems;
  }

  getRoleDisplay(role) {
    const roles = {
      'super_admin': 'Super Administrador',
      'admin': 'Administrador',
      'usuario': 'Usuário'
    };
    return roles[role] || role;
  }

  attachEventListeners() {
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  }

  navigateTo(page) {
    // Update active state
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const activeItem = this.container.querySelector(`[data-page="${page}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    this.currentPage = page;

    // Trigger navigation event
    const event = new CustomEvent('sidebarNavigate', { detail: { page } });
    document.dispatchEvent(event);
  }
}

// Export for use in other files
window.Sidebar = Sidebar;