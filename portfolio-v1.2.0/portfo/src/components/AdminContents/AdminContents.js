import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../CustomDropdown/CustomDropdown';
import './AdminContents.css';

const SECTION_OPTIONS = [
    { value: 'all', label: 'Toutes les sections', shortLabel: 'Toutes (7)', tag: '7', tagClass: 'contents-tag--all' },
    { value: 'hero', label: '01. Hero / Accueil', shortLabel: '01. Hero', tag: '#home' },
    { value: 'who', label: '02. Qui suis-je ? (Bento)', shortLabel: '02. Qui suis-je', tag: '#who' },
    { value: 'objectives', label: '03. Objectifs 2026', shortLabel: '03. Objectifs', tag: '#objectives' },
    { value: 'experiences', label: '04. Expériences & Formations', shortLabel: '04. Expériences', tag: '#experiences' },
    { value: 'projects', label: '05. Projets Personnels', shortLabel: '05. Projets Perso', tag: '#projects' },
    { value: 'epitech-projects', label: '06. Projets Epitech', shortLabel: '06. Projets Epitech', tag: '#epitech' },
    { value: 'contact', label: '07. Contact & Réseaux', shortLabel: '07. Contact', tag: '#contact' },
];

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Toutes les catégories', shortLabel: 'Toutes' },
    { value: 'identity', label: 'Identité & Profil', shortLabel: 'Identité' },
    { value: 'roadmap', label: 'Objectifs & Parcours', shortLabel: 'Parcours' },
    { value: 'showcase', label: 'Projets & Réalisations', shortLabel: 'Projets' },
    { value: 'interaction', label: 'Formulaire & Contact', shortLabel: 'Contact' },
];

export default function AdminContents({ onBack }) {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [quickFilter, setQuickFilter] = useState('all');

    const handleLaunchEditMode = (hash = '') => {
        const targetUrl = hash ? `/?edit=true${hash}` : '/?edit=true';
        navigate(targetUrl);
    };

    const sectionsData = useMemo(() => [
        {
            id: 'hero',
            anchor: '#home',
            number: '01',
            title: 'Hero / Accueil',
            category: 'identity',
            badge: '1 En-tête',
            description: "Section d'accroche principale avec pitch, statut, boutons d'action et indicateur de défilement.",
            cards: [
                {
                    id: 'hero-main-card',
                    type: 'Accroche & Titre',
                    title: 'Pierre Untersinger — Titre & Pitch',
                    status: 'Actif • Bilingue',
                    items: [
                        { label: 'Eyebrow', val: 'Bonjour, je suis' },
                        { label: 'Titre principal', val: 'Pierre Untersinger' },
                        { label: 'Établissement', val: 'Étudiant en Ingénierie @ Epitech Marseille' },
                        { label: 'Description', val: 'Passionné par l’architecture réseau, l’administration système, le Cloud et la sécurité.' },
                        { label: 'Boutons d’action', val: '« Découvrir mon profil » & « Me contacter »' },
                        { label: 'Scroll Indicator', val: 'Animation souris interactive avec ancre #who' },
                    ],
                    tags: ['Hero', 'i18n', 'Call-To-Action', 'Animation'],
                },
            ],
        },
        {
            id: 'who',
            anchor: '#who',
            number: '02',
            title: 'Qui suis-je ? (Bento Grid)',
            category: 'identity',
            badge: '3 Cartes Bento',
            description: 'Présentation de l’identité, du parcours, de la photo setup, des piliers d’ingénierie et de la stack.',
            cards: [
                {
                    id: 'who-profile',
                    type: 'Carte Bento 1',
                    title: 'Profil, Statut & Métriques clés',
                    status: 'Actif • Photo & Badge',
                    items: [
                        { label: 'Photo de profil', val: 'Avatar circulaire haute résolution' },
                        { label: 'Statut actuel', val: '« En recherche d’alternance / stage »' },
                        { label: 'Rôle & Localisation', val: 'Étudiant Epitech Marseille • Promo 2028' },
                        { label: 'KPI Infra', val: '12+ Serveurs & VM gérées en homelab' },
                        { label: 'KPI Cyber', val: 'Pratique OWASP, Pentest & CTF' },
                    ],
                    tags: ['Profil', 'Avatar', 'KPIs', 'Marseille'],
                },
                {
                    id: 'who-bio',
                    type: 'Carte Bento 2',
                    title: 'Histoire, Setup Homelab & Piliers',
                    status: 'Actif • Modal CV & Contact',
                    items: [
                        { label: 'Photo setup', val: 'Poste de travail & infrastructure homelab' },
                        { label: 'Pilier 1', val: 'Parcours & Réalisations : Projets multi-plateformes & Bots' },
                        { label: 'Pilier 2', val: 'Réseaux & Infra : Serveur dédié, TCP/IP, SSH, Docker' },
                        { label: 'Pilier 3', val: 'Rigueur technique : Code maintenable, sécurisé et documenté' },
                        { label: 'Actions intégrées', val: 'Bouton « Télécharger CV (PDF) » avec tracking & « Me contacter »' },
                    ],
                    tags: ['Bio', 'Setup Homelab', 'Téléchargement CV', 'Piliers'],
                },
                {
                    id: 'who-skills',
                    type: 'Carte Bento 3',
                    title: 'Stack Technique & Compétences',
                    status: 'Actif • 16 Technologies',
                    items: [
                        { label: 'Langages', val: 'C, C++, Python, JavaScript, TypeScript, HTML/CSS' },
                        { label: 'Systèmes & Infra', val: 'Linux (Debian/Ubuntu/Arch), Docker, Proxmox VE, Nginx' },
                        { label: 'Réseaux & Sécurité', val: 'Cisco, OPNsense, WireGuard, Wireshark, Burp Suite, OWASP' },
                        { label: 'Outils', val: 'Git, GitHub, VSCode, Bash Scripting' },
                    ],
                    tags: ['Stack', 'DevOps', 'Réseau', 'Cybersécurité'],
                },
            ],
        },
        {
            id: 'objectives',
            anchor: '#objectives',
            number: '03',
            title: 'Objectifs 2026 (Carousel 3D)',
            category: 'roadmap',
            badge: '4 Cartes 3D',
            description: 'Roadmaps et visions techniques présentées dans un carrousel 3D interactif avec navigation clavier.',
            cards: [
                {
                    id: 'obj-1',
                    type: 'Objectif 01',
                    title: 'Réseaux & Infrastructures',
                    status: 'Carousel 3D • Carte 1',
                    items: [
                        { label: 'Aperçu', val: 'Protocoles, supervision, sécurité réseau' },
                        { label: 'Description', val: 'Approfondissement des architectures réseaux, protocoles avancés et gestion de serveurs dédiés.' },
                        { label: 'Compétences cibles', val: 'TCP/IP · UDP · Telnet · SSH · Wireshark · Zabbix · Optimisation' },
                    ],
                    tags: ['Réseau', 'Supervision', 'TCP/IP', 'Zabbix'],
                },
                {
                    id: 'obj-2',
                    type: 'Objectif 02',
                    title: 'Cloud Computing & IaC',
                    status: 'Carousel 3D • Carte 2',
                    items: [
                        { label: 'Aperçu', val: 'AWS, Azure, GCP — Infra scalable' },
                        { label: 'Description', val: 'Maîtrise des technologies Cloud et de l’Infrastructure as Code pour orchestrer des environnements hautement résilients.' },
                        { label: 'Compétences cibles', val: 'AWS · Azure · GCP · Terraform · Ansible · Infrastructure scalable' },
                    ],
                    tags: ['Cloud', 'AWS', 'IaC', 'Terraform', 'Ansible'],
                },
                {
                    id: 'obj-3',
                    type: 'Objectif 03',
                    title: 'Intelligence Artificielle & Automatisation',
                    status: 'Carousel 3D • Carte 3',
                    items: [
                        { label: 'Aperçu', val: 'LLMs Open-source, automatisation, Machine Learning' },
                        { label: 'Description', val: 'Intégration d’outils d’IA générative et de modèles open-source pour automatiser les flux et l’analyse de données.' },
                        { label: 'Compétences cibles', val: 'Mistral · Llama · Qwen · Data Automation · ML Monitoring' },
                    ],
                    tags: ['IA', 'LLM', 'Mistral', 'Automatisation'],
                },
                {
                    id: 'obj-4',
                    type: 'Objectif 04',
                    title: 'Gestion de Projet & Leadership',
                    status: 'Carousel 3D • Carte 4',
                    items: [
                        { label: 'Aperçu', val: 'Agile, Scrum, Kanban, outils collaboratifs' },
                        { label: 'Description', val: 'Organisation rigoureuse et pilotage d’équipes techniques pour assurer la livraison de projets de bout en bout.' },
                        { label: 'Compétences cibles', val: 'Scrum · Kanban · GitHub · Jira · Trello · Leadership' },
                    ],
                    tags: ['Agile', 'Scrum', 'Management', 'Livraison'],
                },
            ],
        },
        {
            id: 'experiences',
            anchor: '#experiences',
            number: '04',
            title: 'Expériences & Formations',
            category: 'roadmap',
            badge: '3 Formations • 3 Expériences',
            description: 'Parcours académique (diplômes, hackathons) et timeline des postes et missions professionnelles.',
            cards: [
                {
                    id: 'exp-formations',
                    type: 'Bloc Formations',
                    title: 'Formations, Diplômes & Certifications',
                    status: 'Actif • 3 Cartes diplômes',
                    items: [
                        { label: 'Epitech Marseille', val: 'Programme Grande École — Expert en Technologies de l’Information (Cursus, OWASP, Projets systèmes)' },
                        { label: 'Apple Foundation / Simplon', val: 'Formation certifiée : Gestion de projet Agile, collaboration & iOS' },
                        { label: 'Hackathon ISEN', val: 'La Nuit Du Code — Compétition chronométrée pour le Crédit Agricole' },
                    ],
                    tags: ['Epitech', 'Apple', 'Hackathon', 'Diplômes'],
                },
                {
                    id: 'exp-jobs',
                    type: 'Timeline Professionnelle',
                    title: 'Postes & Expériences en Entreprise',
                    status: 'Actif • Timeline interactive',
                    items: [
                        { label: 'Liriscom (2026)', val: 'Technicien Infrastructure Réseau & Cloud (Stage) — Administration réseau, déploiement Cloud, maintenance' },
                        { label: 'Projets Freelance', val: 'Développement d’outils web et conseil technique pour professionnels' },
                        { label: 'Missions opérationnelles', val: 'Expériences avec distinction « Employé du mois » et rigueur client' },
                    ],
                    tags: ['Liriscom', 'Réseau', 'Cloud', 'Freelance'],
                },
            ],
        },
        {
            id: 'projects',
            anchor: '#projects',
            number: '05',
            title: 'Projets Personnels & Open-Source',
            category: 'showcase',
            badge: '3 Projets documentés',
            description: 'Réalisations personnelles majeures avec pages dédiées (`/projects/:slug`), tags et retours d’expérience.',
            cards: [
                {
                    id: 'proj-portfolio',
                    type: 'Projet Phare',
                    title: 'Portfolio Interactif & Dashboard Admin',
                    status: 'Production • /projects/portfolio',
                    items: [
                        { label: 'Tagline', val: 'Vitrine personnelle, design system sur-mesure, panel admin et télémétrie' },
                        { label: 'Stack', val: 'React 19, React Router v7, FastAPI, CSS Variables, SQLite, Docker' },
                        { label: 'Points forts', val: 'Monitoring live, mode édition en direct, jeux pixel art, 0 dépendance superflue' },
                    ],
                    tags: ['React 19', 'FastAPI', 'Dashboard', 'Télémétrie'],
                },
                {
                    id: 'proj-merci',
                    type: 'Projet Fullstack',
                    title: 'Merci-App — Hub Multimédia Unifié',
                    status: 'Production • /projects/merci-app',
                    items: [
                        { label: 'Tagline', val: 'Accès unifié multi-sources : musique, films, séries, anime, YouTube' },
                        { label: 'Stack', val: 'Python / Flask, React + TypeScript, Nginx, Docker Compose, yt-dlp' },
                        { label: 'Points forts', val: 'Agrégation d’APIs tierces (Deezer, TMDB, AniList), authentification multi-utilisateurs, streaming' },
                    ],
                    tags: ['Flask', 'TypeScript', 'Docker', 'Multi-APIs'],
                },
                {
                    id: 'proj-auris',
                    type: 'Projet IoT / Maker',
                    title: 'Auris-MP3 — Lecteur Audio Embarqué',
                    status: 'Production • /projects/auris-mp3',
                    items: [
                        { label: 'Tagline', val: 'Baladeur MP3 IoT & Maker explorant le hardware et le firmware' },
                        { label: 'Stack', val: 'IoT, Systèmes embarqués, Microcontrôleur, C++, DAC I2S' },
                        { label: 'Points forts', val: 'Méthodologie d’ingénierie en 5 phases, PoC validé, schéma électronique' },
                    ],
                    tags: ['IoT', 'C++', 'Hardware', 'Firmware'],
                },
            ],
        },
        {
            id: 'epitech-projects',
            anchor: '#epitech-projects',
            number: '06',
            title: 'Projets Académiques Epitech',
            category: 'showcase',
            badge: '7 Projets répertoriés',
            description: 'Projets d’école validés avec catégories, descriptions, stack et système de demande d’accès GitHub.',
            cards: [
                {
                    id: 'ep-fullstack',
                    type: 'Web & IA',
                    title: 'Job Aggregator & Eliza (Discord AI)',
                    status: 'Validé • 2 Projets majeurs',
                    items: [
                        { label: 'Job Aggregator', val: 'Application web fullstack de recherche d’emploi avec API et chatbot (React, Node, MariaDB, Docker)' },
                        { label: 'Eliza', val: 'Bot Discord « Anti-Rage » pour joueurs auto-hébergé sur serveur dédié (Python, Discord API)' },
                    ],
                    tags: ['Fullstack', 'IA Discord', 'Node.js', 'Python'],
                },
                {
                    id: 'ep-data',
                    type: 'Data Science & CLI',
                    title: 'Bookworm, Nextbuy & Tardis',
                    status: 'Validé • 3 Projets data',
                    items: [
                        { label: 'Bookworm', val: 'CLI Python NLP pour la recherche, le téléchargement et le résumé de livres' },
                        { label: 'Nextbuy', val: 'Analyse de 1.4M de commandes Instacart & modèles prédictifs ML' },
                        { label: 'Tardis', val: 'Dashboard interactif d’analyse et prédiction des retards SNCF (Python, Pandas, ML)' },
                    ],
                    tags: ['Data Science', 'Pandas', 'NLP', 'ML'],
                },
                {
                    id: 'ep-sec-ux',
                    type: 'Cyber & Hackathon',
                    title: 'Hack and Juice (OWASP) & ProductDesign',
                    status: 'Validé • 2 Projets spécialisés',
                    items: [
                        { label: 'Hack and Juice', val: 'Pentest OWASP Juice-Shop : Exploitation SQLi (sqlmap), XSS Stored/Reflected' },
                        { label: 'ProductDesign', val: 'Plateforme éco-conçue de données écologiques pour municipalités (Open Data, UX)' },
                    ],
                    tags: ['Pentest', 'OWASP', 'sqlmap', 'Eco-conception'],
                },
            ],
        },
        {
            id: 'contact',
            anchor: '#contact',
            number: '07',
            title: 'Contact, Formulaire & Réseaux',
            category: 'interaction',
            badge: '3 Cartes & Formulaire',
            description: 'Module de prise de contact pas à pas, opportunités recherchées et canaux de communication officiels.',
            cards: [
                {
                    id: 'contact-form-card',
                    type: 'Formulaire Interactif',
                    title: 'Formulaire de Contact par Étapes',
                    status: 'Actif • Anti-Spam & Envoi SMTP',
                    items: [
                        { label: 'Étape 1', val: 'Nom complet (Validation et assainissement)' },
                        { label: 'Étape 2', val: 'Adresse email professionnelle' },
                        { label: 'Étape 3', val: 'Numéro de téléphone (optionnel)' },
                        { label: 'Étape 4', val: 'Message détaillé avec jauge de progression' },
                        { label: 'Sécurité API', val: 'Nettoyage des caractères de contrôle & protection contre injection SMTP' },
                    ],
                    tags: ['Formulaire', 'Stepper', 'SMTP', 'Validation'],
                },
                {
                    id: 'contact-socials-card',
                    type: 'Cartes Latérales',
                    title: 'Opportunités & Réseaux Sociaux',
                    status: 'Actif • Liens vérifiés',
                    items: [
                        { label: 'Carte Opportunités', val: 'Recherche active : Alternance & Stage Epitech Marseille 2026' },
                        { label: 'GitHub', val: 'Profil public @gGaToRr (Dépôts, contributions open-source)' },
                        { label: 'LinkedIn', val: 'Pierre Untersinger — Réseau professionnel' },
                        { label: 'YouTube & Epitech', val: 'Présentations vidéo & Lien vers l’école Epitech Marseille' },
                    ],
                    tags: ['LinkedIn', 'GitHub', 'YouTube', 'Recrutement'],
                },
            ],
        },
    ], []);

    // Filtrage combiné par section, catégorie et filtre rapide
    const filteredSections = useMemo(() => {
        return sectionsData.filter((sec) => {
            if (selectedSection !== 'all' && sec.id !== selectedSection) {
                return false;
            }
            if (selectedCategory !== 'all' && sec.category !== selectedCategory) {
                return false;
            }
            if (quickFilter === 'identity' && sec.category !== 'identity') return false;
            if (quickFilter === 'roadmap' && sec.category !== 'roadmap') return false;
            if (quickFilter === 'showcase' && sec.category !== 'showcase') return false;
            if (quickFilter === 'interaction' && sec.category !== 'interaction') return false;

            return true;
        });
    }, [sectionsData, selectedSection, selectedCategory, quickFilter]);

    return (
        <div className="admin-contents-view">
            {/* 1. Bandeau de contrôle supérieur (style unifié avec AdminLogs) */}
            <div className="admin-contents-toolbar-card">
                <div className="admin-contents-header">
                    <div className="admin-contents-title-box">
                        {onBack && (
                            <button
                                type="button"
                                className="admin-contents-back-btn"
                                onClick={onBack}
                                title="Retour au tableau de bord"
                                aria-label="Retour au tableau de bord"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h2 className="admin-contents-title">Gestion des Contenus du Portfolio</h2>
                            <p className="admin-contents-subtitle">Organisation structurée des sections et composants de la page principale (<code>/</code>).</p>
                        </div>
                    </div>

                    {/* Bouton d'édition épuré et sobre */}
                    <div className="admin-contents-actions">
                        <button
                            type="button"
                            className="admin-contents-edit-btn"
                            onClick={() => handleLaunchEditMode()}
                            title="Ouvrir le portfolio avec le cadre et bandeau d'édition"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Mode édition en direct</span>
                        </button>
                    </div>
                </div>

                {/* 2. Barre d'outils unifiée avec filtres rapides et listes déroulantes CustomDropdown */}
                <div className="admin-contents-toolbar">
                    <div className="admin-contents-filter-group">
                        <button
                            type="button"
                            className={`admin-contents-filter-btn ${quickFilter === 'all' && selectedSection === 'all' && selectedCategory === 'all' ? 'is-active' : ''}`}
                            onClick={() => {
                                setQuickFilter('all');
                                setSelectedSection('all');
                                setSelectedCategory('all');
                            }}
                        >
                            Toutes (7)
                        </button>
                        <button
                            type="button"
                            className={`admin-contents-filter-btn ${quickFilter === 'identity' ? 'is-active' : ''}`}
                            onClick={() => {
                                setQuickFilter('identity');
                                setSelectedCategory('all');
                                setSelectedSection('all');
                            }}
                        >
                            Identité & Bio
                        </button>
                        <button
                            type="button"
                            className={`admin-contents-filter-btn ${quickFilter === 'roadmap' ? 'is-active' : ''}`}
                            onClick={() => {
                                setQuickFilter('roadmap');
                                setSelectedCategory('all');
                                setSelectedSection('all');
                            }}
                        >
                            Objectifs & XP
                        </button>
                        <button
                            type="button"
                            className={`admin-contents-filter-btn ${quickFilter === 'showcase' ? 'is-active' : ''}`}
                            onClick={() => {
                                setQuickFilter('showcase');
                                setSelectedCategory('all');
                                setSelectedSection('all');
                            }}
                        >
                            Projets (10)
                        </button>
                        <button
                            type="button"
                            className={`admin-contents-filter-btn ${quickFilter === 'interaction' ? 'is-active' : ''}`}
                            onClick={() => {
                                setQuickFilter('interaction');
                                setSelectedCategory('all');
                                setSelectedSection('all');
                            }}
                        >
                            Contact
                        </button>

                        {/* Dropdown customisé pour la sélection de section */}
                        <CustomDropdown
                            value={selectedSection}
                            options={SECTION_OPTIONS}
                            onChange={(val) => {
                                setSelectedSection(val);
                                setQuickFilter('all');
                            }}
                            prefix="Section : "
                            align="right"
                        />

                        {/* Dropdown customisé pour la catégorie */}
                        <CustomDropdown
                            value={selectedCategory}
                            options={CATEGORY_OPTIONS}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setQuickFilter('all');
                            }}
                            prefix="Catégorie : "
                            align="right"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Conteneur des sections et cartes organisées avec scroll fluide */}
            <div className="admin-contents-scroll-area">
                {filteredSections.length === 0 ? (
                    <div className="admin-contents-empty">
                        <p>Aucune section ne correspond aux filtres sélectionnés.</p>
                        <button
                            type="button"
                            className="admin-contents-reset-btn"
                            onClick={() => {
                                setSelectedSection('all');
                                setSelectedCategory('all');
                                setQuickFilter('all');
                            }}
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    filteredSections.map((sec) => (
                        <article key={sec.id} className="admin-section-block">
                            <header className="admin-section-block__head">
                                <div className="admin-section-block__info">
                                    <span className="admin-section-block__num">Section {sec.number}</span>
                                    <h3 className="admin-section-block__title">{sec.title}</h3>
                                    <code className="admin-section-block__anchor">{sec.anchor}</code>
                                    <span className="admin-section-block__badge">{sec.badge}</span>
                                </div>

                                <button
                                    type="button"
                                    className="admin-section-edit-btn"
                                    onClick={() => handleLaunchEditMode(sec.anchor)}
                                    title={`Ouvrir ${sec.title} en mode édition`}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    <span>Éditer</span>
                                </button>
                            </header>

                            <p className="admin-section-block__desc">{sec.description}</p>

                            <div className="admin-section-cards-grid">
                                {sec.cards.map((card) => (
                                    <div key={card.id} className="admin-content-card">
                                        <div className="admin-content-card__head">
                                            <span className="admin-content-card__type">{card.type}</span>
                                            <span className="admin-content-card__status">{card.status}</span>
                                        </div>

                                        <h4 className="admin-content-card__title">{card.title}</h4>

                                        <div className="admin-content-card__items">
                                            {card.items.map((item, idx) => (
                                                <div key={idx} className="admin-content-card__item">
                                                    <span className="item-label">{item.label} :</span>
                                                    <span className="item-val">{item.val}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {card.tags && card.tags.length > 0 && (
                                            <div className="admin-content-card__tags">
                                                {card.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} className="content-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
