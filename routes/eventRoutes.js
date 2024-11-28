// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const EventController = require('../controllers/eventController');

// Create a new event
router.post('/', authenticateToken, EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.put('/:id', authenticateToken, EventController.updateEvent);
router.delete('/:id', authenticateToken, EventController.deleteEvent);
router.get('/:id/tickets', EventController.getEventTickets);
router.get('/:id/tickets/:type', EventController.getAvailableTickets);
router.post('/tickets/:ticketId/purchase', authenticateToken, EventController.purchaseTicket);
module.exports = router;
