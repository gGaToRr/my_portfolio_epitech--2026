import { useState } from 'react';
import { FaDownload, FaPaperPlane, FaMapMarkerAlt, FaServer, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { trackEvent } from '../../services/api';
import SkillIcons from './SkillIcons';
import CvModal from '../../components/CvModal/CvModal';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { EditCardTrigger } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import defaultProfilePhoto from '../../assets/me.jpeg';
import defaultSetupPhoto from '../../assets/pierre-setup.jpeg';
import './WhoIAm.css';

function WhoIAm() {
    const { lang } = useLanguage();
    const { translations, cardStyles, assets, skills, openEditDrawer, getFieldColor, isEditMode } = useEditableContent();

    const t = translations[lang] || translations.en;
    const tFr = translations.fr?.who || {};
    const tEn = translations.en?.who || {};
    const [isCvModalOpen, setIsCvModalOpen] = useState(false);

    const profilePhoto = assets?.profilePhoto || defaultProfilePhoto;
    const setupPhoto = assets?.setupPhoto || defaultSetupPhoto;

    const handleDownloadCv = () => {
        trackEvent('download_cv', 'CV_PIERRE_UNTERSINGER.pdf', { format: 'pdf' });

        const link = document.createElement('a');
        link.href = '/CV_PIERRE_UNTERSINGER.pdf';
        link.download = 'CV_PIERRE_UNTERSINGER.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsCvModalOpen(true);
    };

    // 1. Édition Carte Profil
    const handleEditProfile = () => {
        openEditDrawer({
            cardId: 'who-profile',
            sectionId: 'who',
            sectionLabel: 'Section 02 • Bento Carte 1',
            title: 'Édition : Profil, Photo & Métriques',
            type: 'translation',
            colors: cardStyles?.['who-profile'],
            fields: [
                { key: 'profilePhoto', label: 'Photo de profil (Avatar)', type: 'image', valueFr: profilePhoto, valueEn: profilePhoto },
                { key: 'status', label: 'Statut / Disponibilité', valueFr: tFr.status, valueEn: tEn.status, placeholder: 'En recherche de stage', color: getFieldColor('who-profile', 'status') },
                { key: 'role', label: 'Rôle & Titre', valueFr: tFr.role, valueEn: tEn.role, placeholder: 'Étudiant @ Epitech Marseille', color: getFieldColor('who-profile', 'role') },
                { key: 'location', label: 'Localisation', valueFr: tFr.location, valueEn: tEn.location, placeholder: 'Marseille, FR', color: getFieldColor('who-profile', 'location') },
                { key: 'promo', label: 'Promotion', valueFr: tFr.promo, valueEn: tEn.promo, placeholder: 'Promo 2028', color: getFieldColor('who-profile', 'promo') },
                { key: 'statInfraLabel', label: 'Label Statistique Infra', valueFr: tFr.statInfraLabel, valueEn: tEn.statInfraLabel, color: getFieldColor('who-profile', 'statInfraLabel') },
                { key: 'statInfraVal', label: 'Valeur Statistique Infra', valueFr: tFr.statInfraVal, valueEn: tEn.statInfraVal, color: getFieldColor('who-profile', 'statInfraVal') },
                { key: 'statCyberLabel', label: 'Label Statistique Cyber', valueFr: tFr.statCyberLabel, valueEn: tEn.statCyberLabel, color: getFieldColor('who-profile', 'statCyberLabel') },
                { key: 'statCyberVal', label: 'Valeur Statistique Cyber', valueFr: tFr.statCyberVal, valueEn: tEn.statCyberVal, color: getFieldColor('who-profile', 'statCyberVal') },
            ],
        });
    };

    // 2. Édition Carte Bio & Histoire
    const handleEditBio = () => {
        openEditDrawer({
            cardId: 'who-bio',
            sectionId: 'who',
            sectionLabel: 'Section 02 • Bento Carte 2',
            title: 'Édition : Histoire, Photo Setup & 3 Piliers',
            type: 'translation',
            colors: cardStyles?.['who-bio'],
            fields: [
                { key: 'bioTitle', label: 'Titre de la Bio', valueFr: tFr.bioTitle, valueEn: tEn.bioTitle, color: getFieldColor('who-bio', 'bioTitle') },
                { key: 'bioLead', label: 'Texte d’introduction (Markdown)', type: 'textarea', rows: 3, valueFr: tFr.bioLead, valueEn: tEn.bioLead, color: getFieldColor('who-bio', 'bioLead') },
                { key: 'setupPhoto', label: 'Photo de setup / environnement', type: 'image', valueFr: setupPhoto, valueEn: setupPhoto },
                { key: 'photoTag', label: 'Badge sur la photo setup', valueFr: tFr.photoTag, valueEn: tEn.photoTag, color: getFieldColor('who-bio', 'photoTag') },
                { key: 'pillar1Title', label: 'Pilier 1 - Titre', valueFr: tFr.pillar1Title, valueEn: tEn.pillar1Title, color: getFieldColor('who-bio', 'pillar1Title') },
                { key: 'pillar1Text', label: 'Pilier 1 - Description', type: 'textarea', rows: 2, valueFr: tFr.pillar1Text, valueEn: tEn.pillar1Text, color: getFieldColor('who-bio', 'pillar1Text') },
                { key: 'pillar2Title', label: 'Pilier 2 - Titre', valueFr: tFr.pillar2Title, valueEn: tEn.pillar2Title, color: getFieldColor('who-bio', 'pillar2Title') },
                { key: 'pillar2Text', label: 'Pilier 2 - Description', type: 'textarea', rows: 2, valueFr: tFr.pillar2Text, valueEn: tEn.pillar2Text, color: getFieldColor('who-bio', 'pillar2Text') },
                { key: 'pillar3Title', label: 'Pilier 3 - Titre', valueFr: tFr.pillar3Title, valueEn: tEn.pillar3Title, color: getFieldColor('who-bio', 'pillar3Title') },
                { key: 'pillar3Text', label: 'Pilier 3 - Description', type: 'textarea', rows: 2, valueFr: tFr.pillar3Text, valueEn: tEn.pillar3Text, color: getFieldColor('who-bio', 'pillar3Text') },
                { key: 'btnCv', label: 'Texte bouton CV', valueFr: tFr.btnCv, valueEn: tEn.btnCv, color: getFieldColor('who-bio', 'btnCv') },
                { key: 'btnContact', label: 'Texte bouton Contact', valueFr: tFr.btnContact, valueEn: tEn.btnContact, color: getFieldColor('who-bio', 'btnContact') },
            ],
        });
    };

    // 3. Édition Carte Compétences & Icônes SVG
    const handleEditSkills = () => {
        openEditDrawer({
            cardId: 'who-skills',
            sectionId: 'who',
            sectionLabel: 'Section 02 • Bento Carte 3',
            title: 'Édition : Compétences & Icônes SVG (Ajout / Suppression)',
            type: 'skills',
            skillsData: skills,
            colors: cardStyles?.['who-skills'],
        });
    };

    return (
        <section id="who">
            <ScrollReveal animation="fade-up">
                <div className="section-head">
                    <span className="section-subtitle">{t.who.subtitle}</span>
                    <h2 className="section-title">{t.who.title}</h2>
                </div>
            </ScrollReveal>

            <div className="who-bento">
                {/* 1. Carte Profil */}
                <ScrollReveal
                    animation="fade-up"
                    delay={0}
                    as="article"
                    className="who-card who-card--profile"
                    style={cardStyles?.['who-profile']?.accentColor ? { '--accent': cardStyles['who-profile'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditProfile} label="Éditer Profil & Photo" />}

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
                        <span
                            className="profile-status-pill"
                            style={{ color: getFieldColor('who-profile', 'status') || undefined }}
                        >
                            <span className="status-dot" /> {t.who.status}
                        </span>
                    </div>

                    <div className="profile-meta">
                        <h3 className="profile-name">Pierre Untersinger</h3>
                        <p
                            className="profile-role"
                            style={{ color: getFieldColor('who-profile', 'role') || undefined }}
                        >
                            {t.who.role}
                        </p>
                        <div className="profile-chips">
                            <span
                                className="profile-chip"
                                style={{ color: getFieldColor('who-profile', 'location') || undefined }}
                            >
                                <FaMapMarkerAlt /> {t.who.location}
                            </span>
                            <span
                                className="profile-chip"
                                style={{ color: getFieldColor('who-profile', 'promo') || undefined }}
                            >
                                {t.who.promo}
                            </span>
                        </div>
                    </div>

                    <div className="profile-stats-grid">
                        <div className="profile-stat-box">
                            <FaServer className="stat-icon" />
                            <span
                                className="stat-label"
                                style={{ color: getFieldColor('who-profile', 'statInfraLabel') || undefined }}
                            >
                                {t.who.statInfraLabel}
                            </span>
                            <span
                                className="stat-value"
                                style={{ color: getFieldColor('who-profile', 'statInfraVal') || undefined }}
                            >
                                {t.who.statInfraVal}
                            </span>
                        </div>
                        <div className="profile-stat-box">
                            <FaShieldAlt className="stat-icon" />
                            <span
                                className="stat-label"
                                style={{ color: getFieldColor('who-profile', 'statCyberLabel') || undefined }}
                            >
                                {t.who.statCyberLabel}
                            </span>
                            <span
                                className="stat-value"
                                style={{ color: getFieldColor('who-profile', 'statCyberVal') || undefined }}
                            >
                                {t.who.statCyberVal}
                            </span>
                        </div>
                    </div>
                </ScrollReveal>

                {/* 2. Carte Histoire & Présentation */}
                <ScrollReveal
                    animation="fade-up"
                    delay={120}
                    as="article"
                    className="who-card who-card--bio"
                    style={cardStyles?.['who-bio']?.accentColor ? { '--accent': cardStyles['who-bio'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditBio} label="Éditer Bio & Photo Setup" />}

                    <div className="bio-head">
                        <h3 style={{ color: getFieldColor('who-bio', 'bioTitle') || undefined }}>
                            {t.who.bioTitle}
                        </h3>
                        <p
                            className="bio-lead"
                            style={{ color: getFieldColor('who-bio', 'bioLead') || undefined }}
                        >
                            <MarkdownView text={t.who.bioLead} />
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
                            <span
                                className="bio-photo-tag"
                                style={{ color: getFieldColor('who-bio', 'photoTag') || undefined }}
                            >
                                {t.who.photoTag}
                            </span>
                        </div>
                    </div>

                    <div className="bio-pillars">
                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong style={{ color: getFieldColor('who-bio', 'pillar1Title') || undefined }}>
                                    {t.who.pillar1Title}
                                </strong>{' '}
                                <span style={{ color: getFieldColor('who-bio', 'pillar1Text') || undefined }}>
                                    <MarkdownView text={t.who.pillar1Text} />
                                </span>
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong style={{ color: getFieldColor('who-bio', 'pillar2Title') || undefined }}>
                                    {t.who.pillar2Title}
                                </strong>{' '}
                                <span style={{ color: getFieldColor('who-bio', 'pillar2Text') || undefined }}>
                                    <MarkdownView text={t.who.pillar2Text} />
                                </span>
                            </div>
                        </div>

                        <div className="bio-pillar">
                            <div className="pillar-dot" />
                            <div className="pillar-text">
                                <strong style={{ color: getFieldColor('who-bio', 'pillar3Title') || undefined }}>
                                    {t.who.pillar3Title}
                                </strong>{' '}
                                <span style={{ color: getFieldColor('who-bio', 'pillar3Text') || undefined }}>
                                    <MarkdownView text={t.who.pillar3Text} />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="who-cta-row">
                        <button
                            type="button"
                            onClick={handleDownloadCv}
                            className="btn-who-cta btn-who-cta--primary"
                            style={{
                                color: getFieldColor('who-bio', 'btnCv') || undefined,
                                borderColor: getFieldColor('who-bio', 'btnCv') || undefined,
                            }}
                            title={t.who.btnCv}
                        >
                            <FaDownload /> {t.who.btnCv}
                        </button>
                        <a
                            href="#contact"
                            className="btn-who-cta btn-who-cta--ghost"
                            style={{
                                color: getFieldColor('who-bio', 'btnContact') || undefined,
                                borderColor: getFieldColor('who-bio', 'btnContact') || undefined,
                            }}
                            title={t.who.btnContact}
                        >
                            <FaPaperPlane /> {t.who.btnContact}
                        </a>
                    </div>
                </ScrollReveal>

                {/* 3. Carte Compétences & Stack */}
                <ScrollReveal
                    animation="fade-up"
                    delay={240}
                    as="article"
                    className="who-card who-card--skills"
                    style={cardStyles?.['who-skills']?.accentColor ? { '--accent': cardStyles['who-skills'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditSkills} label="Éditer Compétences (SVG)" />}

                    <div className="skills-header">
                        <h3 className="skills-heading">{t.who.skillsHeading}</h3>
                        <span className="skills-count">{(skills || []).length} technologies</span>
                    </div>
                    <SkillIcons />
                </ScrollReveal>
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
