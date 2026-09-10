import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import PixelPetGame from '../../features/PixelGame/PixelPetGame';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { logoutAdmin } from '../../services/api';
import './AdminGame.css';

export default function AdminGame({ theme, onToggleTheme }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    useBodyScrollLock(isMenuOpen);

    const handleLogout = () => {
        logoutAdmin();
        navigate('/panelAdmin');
    };

    const adminNavLinks = [
        { id: 'main', name: 'Dashboard Admin', onClick: () => navigate('/panelAdmin') },
        { id: 'game', name: 'Arène Pixel (Jeu)', onClick: () => navigate('/panelAdmin/game') },
    ];

    return (
        <div className="admin-game-page">
            <Header
                isMenuOpen={isMenuOpen}
                onOpenMenu={() => setIsMenuOpen(true)}
                theme={theme}
                onToggleTheme={onToggleTheme}
                title="Pixel Arena"
                subtitle="Admin Game Zone"
                customLinks={adminNavLinks}
                activeId="game"
                onItemClick={(id) => {
                    if (id === 'main') navigate('/panelAdmin');
                }}
                footerNode={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/panelAdmin" style={{ textDecoration: 'none' }}>
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
                                ← Dashboard Admin
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

            <main className="App-Main">
                <div className="admin-game-canvas-container">
                    <div className="admin-game-hero">
                        <div className="admin-game-hero__title">
                            <h2>
                                Arène Pixel Art
                                <span className="admin-game-hero__badge">
                                    <span className="admin-game-hero__badge-dot" />
                                    Protégé JWT Admin
                                </span>
                            </h2>
                            <p className="admin-game-hero__subtitle">
                                Simulation de combat temps réel 8-bit : Cowboy, Spider-Man et Kermit.
                            </p>
                        </div>
                        <div className="admin-game-hero__actions">
                            <Link to="/panelAdmin" className="admin-game-btn-back">
                                ← Retour au Panel Admin
                            </Link>
                        </div>
                    </div>

                    <div className="admin-game-arena-wrapper">
                        <PixelPetGame />
                    </div>

                    <div className="admin-game-lore-grid">
                        <div className="admin-game-lore-card admin-game-lore-card--cowboy">
                            <div className="admin-game-lore-card__header">
                                <span className="admin-game-lore-card__name">Le Cowboy du Far West</span>
                                <span className="admin-game-lore-card__role">Tireur d'élite</span>
                            </div>
                            <p className="admin-game-lore-card__desc">
                                Équipé d'un revolver rapide et de son fidèle serpent compagnon. Ramasse des AK-47 et déclenche des salves dévastatrices.
                            </p>
                        </div>

                        <div className="admin-game-lore-card admin-game-lore-card--spidey">
                            <div className="admin-game-lore-card__header">
                                <span className="admin-game-lore-card__name">Spider-Man</span>
                                <span className="admin-game-lore-card__role">Vigilante agile</span>
                            </div>
                            <p className="admin-game-lore-card__desc">
                                Neutralise ses adversaires avec des projections de toiles laser et des boucliers protecteurs d'énergie pure.
                            </p>
                        </div>

                        <div className="admin-game-lore-card admin-game-lore-card--kermit">
                            <div className="admin-game-lore-card__header">
                                <span className="admin-game-lore-card__name">Kermit la Grenouille</span>
                                <span className="admin-game-lore-card__role">Guerrier du marais</span>
                            </div>
                            <p className="admin-game-lore-card__desc">
                                Maître des frappes de concombre tranchantes et de la danse de la victoire. Redoutable au corps à corps.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
