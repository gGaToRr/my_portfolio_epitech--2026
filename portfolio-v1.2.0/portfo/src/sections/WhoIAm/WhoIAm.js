import { FaDownload, FaPaperPlane, FaMapMarkerAlt, FaServer, FaShieldAlt } from 'react-icons/fa';
import SkillIcons from './SkillIcons';
import profilePhoto from '../../assets/me.jpeg';
import setupPhoto from '../../assets/pierre-setup.jpeg';
import './WhoIAm.css';

function WhoIAm() {
    return (
        <section id="who">
            <div className="section-head">
                <span className="section-subtitle">À propos de moi</span>
                <h2 className="section-title">Who I am</h2>
            </div>

            <div className="who-bento">
                {/* 1. Carte Profil */}
                <article className="who-card who-card--profile">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar-ring">
                            <img
                                src={profilePhoto}
                                alt="Pierre Untersinger"
                                decoding="async"
                                fetchPriority="high"
                                className="profile-avatar-img"
                            />
                        </div>
                        <span className="profile-status-pill">
                            <span className="status-dot" /> En recherche de stage
                        </span>
                    </div>

                    <div className="profile-meta">
                        <h3 className="profile-name">Pierre Untersinger</h3>
                        <p className="profile-role">Étudiant @ Epitech Marseille</p>
                        <div className="profile-chips">
                            <span className="profile-chip">
                                <FaMapMarkerAlt /> Marseille, FR
                            </span>
                            <span className="profile-chip">Promo 2028</span>
                        </div>
                    </div>

                    <div className="profile-stats-grid">
                        <div className="profile-stat-box">
                            <FaServer className="stat-icon" />
                            <span className="stat-label">Infra & Réseau</span>
                            <span className="stat-value">Auto-hébergement</span>
                        </div>
                        <div className="profile-stat-box">
                            <FaShieldAlt className="stat-icon" />
                            <span className="stat-label">Cybersécurité</span>
                            <span className="stat-value">OWASP & Pentest</span>
                        </div>
                    </div>
                </article>

                {/* 2. Carte Histoire & Présentation */}
                <article className="who-card who-card--bio">
                    <div className="bio-head">
                        <h3>Passionné par les réseaux, le cloud et les systèmes</h3>
                        <p className="bio-lead">
                            Étudiant à <strong>Epitech Marseille</strong>, je conçois et déploie des solutions logicielles et d'infrastructure avec rigueur et autonomie.
                        </p>
                    </div>

                    <div className="bio-photo-card">
                        <img
                            src={setupPhoto}
                            alt="Pierre Untersinger en train de développer et d'administrer des systèmes"
                            className="bio-photo-img"
                            loading="lazy"
                        />
                        <div className="bio-photo-overlay">
                            <span className="bio-photo-tag">Architecture & Code</span>
                        </div>
                    </div>

                    <div className="bio-pillars">
                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>Parcours & Réalisations :</strong> Projets fullstack multi-plateformes, bots d'automatisation, et analyse de données avec IA.
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>Spécialisation Réseau & Infra :</strong> Administration d'un serveur personnel quotidien, expérimentations protocolaires (TCP/IP, SSH, Docker) et futur stage chez <em>Liriscom</em>.
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>Mindset Maker & Rigueur :</strong> Du PoC à la production, je privilégie le code propre, maintenable et sécurisé.
                            </div>
                        </div>
                    </div>

                    <div className="who-cta-row">
                        <a
                            href="/cv_pierre_untersinger.pdf"
                            download="CV_Pierre_Untersinger.pdf"
                            className="btn-who-cta btn-who-cta--primary"
                            title="Télécharger mon Curriculum Vitae (PDF)"
                        >
                            <FaDownload /> Télécharger mon CV
                        </a>
                        <a
                            href="#contact"
                            className="btn-who-cta btn-who-cta--ghost"
                            title="Aller au formulaire de contact"
                        >
                            <FaPaperPlane /> Me contacter
                        </a>
                    </div>
                </article>

                {/* 3. Carte Compétences & Stack */}
                <article className="who-card who-card--skills">
                    <div className="skills-header">
                        <h3 className="skills-heading">Stack & Outils</h3>
                        <span className="skills-count">12 technologies</span>
                    </div>
                    <SkillIcons />
                </article>
            </div>
        </section>
    );
}

export default WhoIAm;
