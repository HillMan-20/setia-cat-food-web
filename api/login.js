// api/login.js (Final dengan Path .env.local)
require('dotenv').config({ path: './.env.local' }); // <-- PERUBAHAN DI SINI

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;
    if (!username || !password || !adminUsername || !adminPasswordHash || !jwtSecret) {
        console.error("Server configuration missing. Check .env.local variable names and server restart.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, adminPasswordHash);
    if (username === adminUsername && isPasswordCorrect) {
        const token = jwt.sign({ username: adminUsername }, jwtSecret, { expiresIn: '8h' });
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }
};