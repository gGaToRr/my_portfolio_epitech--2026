import { getProjects as getLocalProjects, getProjectBySlug as getLocalProjectBySlug } from '../data/projects';
import { getEpitechProjects as getLocalEpitechProjects } from '../data/epitechProjects';

const API_BASE = process.env.REACT_APP_API_URL || '';

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
        let errorMsg = `Erreur HTTP ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.detail || errData.message || errorMsg;
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
export async function trackPageView(path, referrer) {
    try {
        await apiRequest('/api/analytics/collect', {
            method: 'POST',
            body: JSON.stringify({
                path: path || window.location.pathname,
                referrer: referrer !== undefined ? referrer : document.referrer || '',
                language: navigator.language || 'fr',
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
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
}

// ----------------- System Status & Uptime -----------------
export async function fetchSystemStatus() {
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
