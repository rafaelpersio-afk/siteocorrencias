// Incident model
const { dataDb } = require('./Database');

class Incident {
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM ocorrencias WHERE 1=1";
      let params = [];

      if (filters.empresa_id) {
        query += " AND empresa_id = ?";
        params.push(filters.empresa_id);
      }

      if (filters.aluno) {
        query += " AND aluno LIKE ?";
        params.push(`%${filters.aluno}%`);
      }

      if (filters.turma) {
        query += " AND turma LIKE ?";
        params.push(`%${filters.turma}%`);
      }

      if (filters.data_inicio) {
        query += " AND data >= ?";
        params.push(filters.data_inicio);
      }

      if (filters.data_fim) {
        query += " AND data <= ?";
        params.push(filters.data_fim);
      }

      query += " ORDER BY created_at DESC";

      if (filters.limit) {
        query += " LIMIT ?";
        params.push(filters.limit);
      }

      if (filters.offset) {
        query += " OFFSET ?";
        params.push(filters.offset);
      }

      dataDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      dataDb.get("SELECT * FROM ocorrencias WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async create(incidentData) {
    return new Promise((resolve, reject) => {
      const { aluno, turma, descricao, data, hora, empresa_id, created_by } = incidentData;

      dataDb.run(
        "INSERT INTO ocorrencias (aluno, turma, descricao, data, hora, empresa_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [aluno, turma, descricao, data, hora, empresa_id, created_by],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async getStats(empresa_id = null, months = 6) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count
        FROM ocorrencias
        WHERE created_at >= date('now', '-${months} months')
      `;
      let params = [];

      if (empresa_id) {
        query += " AND empresa_id = ?";
        params.push(empresa_id);
      }

      query += " GROUP BY strftime('%Y-%m', created_at) ORDER BY month";

      dataDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getTotalCount(empresa_id = null) {
    return new Promise((resolve, reject) => {
      let query = "SELECT COUNT(*) as total FROM ocorrencias";
      let params = [];

      if (empresa_id) {
        query += " WHERE empresa_id = ?";
        params.push(empresa_id);
      }

      dataDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  }
}

module.exports = Incident;