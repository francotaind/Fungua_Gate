const Event = require('../models/eventModel');

const EventController = {
    // Create a new event
    async createEvent(req, res) {
        try {
            const eventData = {
                event_name: req.body.event_name,
                event_date: req.body.event_date,
                venue: req.body.venue,
                tickets: req.body.tickets || []
            };

            const newEvent = await Event.create(eventData);
            
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                event: newEvent
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating event',
                error: error.message
            });
        }
    },

    // Get all events
    async getAllEvents(req, res) {
        try {
            const events = await Event.getAll();
            
            res.status(200).json({
                success: true,
                count: events.length,
                events: events
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching events',
                error: error.message
            });
        }
    },

    // Get single event by ID
    async getEventById(req, res) {
        try {
            const event = await Event.getById(req.params.id);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            res.status(200).json({
                success: true,
                event: event
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching event',
                error: error.message
            });
        }
    },

    // Update an event
    async updateEvent(req, res) {
        try {
            const eventData = {
                event_name: req.body.event_name,
                event_date: req.body.event_date,
                venue: req.body.venue,
                tickets: req.body.tickets || []
            };

            const updated = await Event.update(req.params.id, eventData);
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found or no changes made'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Event updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating event',
                error: error.message
            });
        }
    },

    // Delete an event
    async deleteEvent(req, res) {
        try {
            const deleted = await Event.delete(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting event',
                error: error.message
            });
        }
    },

    // Get event tickets
    async getEventTickets(req, res) {
        try {
            const tickets = await Event.getEventTickets(req.params.id);
            
            res.status(200).json({
                success: true,
                count: tickets.length,
                tickets: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching event tickets',
                error: error.message
            });
        }
    },

    // Get available tickets for an event
    async getAvailableTickets(req, res) {
        try {
            const { id, type } = req.params;
            const tickets = await Event.getAvailableTickets(id, type);
            
            res.status(200).json({
                success: true,
                count: tickets.length,
                tickets: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching available tickets',
                error: error.message
            });
        }
    },

    // Purchase a ticket
    async purchaseTicket(req, res) {
        try {
            // Assuming user ID is available from authentication middleware
            const userId = req.user.id;
            const { ticketId } = req.params;

            const ticket = await Event.purchaseTicket(ticketId, userId);
            
            res.status(200).json({
                success: true,
                message: 'Ticket purchased successfully',
                ticket: ticket
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error purchasing ticket',
                error: error.message
            });
        }
    }
};

module.exports = EventController;
