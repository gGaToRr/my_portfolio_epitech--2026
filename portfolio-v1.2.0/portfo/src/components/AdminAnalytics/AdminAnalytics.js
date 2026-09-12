import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnalyticsOverview, fetchAnalyticsChart } from '../../services/api';
import CustomDropdown from '../CustomDropdown/CustomDropdown';
import './AdminAnalytics.css';

const PERIODES = [
    { value: 7, label: '7 derniers jours', shortLabel: '7 jours' },
    { value: 30, label: '30 derniers jours', shortLabel: '30 jours' },
    { value: 90, label: '90 derniers jours', shortLabel: '90 jours' },
    { value: 365, label: '12 derniers mois', shortLabel: '1 an' },
];

const CATEGORIES = [
    { id: 'all', label: 'Toutes les sections' },
    { id: 'traffic', label: 'Trafic & Horaires' },
    { id: 'pages', label: 'Pages & Provenance' },
    { id: 'tech', label: 'Technologies & Écrans' },
    { id: 'events', label: 'Actions & Visiteurs' },
];

/**
 * Sections analytiques regroupant les figures
 */
const SECTIONS_CONFIG = [
    {
        id: 'traffic',
        title: 'Trafic & Fréquentation',
        badge: '2 graphiques',
        subtitle: 'Évolution chronologique et cartes de chaleur des flux de visites sur la période.',
        figures: [
            {
                cle: 'trafic',
                titre: 'Trafic quotidien',
                badge: 'Chronologique',
                legende: 'Pages vues et visiteurs uniques, jour par jour.',
                donnees: null,
                wide: true,
            },
            {
                cle: 'heures',
                titre: "Heures d'affluence",
                badge: 'Heatmap horaire',
                legende: 'Répartition des visites par jour de semaine et par tranche horaire.',
                donnees: null,
                wide: true,
            },
        ],
    },
    {
        id: 'pages',
        title: 'Pages & Provenance',
        badge: '2 graphiques',
        subtitle: 'Contenus les plus consultés et canaux d’acquisition des visiteurs.',
        figures: [
            {
                cle: 'pages',
                titre: 'Pages les plus vues',
                badge: 'Top URLs',
                legende: 'Pages consultées (hors panneau d’administration).',
                donnees: 'pages',
                wide: false,
            },
            {
                cle: 'sources',
                titre: 'Sources de trafic',
                badge: 'Acquisition',
                legende: 'Domaine d’où provient la visite (référents et accès direct).',
                donnees: 'sources',
                wide: false,
            },
        ],
    },
    {
        id: 'tech',
        title: 'Environnement & Technologies',
        badge: '3 graphiques',
        subtitle: 'Répartition technique des navigateurs, systèmes d’exploitation et résolutions d’écran.',
        figures: [
            {
                cle: 'technologies',
                titre: 'Navigateurs et systèmes',
                badge: 'Environnement',
                legende: 'Deux classements indépendants (navigateurs vs OS).',
                donnees: null,
                wide: false,
            },
            {
                cle: 'fuseaux',
                titre: 'Fuseaux horaires',
                badge: 'Géographie',
                legende: 'Fuseau IANA déclaré par le navigateur (approximation géographique sans IP).',
                donnees: 'fuseaux',
                wide: false,
            },
            {
                cle: 'ecrans',
                titre: 'Largeurs d’écran',
                badge: 'Viewport',
                legende: 'Largeur réelle de la fenêtre collectée depuis les visites récentes.',
                donnees: 'ecrans',
                wide: true,
            },
        ],
    },
];

// Nombre de graphiques par filtre, dérivé de SECTIONS_CONFIG plutôt que
// recopié à la main : un chiffre en dur désynchronise silencieusement le
// badge dès qu'une figure est ajoutée ou retirée d'une section.
const EVENTS_SECTION_COUNT = 1;
const CATEGORY_COUNTS = SECTIONS_CONFIG.reduce(
    (acc, section) => {
        acc[section.id] = section.figures.length;
        return acc;
    },
    { events: EVENTS_SECTION_COUNT }
);
CATEGORY_COUNTS.all = Object.values(CATEGORY_COUNTS).reduce((somme, n) => somme + n, 0);

/* SVG Icons pour l'interface */
const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const RefreshIcon = ({ spinning }) => (
    <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={spinning ? 'admin-analytics-spin' : ''}
        aria-hidden="true"
    >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>
);

const TableIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const ExpandIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const formatHumanEventName = (rawName) => {
    switch (rawName) {
        case 'download_cv':
            return { label: 'Téléchargement du CV', tag: 'CV / PDF', color: '#f472b6' };
        case 'click_project':
            return { label: 'Consultation détaillée de projet', tag: 'Projet', color: '#60a5fa' };
        case 'contact_submit':
            return { label: 'Envoi formulaire de contact', tag: 'Contact', color: '#10b981' };
        case 'theme_toggle':
            return { label: 'Basculement Thème Clair/Sombre', tag: 'UI Thème', color: '#fbbf24' };
        case 'lang_toggle':
            return { label: 'Changement de langue (FR/EN)', tag: 'Langue', color: '#a78bfa' };
        default:
            return {
                label: rawName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                tag: 'Événement',
                color: '#38bdf8',
            };
    }
};

/**
 * Tableau de valeurs harmonisé avec barres de progression graphiques
 */
function TableauValeurs({ lignes, labelCol = 'Libellé', countCol = 'Vues', isEvents = false }) {
    if (!lignes || lignes.length === 0) {
        return (
            <div className="admin-analytics-table-empty">
                Aucune donnée enregistrée sur la période sélectionnée.
            </div>
        );
    }
    const total = lignes.reduce((somme, l) => somme + l.valeur, 0);
    const maxValeur = Math.max(...lignes.map((l) => l.valeur), 1);

    return (
        <div className="admin-analytics-table-wrapper">
            <table className="admin-analytics-table">
                <thead>
                    <tr>
                        <th scope="col">{labelCol}</th>
                        <th scope="col" className="admin-analytics-table-num">{countCol}</th>
                        <th scope="col" className="admin-analytics-table-part">Part</th>
                    </tr>
                </thead>
                <tbody>
                    {lignes.map((ligne) => {
                        const partPercent = total ? Math.round((ligne.valeur / total) * 100) : 0;
                        const barPercent = Math.round((ligne.valeur / maxValeur) * 100);
                        const eventMeta = isEvents ? formatHumanEventName(ligne.libelle) : null;
                        const displayLabel = eventMeta ? eventMeta.label : ligne.libelle;

                        return (
                            <tr key={ligne.libelle}>
                                <td className="admin-analytics-table-label-cell">
                                    <div className="admin-analytics-table-label-row">
                                        <span className="admin-analytics-table-text" title={displayLabel}>
                                            {displayLabel}
                                        </span>
                                        {eventMeta && (
                                            <span 
                                                className="admin-analytics-table-event-tag"
                                                style={{ borderColor: `${eventMeta.color}40`, color: eventMeta.color }}
                                            >
                                                {eventMeta.tag}
                                            </span>
                                        )}
                                    </div>
                                    <div className="admin-analytics-table-meter">
                                        <div 
                                            className="admin-analytics-table-meter-bar" 
                                            style={{ 
                                                width: `${barPercent}%`,
                                                background: eventMeta?.color 
                                                    ? `linear-gradient(90deg, ${eventMeta.color}90, ${eventMeta.color})` 
                                                    : undefined 
                                            }} 
                                        />
                                    </div>
                                </td>
                                <td className="admin-analytics-table-num">
                                    <span className="admin-analytics-table-badge">
                                        {ligne.valeur.toLocaleString('fr-FR')}
                                    </span>
                                </td>
                                <td className="admin-analytics-table-part">
                                    <span className="admin-analytics-table-percent">
                                        {total ? `${partPercent} %` : '—'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Figure analytique avec carte frosted-glass et vue tableau dépliable
 */
function FigureCard({
    figure,
    url,
    erreur,
    apercu,
    chargement,
    isTableOpen,
    onToggleTable,
    onExpand,
}) {
    const lignes = figure.donnees ? apercu?.[figure.donnees] : null;

    const handleContainerClick = (e) => {
        if (e.target.closest('.admin-analytics-table-toggle-btn') || e.target.closest('.admin-analytics-card-table-collapse')) {
            return;
        }
        if (url && onExpand) {
            onExpand(figure, url, lignes);
        }
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && url && onExpand) {
            e.preventDefault();
            onExpand(figure, url, lignes);
        }
    };

    return (
        <div className={`admin-analytics-card ${figure.wide ? 'admin-analytics-card--wide' : ''}`}>
            <div className="admin-analytics-card-header">
                <div className="admin-analytics-card-header-left">
                    <div className="admin-analytics-card-title-row">
                        <h3 className="admin-analytics-card-title">{figure.titre}</h3>
                        {figure.badge && (
                            <span className="admin-analytics-card-badge">{figure.badge}</span>
                        )}
                    </div>
                    <p className="admin-analytics-card-legend">{figure.legende}</p>
                </div>

                <div className="admin-analytics-card-header-actions">
                    {lignes && lignes.length > 0 && (
                        <button
                            type="button"
                            className={`admin-analytics-table-toggle-btn ${isTableOpen ? 'is-active' : ''}`}
                            onClick={onToggleTable}
                            aria-expanded={isTableOpen}
                            title={isTableOpen ? 'Masquer le tableau de données' : 'Afficher les données détaillées'}
                        >
                            <TableIcon />
                            <span>{isTableOpen ? 'Masquer' : 'Valeurs'}</span>
                            <ChevronDownIcon />
                        </button>
                    )}

                    {url && (
                        <button
                            type="button"
                            className="admin-analytics-expand-btn"
                            onClick={() => onExpand(figure, url, lignes)}
                            title="Agrandir en grand écran"
                            aria-label={`Agrandir le graphique ${figure.titre}`}
                        >
                            <ExpandIcon />
                        </button>
                    )}
                </div>
            </div>

            <div 
                className={`admin-analytics-figure-container ${url ? 'is-clickable' : ''}`}
                onClick={handleContainerClick}
                onKeyDown={handleKeyDown}
                tabIndex={url ? 0 : undefined}
                role={url ? 'button' : undefined}
                aria-label={url ? `Agrandir le graphique ${figure.titre}` : undefined}
                title={url ? 'Toucher ou cliquer pour agrandir' : undefined}
            >
                {erreur ? (
                    <div className="admin-analytics-figure-error">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{erreur}</span>
                    </div>
                ) : url ? (
                    <div className="admin-analytics-svg-box">
                        <img 
                            src={url} 
                            alt={`${figure.titre} — ${figure.legende}`} 
                            className="admin-analytics-svg-img"
                        />
                        <div className="admin-analytics-zoom-hint">
                            <ExpandIcon />
                            <span>Agrandir</span>
                        </div>
                    </div>
                ) : (
                    <div className="admin-analytics-figure-loading">
                        <div className="admin-analytics-spinner" />
                        <span>{chargement ? 'Génération du graphique vectoriel…' : 'Aucune donnée disponible sur la période'}</span>
                    </div>
                )}
            </div>

            {lignes && lignes.length > 0 && isTableOpen && (
                <div className="admin-analytics-card-table-collapse">
                    <TableauValeurs lignes={lignes} />
                </div>
            )}
        </div>
    );
}

/**
 * Modal Popup pour afficher un graphique en grand sur mobile, tablette et desktop
 */
function ChartModal({ isOpen, onClose, figure, url, lignes, jours }) {
    const [isModalTableOpen, setIsModalTableOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !figure || !url) return null;

    return (
        <div 
            className="admin-analytics-modal-backdrop" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-analytics-modal-title"
        >
            <div 
                className="admin-analytics-modal-card" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header du modal */}
                <div className="admin-analytics-modal-header">
                    <div className="admin-analytics-modal-header-left">
                        <div className="admin-analytics-modal-title-row">
                            <h3 id="admin-analytics-modal-title" className="admin-analytics-modal-title">
                                {figure.titre}
                            </h3>
                            {figure.badge && (
                                <span className="admin-analytics-card-badge">{figure.badge}</span>
                            )}
                            <span className="admin-analytics-modal-tag">{jours} jours</span>
                        </div>
                        <p className="admin-analytics-modal-legend">{figure.legende}</p>
                    </div>

                    <div className="admin-analytics-modal-actions">
                        {lignes && lignes.length > 0 && (
                            <button
                                type="button"
                                className={`admin-analytics-table-toggle-btn ${isModalTableOpen ? 'is-active' : ''}`}
                                onClick={() => setIsModalTableOpen((prev) => !prev)}
                                aria-expanded={isModalTableOpen}
                            >
                                <TableIcon />
                                <span>{isModalTableOpen ? 'Masquer' : 'Données'}</span>
                                <ChevronDownIcon />
                            </button>
                        )}
                        <button
                            type="button"
                            className="admin-analytics-modal-close-btn"
                            onClick={onClose}
                            title="Fermer la vue agrandie"
                            aria-label="Fermer la vue agrandie"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Corps du modal */}
                <div className="admin-analytics-modal-body">
                    <div className="admin-analytics-modal-svg-wrapper">
                        <img
                            src={url}
                            alt={`${figure.titre} — ${figure.legende}`}
                            className="admin-analytics-modal-svg-img"
                        />
                    </div>

                    {lignes && lignes.length > 0 && isModalTableOpen && (
                        <div className="admin-analytics-modal-table-section">
                            <h4 className="admin-analytics-modal-table-title">Données chiffrées</h4>
                            <TableauValeurs lignes={lignes} />
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="admin-analytics-modal-footer">
                    <span>Touchez l’extérieur ou appuyez sur Échap pour fermer</span>
                </div>
            </div>
        </div>
    );
}

export default function AdminAnalytics({ theme = 'light', onBack }) {
    const [jours, setJours] = useState(30);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [apercu, setApercu] = useState(null);
    const [urls, setUrls] = useState({});
    const [erreurs, setErreurs] = useState({});
    const [chargement, setChargement] = useState(true);
    const [erreurGlobale, setErreurGlobale] = useState(null);
    const [openTables, setOpenTables] = useState({});
    const [refreshIndex, setRefreshIndex] = useState(0);
    const [expandedChart, setExpandedChart] = useState(null);

    const scrollContainerRef = useRef(null);

    const handleOpenModal = (figure, url, lignes) => {
        setExpandedChart({ figure, url, lignes });
    };

    const handleCloseModal = () => {
        setExpandedChart(null);
    };

    const toggleTable = (cle) => {
        setOpenTables((prev) => ({
            ...prev,
            [cle]: !prev[cle],
        }));
    };

    const handleRefresh = () => {
        setRefreshIndex((prev) => prev + 1);
    };

    // Scroll automatique en haut lors du changement de filtre
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [selectedCategory, jours]);

    useEffect(() => {
        const controleur = new AbortController();
        let monte = true;

        const allFigureKeys = SECTIONS_CONFIG.flatMap((s) => s.figures.map((f) => f.cle));

        async function charger() {
            setChargement(true);
            setErreurGlobale(null);

            try {
                const donnees = await fetchAnalyticsOverview(jours);
                if (!monte) return;
                setApercu(donnees);
            } catch (err) {
                if (monte) setErreurGlobale(err.message);
            }

            const resultats = await Promise.allSettled(
                allFigureKeys.map((cle) =>
                    fetchAnalyticsChart(cle, {
                        days: jours,
                        theme,
                        signal: controleur.signal,
                    })
                )
            );

            if (!monte) return;

            const nouvellesUrls = {};
            const nouvellesErreurs = {};
            resultats.forEach((resultat, index) => {
                const cle = allFigureKeys[index];
                if (resultat.status === 'fulfilled') {
                    nouvellesUrls[cle] = resultat.value;
                } else if (resultat.reason?.name !== 'AbortError') {
                    nouvellesErreurs[cle] = resultat.reason?.message || 'Rendu impossible';
                }
            });

            setUrls(nouvellesUrls);
            setErreurs(nouvellesErreurs);
            setChargement(false);
        }

        charger();

        return () => {
            monte = false;
            controleur.abort();
        };
    }, [jours, theme, refreshIndex]);

    const totaux = apercu?.totaux;
    const evenements = useMemo(() => apercu?.evenements || [], [apercu]);

    // Filtrage des sections actives
    const activeSections = useMemo(() => {
        if (selectedCategory === 'all') return SECTIONS_CONFIG;
        if (selectedCategory === 'events') return [];
        return SECTIONS_CONFIG.filter((s) => s.id === selectedCategory);
    }, [selectedCategory]);

    const showEventsSection = selectedCategory === 'all' || selectedCategory === 'events';

    // Formatage des cartes KPI
    const pagesVuesTotal = totaux?.pages_vues ?? (chargement ? '…' : 0);
    const visiteursUniquesTotal = totaux?.visiteurs_uniques ?? (chargement ? '…' : 0);
    const cvDownloadsTotal = totaux?.telechargements_cv ?? (chargement ? '…' : 0);
    const adminViewsTotal = totaux?.vues_admin ?? (chargement ? '…' : 0);

    const conversionRate = (totaux && totaux.visiteurs_uniques > 0)
        ? ((totaux.telechargements_cv / totaux.visiteurs_uniques) * 100).toFixed(1)
        : '0.0';

    const kpiCards = [
        {
            id: 'kpi-views',
            title: 'Pages Vues',
            tag: 'Volume',
            value: typeof pagesVuesTotal === 'number' ? `${pagesVuesTotal.toLocaleString('fr-FR')} vues` : pagesVuesTotal,
            variant: 'visitors',
            rows: [
                { label: 'Moyenne / jour', value: `${totaux?.moyenne_par_jour ?? 0} vues` },
                { label: 'Pages / visiteur', value: `${totaux?.pages_par_visiteur ?? 0}` },
                { label: 'Période active', value: `${jours} derniers jours` },
            ],
            subtitle: 'Trafic public cumulé (hors administration)',
        },
        {
            id: 'kpi-visitors',
            title: 'Visiteurs Uniques',
            tag: 'Audience',
            value: typeof visiteursUniquesTotal === 'number' ? `${visiteursUniquesTotal.toLocaleString('fr-FR')} visiteur${visiteursUniquesTotal > 1 ? 's' : ''}` : visiteursUniquesTotal,
            variant: 'healthy',
            rows: [
                { label: 'Engagement moyen', value: `~${totaux?.pages_par_visiteur ?? 0} p/visite` },
                { label: 'Empreinte RGPD', value: 'Sel secret 24h' },
                { label: 'Protection', value: '0 cookie tiers' },
            ],
            subtitle: 'Visiteurs distincts sans traçage intrusif',
        },
        {
            id: 'kpi-cv',
            title: 'Téléchargements CV',
            tag: 'Conversion',
            value: typeof cvDownloadsTotal === 'number' ? `${cvDownloadsTotal.toLocaleString('fr-FR')} action${cvDownloadsTotal > 1 ? 's' : ''}` : cvDownloadsTotal,
            variant: 'cv',
            rows: [
                { label: 'Format cible', value: 'PDF Vectoriel' },
                { label: 'Taux de conversion', value: `${conversionRate} % de l'audience` },
                { label: 'Fichier', value: 'CV_PIERRE_UNTERSINGER.pdf' },
            ],
            subtitle: 'Téléchargements directs du curriculum',
        },
        {
            id: 'kpi-admin',
            title: 'Panel d’Administration',
            tag: 'Interne',
            value: typeof adminViewsTotal === 'number' ? `${adminViewsTotal.toLocaleString('fr-FR')} vue${adminViewsTotal > 1 ? 's' : ''}` : adminViewsTotal,
            variant: 'projects',
            rows: [
                { label: 'Statut télémétrie', value: 'Exclu du trafic public' },
                { label: 'Préfixe filtré', value: 'Routes /panelAdmin' },
                { label: 'Session', value: 'Accès sécurisé' },
            ],
            subtitle: 'Activité de maintenance et d’administration',
        },
    ];

    const totalEventsCount = evenements.reduce((acc, ev) => acc + ev.valeur, 0);

    return (
        <div className="admin-analytics-view">
            {/* 1. Bandeau supérieur FIXE (Titre, bouton retour, filtres de catégorie & dropdown période) */}
            <div className="admin-analytics-toolbar-card">
                <div className="admin-analytics-header">
                    <div className="admin-analytics-title-box">
                        {onBack && (
                            <button
                                type="button"
                                className="admin-analytics-back-btn"
                                onClick={onBack}
                                title="Retour au tableau de bord"
                                aria-label="Retour au tableau de bord"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                        )}
                        <div>
                            <div className="admin-analytics-title-row">
                                <h2 className="admin-analytics-title">Analytics & Fréquentation</h2>
                                <div className="admin-analytics-badge admin-analytics-badge--live">
                                    <span className="admin-analytics-badge__dot" />
                                    <span className="admin-analytics-badge__label">Télémétrie active</span>
                                </div>
                            </div>
                            <p className="admin-analytics-subtitle">
                                Mesures d'audience et de trafic classées par domaines d’analyse (administration isolée).
                            </p>
                        </div>
                    </div>

                    <div className="admin-analytics-controls">
                        <button
                            type="button"
                            className="admin-analytics-refresh-btn"
                            onClick={handleRefresh}
                            disabled={chargement}
                            title="Actualiser les données"
                            aria-label="Actualiser les données"
                        >
                            <RefreshIcon spinning={chargement} />
                        </button>

                        <CustomDropdown
                            value={jours}
                            options={PERIODES}
                            onChange={(valeur) => setJours(Number(valeur))}
                            prefix="Période : "
                            icon={<CalendarIcon />}
                            align="right"
                        />
                    </div>
                </div>

                {/* Barre de navigation / filtres par section */}
                <div className="admin-analytics-filter-toolbar">
                    <div className="admin-analytics-filter-group">
                        {CATEGORIES.map((cat) => {
                            const count = CATEGORY_COUNTS[cat.id] ?? 0;

                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`admin-analytics-filter-btn ${selectedCategory === cat.id ? 'is-active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <span>{cat.label}</span>
                                    <span className="admin-analytics-filter-badge">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {erreurGlobale && (
                <div className="admin-analytics-alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Impossible de récupérer les statistiques globales : {erreurGlobale}</span>
                </div>
            )}

            {/* 2. Zone de contenu scrollable classée par sections claires */}
            <div className="admin-analytics-scroll-container" ref={scrollContainerRef}>
                {/* 2.1 Synthèse KPI en haut de page */}
                <div className="admin-analytics-kpi-grid">
                    {kpiCards.map((card) => (
                        <div key={card.id} className={`admin-info-card admin-info-card--${card.variant}`}>
                            <div className="admin-info-card__header">
                                <span className="admin-info-card__title">{card.title}</span>
                                <span className="admin-info-card__tag">{card.tag}</span>
                            </div>

                            <div className="admin-info-card__body">
                                <div className="admin-info-card__value">{card.value}</div>
                                
                                <div className="admin-info-card__rows">
                                    {card.rows.map((r, idx) => (
                                        <div key={idx} className="admin-info-card__row">
                                            <span className="admin-info-card__row-source">{r.label}</span>
                                            <span className="admin-info-card__row-msg">{r.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-info-card__footer">
                                <span className="admin-info-card__subtitle">{card.subtitle}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2.2 Sections structurées de Graphiques */}
                {activeSections.map((sec) => (
                    <section key={sec.id} className="admin-analytics-section">
                        <div className="admin-analytics-section-header">
                            <div className="admin-analytics-section-title-box">
                                <h3 className="admin-analytics-section-title">{sec.title}</h3>
                                <span className="admin-analytics-section-badge">{sec.badge}</span>
                            </div>
                            <p className="admin-analytics-section-subtitle">{sec.subtitle}</p>
                        </div>

                        <div className="admin-analytics-charts-grid">
                            {sec.figures.map((figure) => (
                                <FigureCard
                                    key={figure.cle}
                                    figure={figure}
                                    url={urls[figure.cle]}
                                    erreur={erreurs[figure.cle]}
                                    apercu={apercu}
                                    chargement={chargement}
                                    isTableOpen={Boolean(openTables[figure.cle])}
                                    onToggleTable={() => toggleTable(figure.cle)}
                                    onExpand={handleOpenModal}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {/* 2.3 Section Actions & Événements des visiteurs */}
                {showEventsSection && (
                    <section className="admin-analytics-section">
                        <div className="admin-analytics-section-header">
                            <div className="admin-analytics-section-title-box">
                                <ActivityIcon />
                                <h3 className="admin-analytics-section-title">Actions & Événements des visiteurs</h3>
                                <span className="admin-analytics-section-badge">Télémétrie UI</span>
                                {totalEventsCount > 0 && (
                                    <span className="admin-analytics-section-badge admin-analytics-section-badge--count">
                                        {totalEventsCount} action{totalEventsCount > 1 ? 's' : ''} enregistrée{totalEventsCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <p className="admin-analytics-section-subtitle">
                                Actions interactives déclenchées depuis l’interface utilisateur sur la période sélectionnée.
                            </p>
                        </div>

                        <div className="admin-analytics-card admin-analytics-card--wide admin-analytics-card--events">
                            <div className="admin-analytics-card-table-collapse is-always-open">
                                {evenements && evenements.length > 0 ? (
                                    <TableauValeurs 
                                        lignes={evenements} 
                                        labelCol="Événement interactif déclenché" 
                                        countCol="Occurrences" 
                                        isEvents={true}
                                    />
                                ) : (
                                    <div className="admin-analytics-events-empty">
                                        <div className="admin-analytics-empty-icon">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                <line x1="12" y1="8" x2="12.01" y2="8" />
                                            </svg>
                                        </div>
                                        <div className="admin-analytics-empty-text">
                                            <p className="admin-analytics-empty-title">Aucune interaction spécifique enregistrée sur cette période ({jours} jours)</p>
                                            <p className="admin-analytics-empty-hint">L'écoute télémétrique est active. Les actions (téléchargement du CV, clics interactifs) apparaîtront automatiquement ici dès leur déclenchement.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* 3. Modal Popup d'agrandissement plein écran */}
            <ChartModal
                isOpen={Boolean(expandedChart)}
                onClose={handleCloseModal}
                figure={expandedChart?.figure}
                url={expandedChart?.url}
                lignes={expandedChart?.lignes}
                jours={jours}
            />
        </div>
    );
}
