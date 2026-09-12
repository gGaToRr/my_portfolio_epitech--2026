import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import AdminUptime from '../../components/AdminUptime/AdminUptime';
import AdminInfoCards from '../../components/AdminInfoCards/AdminInfoCards';
import AdminLogs from '../../components/AdminLogs/AdminLogs';
import AdminAnalytics from '../../components/AdminAnalytics/AdminAnalytics';
import AdminContents from '../../components/AdminContents/AdminContents';
import AdminSettings from '../../components/AdminSettings/AdminSettings';
import MobileMenu from '../../components/MobileMenu/MobileMenu';
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

    // Un seul verrou de défilement pour toute la page admin.
    //
    // Il y en avait deux : useBodyScrollLock(isMenuOpen) et un useEffect local.
    // À chaque fermeture du menu, le premier remettait overflow à 'unset' et
    // annulait le 'hidden' posé par le second — le "0 scroll" annoncé sautait
    // dès qu'on refermait le menu. La page admin est toujours verrouillée, que
    // le menu soit ouvert ou non : un seul appel suffit.
    useBodyScrollLock(true);

    // Login Form State
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            // La session vit dans un cookie HttpOnly : on ne peut pas la lire en
            // JS, on interroge donc le serveur. verifyAdminAuth() appelle
            // /api/admin/me, qui répond via le cookie joint automatiquement.
            const isValid = await verifyAdminAuth();
            setIsAuthenticated(isValid);
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

    const handleLogout = async () => {
        try {
            sessionStorage.removeItem('admin_logs_viewed_session');
        } catch (_) {}
        await logoutAdmin();
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
    ];

    return (
        <>
            <Header
                isMenuOpen={isMenuOpen}
                onOpenMenu={() => setIsMenuOpen(true)}
                theme={theme}
                onToggleTheme={onToggleTheme}
                customLinks={adminNavLinks}
                activeId={activeTab}
                onItemClick={(id) => {
                    if (id === 'logs') {
                        try {
                            sessionStorage.setItem('admin_logs_viewed_session', 'true');
                        } catch (_) {}
                    }
                    setActiveTab(id);
                }}
            />

            <MobileMenu
                open={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                customLinks={adminNavLinks}
                activeId={activeTab}
                onItemClick={(id) => {
                    if (id === 'logs') {
                        try {
                            sessionStorage.setItem('admin_logs_viewed_session', 'true');
                        } catch (_) {}
                    }
                    setActiveTab(id);
                    setIsMenuOpen(false);
                }}
                footerNode={
                    <div className="mobile-menu-footer-actions">
                        <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                            <button type="button" className="admin-menu-action-btn">
                                Voir le portfolio
                            </button>
                        </Link>
                        <button
                            type="button"
                            className="admin-menu-action-btn admin-menu-action-btn--logout"
                            onClick={() => {
                                setIsMenuOpen(false);
                                handleLogout();
                            }}
                        >
                            Déconnexion
                        </button>
                    </div>
                }
            />

            <main className="App-Main admin-main-canvas">
                {/*
                  Rendu conditionnel, comme les autres onglets.

                  Cette section était seulement masquée en CSS (display: none),
                  donc jamais démontée : AdminUptime (sondage 10 s),
                  AdminInfoCards (5 requêtes toutes les 12 s) et la boucle de
                  rendu du PixelGame continuaient de tourner en permanence,
                  y compris pendant la consultation des logs.
                */}
                {activeTab === 'main' && (
                    <section className="admin-page-view admin-page-main">
                        <AdminUptime
                            isExpanded={isUptimeExpanded}
                            onToggleExpand={() => setIsUptimeExpanded((prev) => !prev)}
                        />
                        <AdminInfoCards onSelectTab={(tabId) => setActiveTab(tabId)} />
                        <div className={`admin-pixel-pet-collapsible ${isUptimeExpanded ? 'is-collapsed' : 'is-expanded'}`}>
                            <PixelPetGame />
                        </div>
                    </section>
                )}
                {activeTab === 'contents' && (
                    <section className="admin-page-view admin-page-contents">
                        <AdminContents theme={theme} onBack={() => setActiveTab('main')} />
                    </section>
                )}
                {activeTab === 'analytics' && (
                    <section className="admin-page-view admin-page-analytics">
                        {/* Le thème est transmis : les graphiques sont rendus côté
                            serveur et ne peuvent pas s'y adapter d'eux-mêmes. */}
                        <AdminAnalytics theme={theme} onBack={() => setActiveTab('main')} />
                    </section>
                )}
                {activeTab === 'logs' && (
                    <section className="admin-page-view admin-page-logs">
                        <AdminLogs onBack={() => setActiveTab('main')} />
                    </section>
                )}
                {activeTab === 'settings' && (
                    <section className="admin-page-view admin-page-settings">
                        <AdminSettings onBack={() => setActiveTab('main')} onLogout={handleLogout} />
                    </section>
                )}
            </main>
        </>
    );
}
