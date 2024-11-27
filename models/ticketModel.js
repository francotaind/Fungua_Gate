const pool = require('../config/database');

const TicketModel = {
    // Get available tickets for an event
    async getAvailableTickets(eventId) {
        try {
            const [tickets] = await pool.query(
                'SELECT * FROM Tickets WHERE event_id = ? AND is_available = TRUE',
                [eventId]
            );
            return tickets;
        } catch (error) {
            throw error;
        }
    },

    // Purchase ticket
    async purchaseTicket(ticketId, userId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check if ticket is still available
            const [ticket] = await connection.query(
                'SELECT * FROM Tickets WHERE ticket_id = ? AND is_available = TRUE',
                [ticketId]
            );

            if (!ticket.length) {
                throw new Error('Ticket not available');
            }

            // Update ticket status
            await connection.query(
                'UPDATE Tickets SET is_available = FALSE WHERE ticket_id = ?',
                [ticketId]
            );

            // Create booking record
            await connection.query(
                'INSERT INTO Bookings (user_id, ticket_id, amount) VALUES (?, ?, ?)',
                [userId, ticketId, ticket[0].price]
            );

            await connection.commit();
            return { success: true, ticket: ticket[0] };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Get ticket details
    async getTicketDetails(ticketId) {
        try {
            const [ticket] = await pool.query(
                `SELECT t.*, e.event_name, e.event_date 
                 FROM Tickets t 
                 JOIN Events e ON t.event_id = e.event_id 
                 WHERE t.ticket_id = ?`,
                [ticketId]
            );
            return ticket[0];
        } catch (error) {
            throw error;
        }
    }
};

module.exports = TicketModel;
