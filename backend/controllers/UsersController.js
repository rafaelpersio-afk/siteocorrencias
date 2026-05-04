// Users controller
const User = require('../models/User');

class UsersController {
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, status, role, search } = req.query;
      const empresa_id = req.user.role === 'super_admin' ? null : req.user.empresa_id;

      const filters = {
        empresa_id,
        status,
        role,
        search,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const users = await User.findAll(filters);
      const stats = await User.getStats(empresa_id);

      res.json({
        users,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['aprovado', 'rejeitado', 'pendente'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.updateStatus(id, status);
      res.json({ message: 'Status atualizado com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['super_admin', 'admin', 'usuario'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido' });
      }

      // Only super_admin can change roles
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.updateRole(id, role);
      res.json({ message: 'Role atualizado com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Erro ao atualizar role' });
    }
  }

  static async createUser(req, res) {
    try {
      const { username, email, password, role, empresa_id } = req.body;

      if (!username || !password || !empresa_id || !role) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['admin', 'usuario'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido' });
      }

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.create({ username, email, password, empresa_id, role });
      res.json({ id: result.id, message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
}

module.exports = UsersController;