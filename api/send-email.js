// api/send-email.js (Final dengan Path .env.local)
require('dotenv').config({ path: './.env.local' }); // <-- PERUBAHAN DI SINI

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.EMAIL_RECIPIENT;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }
    if (!recipientEmail || !process.env.RESEND_API_KEY) {
        console.error('Server email configuration is missing.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    try {
        const { data, error } = await resend.emails.send({
            from: 'Setia Cat Food <onboarding@resend.dev>', 
            to: [recipientEmail],
            subject: `Pesan Baru dari Website: ${subject}`,
            reply_to: email,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Pesan Baru dari Formulir Kontak Setia Cat Food</h2><hr><p><strong>Nama:</strong> ${name}</p><p><strong>Email Pengirim:</strong> ${email}</p><p><strong>Subjek:</strong> ${subject}</p><p><strong>Pesan:</strong></p><p>${message.replace(/\n/g, "<br>")}</p></div>`,
        });
        if (error) {
            return res.status(400).json(error);
        }
        return res.status(200).json({ message: 'Pesan berhasil terkirim!' });
    } catch (exception) {
        return res.status(500).json({ error: exception.message });
    }
};