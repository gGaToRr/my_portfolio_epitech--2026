/**
 * Lecture des lignes de log du serveur.
 *
 * Ces règles de classification étaient recopiées trois fois (deux blocs dans
 * AdminLogs.js, un dans AdminInfoCards.js) : ajouter un cas d'erreur obligeait
 * à modifier les trois, et le compteur d'anomalies du tableau de bord pouvait
 * diverger de ce qu'affichait la console.
 *
 * Format d'une ligne : [AAAA-MM-JJ HH:MM:SS][fichier.py](fonction)-----détail
 */

const ERROR_MARKERS = [
    'statut 401',
    'statut 403',
    'statut 404',
    'statut 500',
    'erreur',
    'error',
    'exception',
    'failed',
];

const WARNING_MARKERS = ['warning', 'avertissement'];
const ADMIN_MARKERS = ['/api/admin', '/api/auth', 'paneladmin'];
const SUCCESS_MARKERS = ['statut 200', 'succès', 'success'];

// Séquences ANSI et caractères de contrôle résiduels, écrits en notation
// \uXXXX : la version précédente contenait les caractères de contrôle en clair,
// donc invisibles dans un diff comme dans l'éditeur.
//
// Le backend n'écrit plus de couleur dans les fichiers .log — elle est
// désormais réservée à la sortie console. Ce nettoyage reste utile pour les
// archives écrites avant ce correctif, et comme filet de sécurité à l'affichage.
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001b\[[0-9;]*[a-zA-Z]|\u001b|\[\d{1,3}m/g;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\ufffd\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;

export function cleanLogLine(line) {
    if (!line) return '';
    return String(line).replace(ANSI_RE, '').replace(CONTROL_RE, '').trim();
}

function hasAny(lowerLine, markers) {
    return markers.some((marker) => lowerLine.includes(marker));
}

export function isErrorLine(line) {
    return hasAny(String(line || '').toLowerCase(), ERROR_MARKERS);
}

export function isWarningLine(line) {
    return hasAny(String(line || '').toLowerCase(), WARNING_MARKERS);
}

export function isAdminLine(line) {
    return hasAny(String(line || '').toLowerCase(), ADMIN_MARKERS);
}

export function isSuccessLine(line) {
    return hasAny(String(line || '').toLowerCase(), SUCCESS_MARKERS);
}

/** Lignes générées par la suite de tests pytest, à exclure des compteurs. */
export function isTestLine(line) {
    const value = String(line || '');
    return value.includes('testclient') || value.includes('testadmin');
}

/** Classe CSS de coloration d'une ligne dans la console admin. */
export function getLineClass(line) {
    if (isErrorLine(line)) return 'admin-logs-line--error';
    if (isWarningLine(line)) return 'admin-logs-line--warning';
    if (isAdminLine(line)) return 'admin-logs-line--admin';
    if (isSuccessLine(line)) return 'admin-logs-line--success';
    return '';
}
