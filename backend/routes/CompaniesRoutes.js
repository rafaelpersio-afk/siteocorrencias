// Companies routes
const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Mock data for companies (in a real app, this would be in a controller)
const companies = [
  { id: 1, nome: 'Escola Municipal João Paulo II' },
  { id: 2, nome: 'Escola Estadual Maria José' },
  { id: 3, nome: 'Escola Particular Santo Antônio' }
];

// GET /api/empresas - Public route for login
router.get('/', (req, res) => {
  res.json(companies);
});

// All routes below require authentication
router.use(verifyToken);

// DELETE /api/empresas/:id
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const companyIndex = companies.findIndex(c => c.id == id);

  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }

  const deletedCompany = companies.splice(companyIndex, 1)[0];
  res.json({ message: 'Empresa excluída com sucesso', empresa: deletedCompany });
});

module.exports = router;