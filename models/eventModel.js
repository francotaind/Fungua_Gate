// models/eventModel.js
const pool = require('../config/db');

const Event = {
  // Create a new event
  create: async (eventData) => {
    try {
      const [result] = await pool.execute(
        'INSERT INTO Events (event_name, event_date, venue) VALUES (?, ?, ?)',
        [eventData.event_name, eventData.event_date, eventData.venue]
      );
      return { id: result.insertId, ...eventData };
    } catch (error) {
      throw new Error('Error creating event: ' + error.message);
    }
  },

  // Get all events
  getAll: async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM Events ORDER BY event_date');
      return rows;
    } catch (error) {
      throw new Error('Error fetching events: ' + error.message);
    }
  },

  // Get a single event by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Events WHERE event_id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching event: ' + error.message);
    }
  },

  // Update an event
  update: async (id, eventData) => {
    try {
      const [result] = await pool.execute(
        'UPDATE Events SET event_name = ?, event_date = ?, venue = ? WHERE event_id = ?',
        [eventData.event_name, eventData.event_date, eventData.venue, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error updating event: ' + error.message);
    }
  },

  // Delete an event
  delete: async (id) => {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Events WHERE event_id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error deleting event: ' + error.message);
    }
  }
};

module.exports = Event;

