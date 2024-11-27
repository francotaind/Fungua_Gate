const TicketModel = require('../models/ticketModel');

const TicketController = {
    async getAvailableTickets(req, res) {
        try {
            const { eventId } = req.params;
            const tickets = await TicketModel.getAvailableTickets(eventId);
            res.json({ success: true, tickets });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching tickets',
                error: error.message 
            });
        }
    },

    async purchaseTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user.id; // Assuming user auth middleware

            const result = await TicketModel.purchaseTicket(ticketId, userId);
            
            res.json({
                success: true,
                message: 'Ticket purchased successfully',
                ticket: result.ticket
            });
        } catch (error) {
            res.status(error.message === 'Ticket not available' ? 400 : 500)
               .json({
                    success: false,
                    message: error.message || 'Error purchasing ticket'
                });
        }
    },

    async getTicketDetails(req, res) {
        try {
            const { ticketId } = req.params;
            const ticket = await TicketModel.getTicketDetails(ticketId);
            
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            res.json({ success: true, ticket });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching ticket details',
                error: error.message
            });
        }
    }
};

module.exports = TicketController;
