const http = require('http');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config();

const PORT = process.env.API_PORT || 5001;
const RECEIVER = process.env.CONTACT_RECEIVER_EMAIL || 'pierre.untersinger2@gmail.com';
const MAX_BODY_BYTES = 50 * 1024; // 50 KB max

// MIME Types pour le service de fichiers statiques
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
};

// Rate limiting mémoire (max 5 requêtes par IP par fenêtre de 10 min)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

    if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return true;
    }

    record.count++;
    rateLimitMap.set(ip, record);
    return false;
}

// Nettoyage régulier du cache rate limit
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(ip);
        }
    }
}, 5 * 60 * 1000);

// Détection configuration SMTP réelle vs placeholder
const isPlaceholderPass = Boolean(
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS.includes('ton_mot_de_passe') ||
    process.env.SMTP_PASS.includes('your_password')
);

const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !isPlaceholderPass
);

let transporter = null;
if (isSmtpConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    // Gestion CORS Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Healthcheck
    if (req.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(res, 200, {
            status: 'ok',
            smtpConfigured: isSmtpConfigured,
            receiver: RECEIVER,
        });
    }

    // Endpoint Contact
    if (req.method === 'POST' && url.pathname === '/api/contact') {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        if (isRateLimited(clientIp)) {
            return sendJson(res, 429, {
                success: false,
                message: 'Trop de requêtes. Veuillez patienter quelques minutes avant de réécrire.',
            });
        }

        let body = '';
        let bodySize = 0;

        req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > MAX_BODY_BYTES) {
                req.destroy();
                return sendJson(res, 413, { success: false, message: 'Message trop volumineux.' });
            }
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const { name, email, phone, message, botcheck } = data;

                // Protection anti-bot honeypot
                if (botcheck) {
                    return sendJson(res, 200, { success: true, message: 'Message envoyé.' });
                }

                // Validation
                if (!name || !name.trim()) {
                    return sendJson(res, 400, { success: false, message: 'Le nom est requis.' });
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !emailRegex.test(email.trim())) {
                    return sendJson(res, 400, { success: false, message: 'Adresse email invalide.' });
                }
                if (!message || !message.trim()) {
                    return sendJson(res, 400, { success: false, message: 'Le message est requis.' });
                }

                const cleanName = String(name).trim().slice(0, 80);
                const cleanEmail = String(email).trim().slice(0, 120);
                const cleanPhone = phone ? String(phone).trim().slice(0, 32) : 'Non renseigné';
                const cleanMsg = String(message).trim().slice(0, 4000);

                const mailOptions = {
                    from: process.env.SMTP_FROM || `"Portfolio Pierre" <${cleanEmail}>`,
                    to: RECEIVER,
                    replyTo: cleanEmail,
                    subject: `[Portfolio] Nouveau message de ${cleanName}`,
                    text: `Nom: ${cleanName}\nEmail: ${cleanEmail}\nTéléphone: ${cleanPhone}\n\nMessage:\n${cleanMsg}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h2 style="color: #61dafb; margin-top: 0;">Nouveau message depuis le portfolio</h2>
                            <p><strong>Nom :</strong> ${cleanName}</p>
                            <p><strong>Email :</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
                            <p><strong>Téléphone :</strong> ${cleanPhone}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p><strong>Message :</strong></p>
                            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px;">${cleanMsg}</p>
                        </div>
                    `,
                };

                if (isSmtpConfigured && transporter) {
                    await transporter.sendMail(mailOptions);
                    console.log(`[SMTP] Email envoyé avec succès pour ${cleanName} (${cleanEmail})`);
                } else {
                    console.log(`[SMTP LOCAL] Mode local simulé — Message reçu avec succès :`);
                    console.log(`   De : ${cleanName} <${cleanEmail}> (Tél: ${cleanPhone})`);
                    console.log(`   Contenu : "${cleanMsg}"`);
                    console.log(`   (Pour envoyer de vrais emails, définis ton mot de passe SMTP dans .env.local)`);
                }

                return sendJson(res, 200, {
                    success: true,
                    message: 'Votre message a bien été envoyé !',
                });
            } catch (err) {
                console.error('[SMTP Error]', err);
                return sendJson(res, 500, {
                    success: false,
                    message: "Erreur serveur lors de l'envoi du message.",
                });
            }
        });

        return;
    }

    // Service des fichiers statiques (si build/ existe)
    const buildDir = path.join(__dirname, 'build');
    if (fs.existsSync(buildDir) && req.method === 'GET') {
        let filePath = path.join(buildDir, url.pathname === '/' ? 'index.html' : url.pathname);
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            filePath = path.join(buildDir, 'index.html');
        }
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            return fs.createReadStream(filePath).pipe(res);
        }
    }

    sendJson(res, 404, { success: false, message: 'Route introuvable' });
});

server.listen(PORT, () => {
    console.log(`🚀 Serveur SMTP Portfolio en écoute sur http://localhost:${PORT}`);
    console.log(`   Statut SMTP : ${isSmtpConfigured ? '✅ Configuré (envoi réel)' : 'ℹ️  Mode local simulé (compléter .env.local pour l\'envoi réel)'}`);
});
