// Incidents controller
const Incident = require('../models/Incident');

class IncidentsController {
  static async getIncidents(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        aluno,
        turma,
        data_inicio,
        data_fim
      } = req.query;

      const empresa_id = req.user.empresa_id;

      const filters = {
        empresa_id,
        aluno,
        turma,
        data_inicio,
        data_fim,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const incidents = await Incident.findAll(filters);
      const totalCount = await Incident.getTotalCount(empresa_id);

      res.json({
        incidents,
        total: totalCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get incidents error:', error);
      res.status(500).json({ error: 'Erro ao buscar ocorrências' });
    }
  }

  static async createIncident(req, res) {
    try {
      const { aluno, turma, descricao, data, hora } = req.body;
      const empresa_id = req.user.empresa_id;
      const created_by = req.user.id;

      if (!aluno || !turma || !descricao || !data || !hora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const result = await Incident.create({
        aluno,
        turma,
        descricao,
        data,
        hora,
        empresa_id,
        created_by
      });

      res.json({ id: result.id, message: 'Ocorrência criada com sucesso' });
    } catch (error) {
      console.error('Create incident error:', error);
      res.status(500).json({ error: 'Erro ao criar ocorrência' });
    }
  }

  static async getIncidentStats(req, res) {
    try {
      const empresa_id = req.user.empresa_id;
      const months = parseInt(req.query.months) || 6;

      const stats = await Incident.getStats(empresa_id, months);
      const totalCount = await Incident.getTotalCount(empresa_id);

      res.json({
        total: totalCount,
        monthly: stats
      });
    } catch (error) {
      console.error('Get incident stats error:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  static async updateIncident(req, res) {
    try {
      const { id } = req.params;
      const { aluno, turma, descricao, data, hora } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!aluno || !turma || !descricao || !data || !hora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Get user to determine empresa_id
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Check if incident exists and belongs to user's empresa
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      // Check permissions: user can edit their own incidents, admin can edit all incidents in their empresa
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && incident.user_id !== userId) {
        return res.status(403).json({ error: 'Você não tem permissão para editar esta ocorrência' });
      }

      if (req.user.role !== 'super_admin' && incident.empresa_id !== user.empresa_id) {
        return res.status(403).json({ error: 'Você não tem permissão para editar ocorrências de outras empresas' });
      }

      // Update incident
      await Incident.update(id, {
        aluno,
        turma,
        descricao,
        data,
        hora
      });

      res.json({ message: 'Ocorrência atualizada com sucesso' });
    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({ error: 'Erro ao atualizar ocorrência' });
    }
  }

  static async deleteIncident(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get user to determine empresa_id
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Check if incident exists and belongs to user's empresa
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      // Check permissions: user can delete their own incidents, admin can delete all incidents in their empresa
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && incident.user_id !== userId) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir esta ocorrência' });
      }

      if (req.user.role !== 'super_admin' && incident.empresa_id !== user.empresa_id) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir ocorrências de outras empresas' });
      }

      // Delete incident
      await Incident.delete(id);

      res.json({ message: 'Ocorrência excluída com sucesso' });
    } catch (error) {
      console.error('Delete incident error:', error);
      res.status(500).json({ error: 'Erro ao excluir ocorrência' });
    }
  }
}

module.exports = IncidentsController;