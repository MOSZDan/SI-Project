// api/send-email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Faltan campos: to, subject o text' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"NotiFicct" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo:', err);
    return res.status(500).json({ error: err.message });
  }
}
