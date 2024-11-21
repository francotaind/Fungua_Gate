// models/userModel.js
const db = require('../config/db'); // Adjust path according to your structure

const findUserByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM Users WHERE email = ?';
        const result = await db.query(query, [email]);
        // MySQL2 returns an array where the first element is the rows
        return result[0][0] || null;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
};

const addUser = async (email, password) => {
    try {
        const query = 'INSERT INTO Users (email, password) VALUES (?, ?)';
        const result = await db.query(query, [email, password]);
        return result[0];
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

module.exports = {
    findUserByEmail,
    addUser
};
