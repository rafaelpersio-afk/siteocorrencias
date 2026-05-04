// Incidents routes
const express = require('express');
const IncidentsController = require('../controllers/IncidentsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/incidents
router.get('/', IncidentsController.getIncidents);

// POST /api/incidents
router.post('/', IncidentsController.createIncident);

// GET /api/incidents/stats
router.get('/stats', IncidentsController.getIncidentStats);

// PUT /api/incidents/:id
router.put('/:id', IncidentsController.updateIncident);

// DELETE /api/incidents/:id
router.delete('/:id', IncidentsController.deleteIncident);

module.exports = router;