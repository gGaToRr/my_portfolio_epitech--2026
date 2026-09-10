/**
 * Serveur de production du portfolio.
 *
 * Rôle : servir le build React, et relayer /api/* vers le backend FastAPI.
 *
 * Ce fichier contenait auparavant une seconde implémentation complète de
 * /api/contact (nodemailer, rate-limit, honeypot, gabarit HTML), en double de
 * celle de backend/app/routers/contact.py. Comme nginx envoie tout le trafic
 * ici, c'était cette copie qui répondait en production — donc les messages
 * n'étaient jamais enregistrés dans SQLite et l'écran d'administration des
 * messages restait vide. Le relais règle le problème pour toutes les formes de
 * déploiement (avec ou sans nginx devant), et supprime la duplication.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config();

const PORT = Number(process.env.PORT_FRONT || process.env.API_PORT || 5001);

// Backend FastAPI à relayer. En Docker Compose, BACKEND_HOST vaut "backend"
// (nom du service) ; en local, le backend tourne sur la même machine.
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 5001);

const BUILD_DIR = path.join(__dirname, 'build');

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
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.map': 'application/json; charset=utf-8',
};

// En-têtes de sécurité appliqués à chaque réponse. Le backend FastAPI les posait
// déjà sur ses propres réponses, mais rien ne les ajoutait sur les pages HTML
// servies ici — c'est-à-dire sur tout le site public.
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        ...SECURITY_HEADERS,
    });
    res.end(JSON.stringify(data));
}

/**
 * Relaie la requête telle quelle vers le backend FastAPI.
 *
 * Le corps est transmis en flux (`pipe`) plutôt que mis en tampon : plus de
 * limite de taille à gérer ici, et surtout plus de risque de répondre deux fois
 * comme le faisait l'ancien garde-fou des 50 Ko (une seconde réponse sur un
 * flux déjà terminé provoquait un rejet non capturé, qui arrête Node).
 */
function proxyToBackend(req, res) {
    const upstream = http.request(
        {
            host: BACKEND_HOST,
            port: BACKEND_PORT,
            path: req.url,
            method: req.method,
            headers: {
                ...req.headers,
                host: `${BACKEND_HOST}:${BACKEND_PORT}`,
                // On ajoute notre propre vision du pair à X-Forwarded-For, comme
                // le fait tout proxy. Le backend ne lit que l'entrée ajoutée par
                // le dernier proxy de confiance (TRUSTED_PROXY_HOPS), ce qui
                // rend sans effet les valeurs qu'un client aurait forgées.
                'x-forwarded-for': [req.headers['x-forwarded-for'], req.socket.remoteAddress]
                    .filter(Boolean)
                    .join(', '),
                'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
            },
        },
        (upstreamRes) => {
            res.writeHead(upstreamRes.statusCode || 502, {
                ...upstreamRes.headers,
                ...SECURITY_HEADERS,
            });
            upstreamRes.pipe(res);
        }
    );

    upstream.on('error', (err) => {
        console.error('[proxy] Backend injoignable :', err.message);
        if (!res.headersSent) {
            sendJson(res, 502, {
                success: false,
                message: "Le service est momentanément indisponible.",
            });
        } else {
            res.end();
        }
    });

    // Si le client abandonne, on coupe aussi la requête montante.
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
}

function serveStatic(req, res, pathname) {
    // `new URL()` normalise déjà "..", "%2e%2e" et les segments vides selon la
    // spécification WHATWG. On revérifie tout de même que le chemin résolu reste
    // sous build/, pour ne pas dépendre d'un détail d'implémentation.
    let filePath = path.join(BUILD_DIR, pathname === '/' ? 'index.html' : pathname);
    const resolved = path.resolve(filePath);

    if (!resolved.startsWith(path.resolve(BUILD_DIR) + path.sep) && resolved !== path.resolve(BUILD_DIR)) {
        filePath = path.join(BUILD_DIR, 'index.html');
    } else if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
        // Repli SPA : toute route inconnue rend l'application React.
        filePath = path.join(BUILD_DIR, 'index.html');
    } else {
        filePath = resolved;
    }

    if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { success: false, message: 'Route introuvable' });
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        ...SECURITY_HEADERS,
    });
    return fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Tout /api/* part au backend : contact, analytics, statut, administration.
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        return proxyToBackend(req, res);
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
        if (fs.existsSync(BUILD_DIR)) {
            return serveStatic(req, res, url.pathname);
        }
        return sendJson(res, 503, {
            success: false,
            message: "Build absent : lancez 'npm run build'.",
        });
    }

    return sendJson(res, 404, { success: false, message: 'Route introuvable' });
});

server.listen(PORT, () => {
    console.log(`🚀 Portfolio en écoute sur http://localhost:${PORT}`);
    console.log(`   Relais API   : /api/* -> http://${BACKEND_HOST}:${BACKEND_PORT}`);
    console.log(`   Build React  : ${fs.existsSync(BUILD_DIR) ? '✅ présent' : "⚠️  absent (npm run build)"}`);
});
