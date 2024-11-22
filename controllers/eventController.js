// controllers/eventController.js
const Event = require('../models/eventModel');

const eventController = {
  // Create a new event
  createEvent: async (req, res) => {
    try {
      const { event_name, event_date, venue } = req.body;

      // Basic validation
      if (!event_name || !event_date || !venue) {
        return res.status(400).json({ 
          message: 'Please provide all required fields: event_name, event_date, venue' 
        });
      }

      // Create the event
      const newEvent = await Event.create({
        event_name,
        event_date,
        venue
      });

      res.status(201).json({
        message: 'Event created successfully',
        event: newEvent
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all events
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.getAll();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single event
  getEvent: async (req, res) => {
    try {
      const event = await Event.getById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update an event
  updateEvent: async (req, res) => {
    try {
      const { event_name, event_date, venue } = req.body;
      const eventId = req.params.id;

      // Basic validation
      if (!event_name || !event_date || !venue) {
        return res.status(400).json({ 
          message: 'Please provide all required fields: event_name, event_date, venue' 
        });
      }

      const updated = await Event.update(eventId, {
        event_name,
        event_date,
        venue
      });

      if (!updated) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json({ 
        message: 'Event updated successfully' 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete an event
  deleteEvent: async (req, res) => {
    try {
      const deleted = await Event.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = eventController;
