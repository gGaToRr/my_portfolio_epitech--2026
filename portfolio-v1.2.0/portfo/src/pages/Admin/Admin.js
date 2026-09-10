import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import AdminUptime from '../../components/AdminUptime/AdminUptime';
import AdminInfoCards from '../../components/AdminInfoCards/AdminInfoCards';
import PixelPetGame from '../../features/PixelGame/PixelPetGame';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { loginAdmin, logoutAdmin, verifyAdminAuth } from '../../services/api';
import './Admin.css';

export default function Admin({ theme, onToggleTheme }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('main');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUptimeExpanded, setIsUptimeExpanded] = useState(false);
    useBodyScrollLock(isMenuOpen);

    // Verrouillage du défilement de la page admin pour 0 scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Login Form State
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await loginAdmin(username, password);
            setIsAuthenticated(true);
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

    if (loading) {
        return <div className="page-loader">Chargement…</div>;
    }

    // ----------------------------------------------------
    // ÉCRAN DE CONNEXION (SI NON CONNECTÉ)
    // ----------------------------------------------------
    if (!isAuthenticated) {
        return (
            <div className="admin-login-wrapper">
                <div className="admin-login-card">
                    <div className="admin-login-brand">
                        <div className="admin-brand-icon">PU</div>
                        <div>
                            <h2>Espace Administration</h2>
                            <p>Connectez-vous pour accéder au panel.</p>
                        </div>
                    </div>

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
                            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Connexion…' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link to="/" className="admin-link-back">
                            ← Retour au portfolio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // MENU DU SITE RÉUTILISÉ & ADAPTÉ POUR L'ADMIN
    // ----------------------------------------------------
    const adminNavLinks = [
        { id: 'main', name: 'Main' },
        { id: 'contents', name: 'Contents' },
        { id: 'analytics', name: 'Analytics' },
        { id: 'logs', name: 'Logs' },
        { id: 'settings', name: 'Settings' },
        { id: 'game', name: 'Jeu Pixel ↗', href: '/panelAdmin/game' },
    ];

    return (
        <>
            <Header
                isMenuOpen={isMenuOpen}
                onOpenMenu={() => setIsMenuOpen(true)}
                theme={theme}
                onToggleTheme={onToggleTheme}
                title="PanelAdmin"
                subtitle="My role: Admin"
                customLinks={adminNavLinks}
                activeId={activeTab}
                onItemClick={(id) => {
                    if (id === 'game') {
                        window.location.href = '/panelAdmin/game';
                    } else {
                        setActiveTab(id);
                    }
                }}
                footerNode={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/panelAdmin/game" style={{ textDecoration: 'none' }}>
                            <button
                                type="button"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    fontSize: '15px',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    color: 'var(--accent, #10b981)',
                                    border: '1px solid transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--surface-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                Arène Pixel (Jeu) ↗
                            </button>
                        </Link>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <button
                                type="button"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    fontSize: '15px',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: '1px solid transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = 'var(--text-strong)';
                                    e.target.style.backgroundColor = 'var(--surface-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = 'var(--text-muted)';
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                Voir le portfolio
                            </button>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '15px',
                                textAlign: 'left',
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            Déconnexion
                        </button>
                    </div>
                }
            />

            <main className="App-Main admin-main-canvas">
                {activeTab === 'main' && (
                    <section className="admin-page-view admin-page-main">
                        <AdminUptime
                            isExpanded={isUptimeExpanded}
                            onToggleExpand={() => setIsUptimeExpanded((prev) => !prev)}
                        />
                        <AdminInfoCards />
                        <div className={`admin-pixel-pet-collapsible ${isUptimeExpanded ? 'is-collapsed' : 'is-expanded'}`}>
                            <PixelPetGame />
                        </div>
                    </section>
                )}
                {activeTab === 'contents' && (
                    <section className="admin-page-view admin-page-contents">
                        {/* Page Contents vide */}
                    </section>
                )}
                {activeTab === 'analytics' && (
                    <section className="admin-page-view admin-page-analytics">
                        {/* Page Analytics vide */}
                    </section>
                )}
                {activeTab === 'logs' && (
                    <section className="admin-page-view admin-page-logs">
                        {/* Page Logs vide */}
                    </section>
                )}
                {activeTab === 'settings' && (
                    <section className="admin-page-view admin-page-settings">
                        {/* Page Settings vide */}
                    </section>
                )}
            </main>
        </>
    );
}
