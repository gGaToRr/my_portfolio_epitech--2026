import { getProjects as getLocalProjects, getProjectBySlug as getLocalProjectBySlug } from '../data/projects';
import { getEpitechProjects as getLocalEpitechProjects } from '../data/epitechProjects';

const API_BASE = process.env.REACT_APP_API_URL || '';

// ----------------- Session admin -----------------
function clearAdminSession() {
    try {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        sessionStorage.removeItem('admin_logs_viewed_session');
    } catch (_) {
        // Stockage indisponible (navigation privée) : rien à nettoyer.
    }
}

// ----------------- Helper fetch avec headers -----------------
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Un 401 signifie que le jeton est expiré ou révoqué. Sans ce nettoyage,
        // il restait dans localStorage et était renvoyé à chaque appel suivant
        // jusqu'à une déconnexion manuelle.
        if (response.status === 401 && token) {
            clearAdminSession();
        }

        let errorMsg = `Erreur HTTP ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = typeof errData.detail === 'string'
                ? errData.detail
                : (errData.message || errorMsg);
        } catch (_) {}
        throw new Error(errorMsg);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ----------------- Projets Personnels -----------------
export async function fetchProjects(lang = 'fr') {
    try {
        const data = await apiRequest(`/api/projects?lang=${lang}`);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return getLocalProjects(lang);
    } catch (err) {
        console.warn('[API] Fallback local pour les projets :', err.message);
        return getLocalProjects(lang);
    }
}

export async function fetchProjectBySlug(slug, lang = 'fr') {
    try {
        const data = await apiRequest(`/api/projects/${slug}?lang=${lang}`);
        if (data) return data;
        return getLocalProjectBySlug(slug, lang);
    } catch (err) {
        console.warn('[API] Fallback local pour le projet slug :', err.message);
        return getLocalProjectBySlug(slug, lang);
    }
}

export async function createProject(projectData) {
    return apiRequest('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
}

export async function updateProject(id, projectData) {
    return apiRequest(`/api/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });
}

export async function deleteProject(id) {
    return apiRequest(`/api/admin/projects/${id}`, {
        method: 'DELETE',
    });
}

// ----------------- Projets Epitech -----------------
export async function fetchEpitechProjects(lang = 'fr') {
    try {
        const data = await apiRequest(`/api/epitech-projects?lang=${lang}`);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return getLocalEpitechProjects(lang);
    } catch (err) {
        console.warn('[API] Fallback local pour les projets Epitech :', err.message);
        return getLocalEpitechProjects(lang);
    }
}

export async function createEpitechProject(projectData) {
    return apiRequest('/api/admin/epitech-projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
}

export async function updateEpitechProject(id, projectData) {
    return apiRequest(`/api/admin/epitech-projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
    });
}

export async function deleteEpitechProject(id) {
    return apiRequest(`/api/admin/epitech-projects/${id}`, {
        method: 'DELETE',
    });
}

// ----------------- Analytics -----------------
function resolveTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch (_) {
        // Intl absent ou restreint : le champ reste simplement vide.
        return null;
    }
}

export async function trackPageView(path, referrer) {
    try {
        await apiRequest('/api/analytics/collect', {
            method: 'POST',
            body: JSON.stringify({
                path: path || window.location.pathname,
                referrer: referrer !== undefined ? referrer : document.referrer || '',
                language: navigator.language || 'fr',
                // Largeur réelle de la fenêtre : le type d'appareil est deviné
                // depuis le user-agent et ne dit rien de la place disponible.
                viewport_width: window.innerWidth || null,
                // Fuseau IANA (ex. "Europe/Paris") : approximation géographique
                // sans base GeoIP ni conservation d'adresse IP.
                timezone: resolveTimezone(),
            }),
        });
    } catch (_) {
        // Enregistrement silencieux sans bloquer la navigation
    }
}

export async function trackEvent(eventName, target, extraData = {}) {
    try {
        await apiRequest('/api/analytics/event', {
            method: 'POST',
            body: JSON.stringify({
                event_name: eventName,
                target: target || null,
                path: window.location.pathname,
                extra_data: extraData,
            }),
        });
    } catch (_) {
        // Enregistrement silencieux
    }
}

export async function fetchAnalyticsStats(days = 30) {
    return apiRequest(`/api/admin/analytics/stats?days=${days}`);
}

export async function fetchAnalyticsOverview(days = 30) {
    return apiRequest(`/api/admin/analytics/overview?days=${days}`);
}

/**
 * Récupère un graphique SVG rendu par le serveur et renvoie une URL d'objet.
 *
 * Un <img src="/api/..."> ne conviendrait pas : le navigateur n'y joint aucun
 * en-tête, donc pas de jeton d'authentification. On télécharge donc l'image
 * nous-mêmes avec le jeton, puis on l'expose via une URL blob.
 *
 * L'appelant doit libérer l'URL avec URL.revokeObjectURL() : sans cela chaque
 * changement de période ou de thème laisse un blob en mémoire.
 */
export async function fetchAnalyticsChart(name, { days = 30, theme = 'light', signal } = {}) {
    const token = localStorage.getItem('admin_token');
    const query = new URLSearchParams({ days: String(days), theme });

    const response = await fetch(`${API_BASE}/api/admin/analytics/chart/${name}?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
    });

    if (!response.ok) {
        throw new Error(`Graphique « ${name} » indisponible (HTTP ${response.status})`);
    }
    return URL.createObjectURL(await response.blob());
}

// ----------------- Auth Admin -----------------
export async function loginAdmin(username, password) {
    const data = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    if (data && data.access_token) {
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_user', data.username);
    }
    return data;
}

export async function verifyAdminAuth() {
    try {
        const res = await apiRequest('/api/admin/me');
        return res && res.authenticated;
    } catch {
        return false;
    }
}

export function logoutAdmin() {
    clearAdminSession();
}

// ----------------- System Status & Uptime -----------------
// /api/status ne renvoie plus que l'état global : le détail (composants,
// historique, bugs récents avec les IP des visiteurs) est passé derrière
// l'authentification admin. Seul le panel l'utilise.
export async function fetchSystemStatus() {
    return apiRequest('/api/admin/status');
}

export async function fetchPublicStatus() {
    return apiRequest('/api/status');
}

export async function reportBug(errorType, message, path, stack = null) {
    try {
        return await apiRequest('/api/bugs/report', {
            method: 'POST',
            body: JSON.stringify({
                error_type: errorType,
                message: message,
                path: path || window.location.pathname,
                stack: stack,
            }),
        });
    } catch (_) {
        // Silencieux
    }
}

export async function clearBugs() {
    return apiRequest('/api/admin/bugs/clear', {
        method: 'POST',
    });
}

// ----------------- Messages de Contact Admin -----------------
export async function fetchContactMessages() {
    return apiRequest('/api/admin/messages');
}

export async function toggleMessageRead(messageId) {
    return apiRequest(`/api/admin/messages/${messageId}/read`, {
        method: 'PATCH',
    });
}

export async function deleteContactMessage(messageId) {
    return apiRequest(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
    });
}

// ----------------- Logs Console Admin -----------------
export async function fetchLiveLogs(lines = 150, filename = null) {
    const query = new URLSearchParams({ lines });
    if (filename) query.set('filename', filename);
    return apiRequest(`/api/admin/logs/live?${query.toString()}`);
}

export async function fetchRecentDaysLogs(days = 5, linesPerDay = 200) {
    const query = new URLSearchParams({ days, lines_per_day: linesPerDay });
    return apiRequest(`/api/admin/logs/recent-days?${query.toString()}`);
}

export async function fetchLogsFiles() {
    return apiRequest('/api/admin/logs/files');
}

export async function triggerLogArchive(year = null, month = null) {
    const query = new URLSearchParams();
    if (year) query.set('year', year);
    if (month) query.set('month', month);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/api/admin/logs/archive${queryString}`, {
        method: 'POST',
    });
}

