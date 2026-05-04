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
}

module.exports = IncidentsController;