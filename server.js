const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Resend — sends notification emails over HTTPS (port 443).
// Railway blocks outbound SMTP ports (465/587), so a raw SMTP transporter
// (Gmail/Nodemailer) times out there. Resend's API avoids that entirely.
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'සියලුම ක්ෂේත්‍ර පුරවන්න!' });
    }

    const sql = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';

    pool.execute(sql, [name, email, message], async (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Database එකට එකතු කිරීම අසාර්ථකයි' });
        }

        // Respond to the user immediately — DB save succeeded either way
        res.status(200).json({ message: 'පණිවිඩය සාර්ථකව යවන ලදී!' });

        // Send email notification (fire-and-forget; doesn't block the response)
        try {
            const { data, error } = await resend.emails.send({
                from: 'Portfolio Contact <onboarding@resend.dev>',
                to: process.env.NOTIFY_EMAIL,
                reply_to: email,
                subject: `New Portfolio Message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            });

            if (error) {
                console.error('Email Error:', error);
            } else {
                console.log('Email sent:', data.id);
            }
        } catch (mailErr) {
            console.error('Email Error:', mailErr);
        }
    });
});

const PORT = process.env.APP_PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
