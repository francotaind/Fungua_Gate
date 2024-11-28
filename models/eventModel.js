const pool = require('../config/db');

const Event = {
    // Existing event methods
    create: async (eventData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Create event
            const [result] = await connection.execute(
                'INSERT INTO Events (event_name, event_date, venue) VALUES (?, ?, ?)',
                [eventData.event_name, eventData.event_date, eventData.venue]
            );

            // Create tickets if provided
            if (eventData.tickets && eventData.tickets.length > 0) {
                for (const ticket of eventData.tickets) {
                    await connection.execute(
                        'INSERT INTO Tickets (event_id, ticket_type, price) VALUES (?, ?, ?)',
                        [result.insertId, ticket.type, ticket.price]
                    );
                }
            }

            await connection.commit();
            return { id: result.insertId, ...eventData };
        } catch (error) {
            await connection.rollback();
            throw new Error('Error creating event: ' + error.message);
        } finally {
            connection.release();
        }
    },

    getAll: async () => {
        try {
            const [rows] = await pool.execute(`
                SELECT e.*, 
                    COUNT(t.ticket_id) as total_tickets,
                    SUM(CASE WHEN t.is_available = TRUE THEN 1 ELSE 0 END) as available_tickets
                FROM Events e
                LEFT JOIN Tickets t ON e.event_id = t.event_id
                GROUP BY e.event_id
                ORDER BY e.event_date
            `);
            return rows;
        } catch (error) {
            throw new Error('Error fetching events: ' + error.message);
        }
    },

    getById: async (id) => {
        try {
            const [event] = await pool.execute(
                'SELECT * FROM Events WHERE event_id = ?',
                [id]
            );

            if (event[0]) {
                // Get tickets for this event
                const [tickets] = await pool.execute(
                    `SELECT ticket_id, ticket_type, price, is_available 
                     FROM Tickets 
                     WHERE event_id = ?`,
                    [id]
                );
                event[0].tickets = tickets;
            }

            return event[0];
        } catch (error) {
            throw new Error('Error fetching event: ' + error.message);
        }
    },

    update: async (id, eventData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Update event
            const [result] = await connection.execute(
                'UPDATE Events SET event_name = ?, event_date = ?, venue = ? WHERE event_id = ?',
                [eventData.event_name, eventData.event_date, eventData.venue, id]
            );

            // Update tickets if provided
            if (eventData.tickets && eventData.tickets.length > 0) {
                // First delete existing tickets
                await connection.execute(
                    'DELETE FROM Tickets WHERE event_id = ? AND is_available = TRUE',
                    [id]
                );

                // Insert new tickets
                for (const ticket of eventData.tickets) {
                    await connection.execute(
                        'INSERT INTO Tickets (event_id, ticket_type, price) VALUES (?, ?, ?)',
                        [id, ticket.type, ticket.price]
                    );
                }
            }

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw new Error('Error updating event: ' + error.message);
        } finally {
            connection.release();
        }
    },

    delete: async (id) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete tickets first
            await connection.execute(
                'DELETE FROM Tickets WHERE event_id = ?',
                [id]
            );

            // Then delete event
            const [result] = await connection.execute(
                'DELETE FROM Events WHERE event_id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw new Error('Error deleting event: ' + error.message);
        } finally {
            connection.release();
        }
    },

    // New methods for ticket management
    getEventTickets: async (eventId) => {
        try {
            const [tickets] = await pool.execute(
                'SELECT * FROM Tickets WHERE event_id = ?',
                [eventId]
            );
            return tickets;
        } catch (error) {
            throw new Error('Error fetching tickets: ' + error.message);
        }
    },

    getAvailableTickets: async (eventId, ticketType) => {
        try {
            const [tickets] = await pool.execute(
                'SELECT * FROM Tickets WHERE event_id = ? AND ticket_type = ? AND is_available = TRUE',
                [eventId, ticketType]
            );
            return tickets;
        } catch (error) {
            throw new Error('Error fetching available tickets: ' + error.message);
        }
    },

    purchaseTicket: async (ticketId, userId) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check ticket availability
            const [ticket] = await connection.execute(
                'SELECT * FROM Tickets WHERE ticket_id = ? AND is_available = TRUE FOR UPDATE',
                [ticketId]
            );

            if (!ticket[0]) {
                throw new Error('Ticket not available');
            }

            // Update ticket status
            await connection.execute(
                'UPDATE Tickets SET is_available = FALSE WHERE ticket_id = ?',
                [ticketId]
            );

            // Create booking record
            await connection.execute(
                'INSERT INTO Bookings (user_id, ticket_id, booking_date) VALUES (?, ?, NOW())',
                [userId, ticketId]
            );

            await connection.commit();
            return ticket[0];
        } catch (error) {
            await connection.rollback();
            throw new Error('Error purchasing ticket: ' + error.message);
        } finally {
            connection.release();
        }
    }
};

module.exports = Event;
