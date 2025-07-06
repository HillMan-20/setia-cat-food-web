// api/data.js (Final dengan Path .env.local)
require('dotenv').config({ path: './.env.local' }); // <-- PERUBAHAN DI SINI

const { db } = require('@vercel/postgres');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  let client;
  try {
    client = await db.connect();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to the database.' });
  }
  
  try {
    if (req.method === 'POST') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        
        const { newData } = req.body;
        await client.sql`UPDATE catfood_data SET content = ${JSON.stringify(newData)} WHERE id = 1;`;
        return res.status(200).json({ message: 'Data updated successfully' });

    } else if (req.method === 'GET') {
        const { rows } = await client.sql`SELECT content FROM catfood_data WHERE id = 1;`;
        return res.status(200).json(rows[0]?.content || {});
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
};