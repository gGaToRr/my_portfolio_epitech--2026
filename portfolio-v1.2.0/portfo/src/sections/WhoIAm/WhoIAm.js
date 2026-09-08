import { useState } from 'react';
import { FaDownload, FaPaperPlane, FaMapMarkerAlt, FaServer, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../data/translations';
import SkillIcons from './SkillIcons';
import CvModal from '../../components/CvModal/CvModal';
import profilePhoto from '../../assets/me.jpeg';
import setupPhoto from '../../assets/pierre-setup.jpeg';
import './WhoIAm.css';

function WhoIAm() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const [isCvModalOpen, setIsCvModalOpen] = useState(false);

    const handleDownloadCv = () => {
        const link = document.createElement('a');
        link.href = '/CV_PIERRE_UNTERSINGER.pdf';
        link.download = 'CV_PIERRE_UNTERSINGER.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsCvModalOpen(true);
    };

    return (
        <section id="who">
            <div className="section-head">
                <span className="section-subtitle">{t.who.subtitle}</span>
                <h2 className="section-title">{t.who.title}</h2>
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
                            <span className="status-dot" /> {t.who.status}
                        </span>
                    </div>

                    <div className="profile-meta">
                        <h3 className="profile-name">Pierre Untersinger</h3>
                        <p className="profile-role">{t.who.role}</p>
                        <div className="profile-chips">
                            <span className="profile-chip">
                                <FaMapMarkerAlt /> {t.who.location}
                            </span>
                            <span className="profile-chip">{t.who.promo}</span>
                        </div>
                    </div>

                    <div className="profile-stats-grid">
                        <div className="profile-stat-box">
                            <FaServer className="stat-icon" />
                            <span className="stat-label">{t.who.statInfraLabel}</span>
                            <span className="stat-value">{t.who.statInfraVal}</span>
                        </div>
                        <div className="profile-stat-box">
                            <FaShieldAlt className="stat-icon" />
                            <span className="stat-label">{t.who.statCyberLabel}</span>
                            <span className="stat-value">{t.who.statCyberVal}</span>
                        </div>
                    </div>
                </article>

                {/* 2. Carte Histoire & Présentation */}
                <article className="who-card who-card--bio">
                    <div className="bio-head">
                        <h3>{t.who.bioTitle}</h3>
                        <p className="bio-lead">
                            {lang === 'fr' ? (
                                <>
                                    Étudiant à <strong>Epitech Marseille</strong>, je conçois et déploie des solutions logicielles et d'infrastructure avec rigueur et autonomie.
                                </>
                            ) : (
                                <>
                                    Student at <strong>Epitech Marseille</strong>, I design and deploy software and infrastructure solutions with engineering rigor and autonomy.
                                </>
                            )}
                        </p>
                    </div>

                    <div className="bio-photo-card">
                        <img
                            src={setupPhoto}
                            alt="Pierre Untersinger workspace and infrastructure setup"
                            className="bio-photo-img"
                            loading="lazy"
                        />
                        <div className="bio-photo-overlay">
                            <span className="bio-photo-tag">{t.who.photoTag}</span>
                        </div>
                    </div>

                    <div className="bio-pillars">
                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>{t.who.pillar1Title}</strong> {t.who.pillar1Text}
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>{t.who.pillar2Title}</strong> {t.who.pillar2Text}
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong>{t.who.pillar3Title}</strong> {t.who.pillar3Text}
                            </div>
                        </div>
                    </div>

                    <div className="who-cta-row">
                        <button
                            type="button"
                            onClick={handleDownloadCv}
                            className="btn-who-cta btn-who-cta--primary"
                            title={t.who.btnCv}
                        >
                            <FaDownload /> {t.who.btnCv}
                        </button>
                        <a
                            href="#contact"
                            className="btn-who-cta btn-who-cta--ghost"
                            title={t.who.btnContact}
                        >
                            <FaPaperPlane /> {t.who.btnContact}
                        </a>
                    </div>
                </article>

                {/* 3. Carte Compétences & Stack */}
                <article className="who-card who-card--skills">
                    <div className="skills-header">
                        <h3 className="skills-heading">{t.who.skillsHeading}</h3>
                        <span className="skills-count">{t.who.skillsCount}</span>
                    </div>
                    <SkillIcons />
                </article>
            </div>

            <CvModal
                isOpen={isCvModalOpen}
                onClose={() => setIsCvModalOpen(false)}
                t={t}
            />
        </section>
    );
}

export default WhoIAm;
