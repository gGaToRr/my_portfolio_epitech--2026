import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    loginAdmin,
    logoutAdmin,
    verifyAdminAuth,
    fetchAnalyticsStats,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchEpitechProjects,
    createEpitechProject,
    updateEpitechProject,
    deleteEpitechProject,
} from '../../services/api';
import './Admin.css';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'projects', 'epitech'
    const [selectedLang, setSelectedLang] = useState('fr');

    // Login Form State
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Analytics Data State
    const [analyticsDays, setAnalyticsDays] = useState(30);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Projects Data State
    const [projects, setProjects] = useState([]);
    const [epitechProjects, setEpitechProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const [editingEpiProject, setEditingEpiProject] = useState(null);
    const [isEpiModalOpen, setIsEpiModalOpen] = useState(false);

    // Feedback message
    const [alert, setAlert] = useState(null);

    const showAlert = (msg, type = 'success') => {
        setAlert({ msg, type });
        setTimeout(() => setAlert(null), 4000);
    };

    // Check auth on mount
    useEffect(() => {
        async function checkAuth() {
            const hasToken = Boolean(localStorage.getItem('admin_token'));
            if (hasToken) {
                const isValid = await verifyAdminAuth();
                setIsAuthenticated(isValid);
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    // Load data when tab or auth changes
    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await fetchAnalyticsStats(analyticsDays);
            setStats(data);
        } catch (err) {
            showAlert(err.message, 'error');
        } finally {
            setStatsLoading(false);
        }
    }, [analyticsDays]);

    const loadProjects = useCallback(async () => {
        try {
            const data = await fetchProjects(selectedLang);
            setProjects(data);
        } catch (err) {
            showAlert(err.message, 'error');
        }
    }, [selectedLang]);

    const loadEpitechProjects = useCallback(async () => {
        try {
            const data = await fetchEpitechProjects(selectedLang);
            setEpitechProjects(data);
        } catch (err) {
            showAlert(err.message, 'error');
        }
    }, [selectedLang]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (activeTab === 'analytics') loadStats();
        if (activeTab === 'projects') loadProjects();
        if (activeTab === 'epitech') loadEpitechProjects();
    }, [isAuthenticated, activeTab, selectedLang, loadStats, loadProjects, loadEpitechProjects]);

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await loginAdmin(username, password);
            setIsAuthenticated(true);
            showAlert('Connexion réussie ! Bienvenue sur votre Dashboard.');
        } catch (err) {
            setLoginError(err.message || 'Identifiants invalides.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        logoutAdmin();
        setIsAuthenticated(false);
    };

    // ==========================================
    // Project Form Handlers
    // ==========================================
    const openNewProjectModal = () => {
        setEditingProject({
            slug: '',
            lang: selectedLang,
            title: '',
            tagline: '',
            stack: '',
            category: 'personal',
            display_order: projects.length + 1,
            sections: [
                { heading: 'Contexte', body: '' },
                { heading: 'Stack technique', body: '' },
                { heading: "Ce que j'ai appris", body: '' },
            ],
        });
        setIsProjectModalOpen(true);
    };

    const openEditProjectModal = (proj) => {
        setEditingProject({
            ...proj,
            stack: Array.isArray(proj.stack) ? proj.stack.join(', ') : proj.stack,
            sections: proj.sections && proj.sections.length > 0 ? proj.sections : [
                { heading: 'Contexte', body: '' },
                { heading: 'Stack technique', body: '' },
                { heading: "Ce que j'ai appris", body: '' },
            ],
        });
        setIsProjectModalOpen(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                slug: editingProject.slug.trim(),
                lang: editingProject.lang,
                title: editingProject.title.trim(),
                tagline: editingProject.tagline.trim(),
                category: editingProject.category || 'personal',
                display_order: Number(editingProject.display_order) || 0,
                stack: typeof editingProject.stack === 'string'
                    ? editingProject.stack.split(',').map(s => s.trim()).filter(Boolean)
                    : editingProject.stack,
                sections: editingProject.sections.filter(s => s.heading.trim() || s.body.trim()),
            };

            if (editingProject.id) {
                await updateProject(editingProject.id, payload);
                showAlert(`Projet "${payload.title}" mis à jour avec succès !`);
            } else {
                await createProject(payload);
                showAlert(`Projet "${payload.title}" créé avec succès !`);
            }
            setIsProjectModalOpen(false);
            loadProjects();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    const handleDeleteProject = async (id, title) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer le projet "${title}" ?`)) return;
        try {
            await deleteProject(id);
            showAlert(`Projet "${title}" supprimé.`);
            loadProjects();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    // ==========================================
    // Epitech Project Form Handlers
    // ==========================================
    const openNewEpiModal = () => {
        setEditingEpiProject({
            name: '',
            lang: selectedLang,
            category: 'Web · Fullstack',
            description: '',
            tags: '',
            repo_url: '',
            display_order: epitechProjects.length + 1,
        });
        setIsEpiModalOpen(true);
    };

    const openEditEpiModal = (proj) => {
        setEditingEpiProject({
            ...proj,
            tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags,
        });
        setIsEpiModalOpen(true);
    };

    const handleSaveEpiProject = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: editingEpiProject.name.trim(),
                lang: editingEpiProject.lang,
                category: editingEpiProject.category.trim(),
                description: editingEpiProject.description.trim(),
                repo_url: editingEpiProject.repo_url ? editingEpiProject.repo_url.trim() : null,
                display_order: Number(editingEpiProject.display_order) || 0,
                tags: typeof editingEpiProject.tags === 'string'
                    ? editingEpiProject.tags.split(',').map(s => s.trim()).filter(Boolean)
                    : editingEpiProject.tags,
            };

            if (editingEpiProject.id) {
                await updateEpitechProject(editingEpiProject.id, payload);
                showAlert(`Projet Epitech "${payload.name}" mis à jour !`);
            } else {
                await createEpitechProject(payload);
                showAlert(`Projet Epitech "${payload.name}" créé !`);
            }
            setIsEpiModalOpen(false);
            loadEpitechProjects();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    const handleDeleteEpiProject = async (id, name) => {
        if (!window.confirm(`Supprimer le projet Epitech "${name}" ?`)) return;
        try {
            await deleteEpitechProject(id);
            showAlert(`Projet Epitech "${name}" supprimé.`);
            loadEpitechProjects();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    if (loading) {
        return <div className="page-loader">Vérification des accès admin…</div>;
    }

    // ----------------------------------------------------
    // LOGIN SCREEN
    // ----------------------------------------------------
    if (!isAuthenticated) {
        return (
            <div className="admin-container admin-login-wrapper">
                <div className="admin-login-card">
                    <h2>Espace Administration</h2>
                    <p>Connectez-vous pour gérer les cartes et consulter les statistiques du portfolio.</p>

                    {loginError && <div className="admin-alert admin-alert--error">{loginError}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="admin-form-group">
                            <label>Identifiant</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                className="admin-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="admin-btn admin-btn--primary"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Connexion en cours…' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/" className="admin-btn admin-btn--sm" style={{ textDecoration: 'none' }}>
                            ← Retour au portfolio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // AUTHENTICATED DASHBOARD
    // ----------------------------------------------------
    return (
        <div className="admin-container">
            {/* Header */}
            <header className="admin-header">
                <div>
                    <h1 className="admin-header__title">
                        Dashboard Portfolio
                        <span className="admin-header__badge">Admin</span>
                    </h1>
                </div>

                <div className="admin-header__actions">
                    <Link to="/" className="admin-btn">
                        👁️ Voir le site
                    </Link>
                    <button onClick={handleLogout} className="admin-btn admin-btn--danger">
                        Déconnexion
                    </button>
                </div>
            </header>

            {alert && (
                <div className={`admin-alert admin-alert--${alert.type}`}>
                    {alert.msg}
                </div>
            )}

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📈 Statistiques & Analytics
                </button>
                <button
                    className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    💼 Projets Personnels ({projects.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'epitech' ? 'active' : ''}`}
                    onClick={() => setActiveTab('epitech')}
                >
                    🎓 Projets Epitech ({epitechProjects.length})
                </button>
            </div>

            {/* ==========================================
                TAB 1 : ANALYTICS
            ========================================== */}
            {activeTab === 'analytics' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-strong)' }}>Vue d'ensemble de l'audience</h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                                className="admin-select"
                                value={analyticsDays}
                                onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                                style={{ width: 'auto' }}
                            >
                                <option value={7}>Derniers 7 jours</option>
                                <option value={14}>Derniers 14 jours</option>
                                <option value={30}>Derniers 30 jours</option>
                            </select>
                            <button className="admin-btn admin-btn--sm" onClick={loadStats} disabled={statsLoading}>
                                {statsLoading ? '…' : '🔄 Actualiser'}
                            </button>
                        </div>
                    </div>

                    {stats && (
                        <>
                            {/* KPI Grid */}
                            <div className="admin-stats-grid">
                                <div className="admin-kpi-card">
                                    <div className="admin-kpi-card__label">Pages Vues (Total)</div>
                                    <div className="admin-kpi-card__value">{stats.total_pageviews}</div>
                                    <div className="admin-kpi-card__sub">Sur l'ensemble du site</div>
                                </div>
                                <div className="admin-kpi-card">
                                    <div className="admin-kpi-card__label">Visiteurs Uniques</div>
                                    <div className="admin-kpi-card__value">{stats.unique_visitors}</div>
                                    <div className="admin-kpi-card__sub">Anonymisés (sans cookies)</div>
                                </div>
                                <div className="admin-kpi-card">
                                    <div className="admin-kpi-card__label">Vues Aujourd'hui</div>
                                    <div className="admin-kpi-card__value" style={{ color: 'var(--accent)' }}>
                                        {stats.today_pageviews}
                                    </div>
                                    <div className="admin-kpi-card__sub">{stats.today_unique_visitors} visiteurs uniques</div>
                                </div>
                            </div>

                            {/* Daily Bar Chart */}
                            <div className="admin-chart-card">
                                <div className="admin-chart-card__header">
                                    <div className="admin-chart-card__title">Évolution des visites quotidiennes</div>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        Barres : Pages Vues
                                    </span>
                                </div>

                                <div className="admin-bar-chart">
                                    {stats.views_per_day.map((d, i) => {
                                        const maxViews = Math.max(...stats.views_per_day.map((x) => x.views), 1);
                                        const heightPct = Math.max((d.views / maxViews) * 100, 4);
                                        return (
                                            <div key={i} className="admin-bar-col">
                                                <div className="admin-bar-tooltip">
                                                    {d.date} : {d.views} vues ({d.visitors} uniques)
                                                </div>
                                                <div className="admin-bar" style={{ height: `${heightPct}%` }} />
                                                <span className="admin-bar-label">{d.date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tables Grid */}
                            <div className="admin-panels-grid">
                                {/* Top Pages */}
                                <div className="admin-chart-card">
                                    <div className="admin-chart-card__title" style={{ marginBottom: '14px' }}>
                                        📄 Pages les plus consultées
                                    </div>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Page</th>
                                                <th style={{ textAlign: 'right' }}>Vues</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top_pages.length === 0 ? (
                                                <tr><td colSpan={2} style={{ color: 'var(--text-muted)' }}>Aucune donnée</td></tr>
                                            ) : (
                                                stats.top_pages.map((p, i) => (
                                                    <tr key={i}>
                                                        <td><code>{p.path}</code></td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.count}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Top Referrers */}
                                <div className="admin-chart-card">
                                    <div className="admin-chart-card__title" style={{ marginBottom: '14px' }}>
                                        🌐 Sources de trafic (Referrers)
                                    </div>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Source</th>
                                                <th style={{ textAlign: 'right' }}>Visites</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top_referrers.length === 0 ? (
                                                <tr><td colSpan={2} style={{ color: 'var(--text-muted)' }}>Accès direct / Aucun referrer</td></tr>
                                            ) : (
                                                stats.top_referrers.map((r, i) => (
                                                    <tr key={i}>
                                                        <td>{r.referrer}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{r.count}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Devices Breakdown */}
                                <div className="admin-chart-card">
                                    <div className="admin-chart-card__title" style={{ marginBottom: '14px' }}>
                                        📱 Appareils des visiteurs
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {stats.device_breakdown.map((dev, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ textTransform: 'capitalize' }}>
                                                    {dev.device === 'desktop' ? '💻 Ordinateur' : dev.device === 'mobile' ? '📱 Mobile' : '📟 Tablette'}
                                                </span>
                                                <span style={{ fontWeight: 'bold' }}>{dev.count} vues</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Events Tracked */}
                                <div className="admin-chart-card">
                                    <div className="admin-chart-card__title" style={{ marginBottom: '14px' }}>
                                        ⚡ Clics & Événements
                                    </div>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Événement</th>
                                                <th>Cible</th>
                                                <th style={{ textAlign: 'right' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recent_events.length === 0 ? (
                                                <tr><td colSpan={3} style={{ color: 'var(--text-muted)' }}>Aucun événement enregistré</td></tr>
                                            ) : (
                                                stats.recent_events.map((ev, i) => (
                                                    <tr key={i}>
                                                        <td><code>{ev.event_name}</code></td>
                                                        <td>{ev.target || '—'}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{ev.count}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ==========================================
                TAB 2 : PERSONAL PROJECTS CRUD
            ========================================== */}
            {activeTab === 'projects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Langue :</label>
                            <select
                                className="admin-select"
                                value={selectedLang}
                                onChange={(e) => setSelectedLang(e.target.value)}
                                style={{ width: 'auto' }}
                            >
                                <option value="fr">🇫🇷 Français</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                        </div>

                        <button className="admin-btn admin-btn--primary" onClick={openNewProjectModal}>
                            ➕ Ajouter un Projet
                        </button>
                    </div>

                    <div className="admin-items-grid">
                        {projects.map((proj) => (
                            <div key={proj.id || proj.slug} className="admin-card-item">
                                <div>
                                    <div className="admin-card-item__top">
                                        <div className="admin-card-item__title">{proj.title}</div>
                                        <span className="admin-card-item__lang">{proj.lang.toUpperCase()}</span>
                                    </div>
                                    <p className="admin-card-item__tagline">{proj.tagline}</p>
                                    <div className="admin-card-item__stack">
                                        {(proj.stack || []).map((s, idx) => (
                                            <span key={idx} className="admin-tag">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="admin-card-item__footer">
                                    <button
                                        className="admin-btn admin-btn--sm"
                                        onClick={() => openEditProjectModal(proj)}
                                    >
                                        ✏️ Modifier
                                    </button>
                                    {proj.id && (
                                        <button
                                            className="admin-btn admin-btn--sm admin-btn--danger"
                                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ==========================================
                TAB 3 : EPITECH PROJECTS CRUD
            ========================================== */}
            {activeTab === 'epitech' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Langue :</label>
                            <select
                                className="admin-select"
                                value={selectedLang}
                                onChange={(e) => setSelectedLang(e.target.value)}
                                style={{ width: 'auto' }}
                            >
                                <option value="fr">🇫🇷 Français</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                        </div>

                        <button className="admin-btn admin-btn--primary" onClick={openNewEpiModal}>
                            ➕ Ajouter un Projet Epitech
                        </button>
                    </div>

                    <div className="admin-items-grid">
                        {epitechProjects.map((proj) => (
                            <div key={proj.id || proj.name} className="admin-card-item">
                                <div>
                                    <div className="admin-card-item__top">
                                        <div className="admin-card-item__title">{proj.name}</div>
                                        <span className="admin-tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                            {proj.category}
                                        </span>
                                    </div>
                                    <p className="admin-card-item__tagline">{proj.description}</p>
                                    <div className="admin-card-item__stack">
                                        {(proj.tags || []).map((t, idx) => (
                                            <span key={idx} className="admin-tag">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="admin-card-item__footer">
                                    <button
                                        className="admin-btn admin-btn--sm"
                                        onClick={() => openEditEpiModal(proj)}
                                    >
                                        ✏️ Modifier
                                    </button>
                                    {proj.id && (
                                        <button
                                            className="admin-btn admin-btn--sm admin-btn--danger"
                                            onClick={() => handleDeleteEpiProject(proj.id, proj.name)}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ==========================================
                MODAL PROJET PERSONNEL
            ========================================== */}
            {isProjectModalOpen && editingProject && (
                <div className="admin-modal-backdrop" onClick={() => setIsProjectModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__header">
                            <h3>{editingProject.id ? 'Modifier le projet' : 'Nouveau projet personnel'}</h3>
                            <button className="admin-modal__close" onClick={() => setIsProjectModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSaveProject}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                <div className="admin-form-group">
                                    <label>Titre du projet</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={editingProject.title}
                                        onChange={(e) => {
                                            const title = e.target.value;
                                            setEditingProject({
                                                ...editingProject,
                                                title,
                                                slug: editingProject.id ? editingProject.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                            });
                                        }}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Langue</label>
                                    <select
                                        className="admin-select"
                                        value={editingProject.lang}
                                        onChange={(e) => setEditingProject({ ...editingProject, lang: e.target.value })}
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                <div className="admin-form-group">
                                    <label>Slug (URL : /projects/slug)</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={editingProject.slug}
                                        onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={editingProject.display_order}
                                        onChange={(e) => setEditingProject({ ...editingProject, display_order: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Tagline (résumé sur la carte)</label>
                                <textarea
                                    className="admin-textarea"
                                    value={editingProject.tagline}
                                    onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Stack technique (séparées par des virgules)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="React 19, Python, Docker"
                                    value={editingProject.stack}
                                    onChange={(e) => setEditingProject({ ...editingProject, stack: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Sections de détails */}
                            <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                                Sections de la page de détail :
                            </div>

                            {editingProject.sections.map((sec, idx) => (
                                <div key={idx} className="admin-section-box">
                                    <input
                                        type="text"
                                        className="admin-input"
                                        placeholder="Titre de la section (ex: Contexte)"
                                        style={{ marginBottom: '8px' }}
                                        value={sec.heading}
                                        onChange={(e) => {
                                            const nextSections = [...editingProject.sections];
                                            nextSections[idx].heading = e.target.value;
                                            setEditingProject({ ...editingProject, sections: nextSections });
                                        }}
                                    />
                                    <textarea
                                        className="admin-textarea"
                                        placeholder="Texte explicatif…"
                                        value={sec.body}
                                        onChange={(e) => {
                                            const nextSections = [...editingProject.sections];
                                            nextSections[idx].body = e.target.value;
                                            setEditingProject({ ...editingProject, sections: nextSections });
                                        }}
                                    />
                                </div>
                            ))}

                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                style={{ marginBottom: '16px' }}
                                onClick={() => {
                                    setEditingProject({
                                        ...editingProject,
                                        sections: [...editingProject.sections, { heading: '', body: '' }]
                                    });
                                }}
                            >
                                ➕ Ajouter une section
                            </button>

                            <div className="admin-modal__footer">
                                <button type="button" className="admin-btn" onClick={() => setIsProjectModalOpen(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="admin-btn admin-btn--primary">
                                    Enregistrer la carte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==========================================
                MODAL PROJET EPITECH
            ========================================== */}
            {isEpiModalOpen && editingEpiProject && (
                <div className="admin-modal-backdrop" onClick={() => setIsEpiModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__header">
                            <h3>{editingEpiProject.id ? 'Modifier le projet Epitech' : 'Nouveau projet Epitech'}</h3>
                            <button className="admin-modal__close" onClick={() => setIsEpiModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSaveEpiProject}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                <div className="admin-form-group">
                                    <label>Nom du projet</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={editingEpiProject.name}
                                        onChange={(e) => setEditingEpiProject({ ...editingEpiProject, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Langue</label>
                                    <select
                                        className="admin-select"
                                        value={editingEpiProject.lang}
                                        onChange={(e) => setEditingEpiProject({ ...editingEpiProject, lang: e.target.value })}
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                <div className="admin-form-group">
                                    <label>Catégorie (ex: Web · Fullstack, Data Science...)</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={editingEpiProject.category}
                                        onChange={(e) => setEditingEpiProject({ ...editingEpiProject, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={editingEpiProject.display_order}
                                        onChange={(e) => setEditingEpiProject({ ...editingEpiProject, display_order: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea
                                    className="admin-textarea"
                                    value={editingEpiProject.description}
                                    onChange={(e) => setEditingEpiProject({ ...editingEpiProject, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Tags (séparés par des virgules, ex: Python, ML, Docker)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={editingEpiProject.tags}
                                    onChange={(e) => setEditingEpiProject({ ...editingEpiProject, tags: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Lien GitHub (facultatif)</label>
                                <input
                                    type="url"
                                    className="admin-input"
                                    placeholder="https://github.com/..."
                                    value={editingEpiProject.repo_url || ''}
                                    onChange={(e) => setEditingEpiProject({ ...editingEpiProject, repo_url: e.target.value })}
                                />
                            </div>

                            <div className="admin-modal__footer">
                                <button type="button" className="admin-btn" onClick={() => setIsEpiModalOpen(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="admin-btn admin-btn--primary">
                                    Enregistrer la carte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
