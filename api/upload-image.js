// /api/upload-image.js

import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false, // Penting: Jangan biarkan Vercel mem-parsing body secara otomatis
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- Proteksi Endpoint: Verifikasi Token Admin ---
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
  // --- Akhir Proteksi Endpoint ---

  const filename = req.headers['x-vercel-filename'] || 'image.png';

  try {
    // Unggah file ke Vercel Blob
    const blob = await put(filename, req, {
      access: 'public', // Membuat file dapat diakses secara publik
    });

    // Kirim kembali URL publik dari gambar yang baru diunggah
    return res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
}