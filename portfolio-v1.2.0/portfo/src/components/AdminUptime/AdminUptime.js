import React, { useState, useEffect, useMemo } from 'react';
import { fetchSystemStatus } from '../../services/api';
import './AdminUptime.css';

// SVG Icons (Strictly NO emojis per project instructions)
const CheckCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9.5" fill="#10b981" />
        <path d="M6 10.2L8.7 13L14 7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const WarningTriangleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5L1.5 17.5H18.5L10 2.5Z" fill="#f59e0b" />
        <path d="M10 8V12M10 15H10.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const RedCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9.5" fill="#ef4444" />
        <path d="M7 7L13 13M13 7L7 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="uptime-info-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

// Fallback generator for initial render before API responds
function generateInitialHistory() {
    const today = new Date();
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const dateFormatted = `${today.getDate()} ${months[today.getMonth()]}`;
    const dateStr = today.toISOString().split('T')[0];

    return [{
        id: 1,
        date: dateStr,
        date_formatted: dateFormatted,
        status: 'operational',
        status_label: '100% opérationnel',
        uptime_percentage: 100.0,
    }];
}

export default function AdminUptime({ isExpanded: controlledIsExpanded, onToggleExpand }) {
    const [liveData, setLiveData] = useState(null);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isOffline, setIsOffline] = useState(false);
    const [internalExpanded, setInternalExpanded] = useState(false);

    const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalExpanded;
    const toggleExpanded = onToggleExpand || (() => setInternalExpanded((prev) => !prev));

    // Chargement et rafraîchissement périodique automatique du statut
    useEffect(() => {
        let isMounted = true;

        async function loadStatus() {
            try {
                const data = await fetchSystemStatus();
                if (isMounted && data) {
                    setLiveData(data);
                    setIsOffline(false);
                    if (data.uptime_seconds !== undefined) {
                        setSecondsElapsed(data.uptime_seconds);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setIsOffline(true);
                }
                console.warn('[AdminUptime] Erreur de connexion backend :', err.message);
            }
        }

        loadStatus();
        const pollInterval = setInterval(loadStatus, 10000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    // Incrémentation locale de l'uptime chaque seconde pour affichage fluide
    useEffect(() => {
        if (isOffline) return;
        const tickInterval = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(tickInterval);
    }, [isOffline]);

    // Formatage précis de l'uptime en temps réel
    const realTimeUptimeHuman = useMemo(() => {
        if (isOffline) return 'Serveur arrêté';
        if (!secondsElapsed) return liveData?.uptime_human || 'Démarrage…';
        const days = Math.floor(secondsElapsed / 86400);
        const remDays = secondsElapsed % 86400;
        const hours = Math.floor(remDays / 3600);
        const remHours = remDays % 3600;
        const minutes = Math.floor(remHours / 60);
        const sec = remHours % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
        if (hours > 0 || days > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        parts.push(`${sec} seconde${sec > 1 ? 's' : ''}`);
        return parts.join(', ');
    }, [secondsElapsed, isOffline, liveData?.uptime_human]);

    // Calcul dynamique de la période couverte à partir du premier jour
    const dateRangeLabel = useMemo(() => {
        const historyList = liveData?.history?.general;
        if (historyList && historyList.length > 0) {
            if (historyList.length === 1) {
                return `Aujourd'hui (${historyList[0].date_formatted})`;
            }
            const first = historyList[0].date_formatted;
            const last = historyList[historyList.length - 1].date_formatted;
            return `${first} - ${last} (${historyList.length} jours)`;
        }
        const today = new Date();
        const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return `Aujourd'hui (${today.getDate()} ${months[today.getMonth()]})`;
    }, [liveData?.history?.general]);

    const isSystemOperational = !isOffline && (!liveData || liveData.status === 'operational');
    
    // Détection d'état pour chaque composant
    const apiLabel = isOffline 
        ? 'Service API arrêté' 
        : (liveData?.components?.api?.label || 'Trafic API');
    const isApiActive = !isOffline && Boolean(liveData?.components?.api?.is_active ?? true);
    const apiStatus = isOffline ? 'outage' : (liveData?.components?.api?.status || (isApiActive ? 'operational' : 'outage'));

    const backendLabel = isOffline 
        ? 'Backend FastAPI éteint / injoignable (Port 5001)' 
        : (liveData?.components?.backend?.label || 'FastAPI • Port 5001');
    const isBackendActive = !isOffline && Boolean(liveData?.components?.backend?.is_active ?? true);
    const backendStatus = isOffline ? 'outage' : (liveData?.components?.backend?.status || (isBackendActive ? 'operational' : 'outage'));

    const frontLabel = liveData?.components?.frontend?.label || 'React SPA • Port 3006';
    const isFrontActive = Boolean(liveData?.components?.frontend?.is_active ?? true);
    const frontStatus = liveData?.components?.frontend?.status || (isFrontActive ? 'operational' : 'outage');

    const isDbConnected = !isOffline && (!liveData || liveData.components?.database?.status === 'connected');
    const dbLabel = isOffline 
        ? 'Base inaccessible (Backend éteint)' 
        : (liveData?.components?.database?.label || (isDbConnected ? 'SQLite connectée' : 'Base déconnectée'));
    const dbStatus = isDbConnected ? 'operational' : 'outage';

    const isSmtpActive = !isOffline && Boolean(liveData?.components?.smtp?.is_active);
    const smtpLabel = isOffline 
        ? 'Conteneur arrêté' 
        : (liveData?.components?.smtp?.label || (isSmtpActive ? 'Docker actif' : 'Conteneur arrêté'));
    const smtpStatus = isSmtpActive ? 'operational' : 'outage';

    const fallbackHistory = useMemo(() => generateInitialHistory(), []);

    // Ordre des services : Uptime Général, Api, backend, frontend, base de données, SMTP
    const services = [
        {
            id: 'general',
            name: 'Uptime Général',
            status: isSystemOperational ? 'operational' : 'outage',
            hasInfo: true,
            componentsLabel: isOffline ? 'Système arrêté' : `Actif (${realTimeUptimeHuman})`,
            uptime: isOffline ? '0% (Arrêté)' : (liveData?.metrics?.success_rate ? `${liveData.metrics.success_rate} uptime` : '100% uptime'),
            bars: liveData?.history?.general || fallbackHistory,
        },
        {
            id: 'api',
            name: 'Api',
            status: apiStatus,
            hasInfo: true,
            componentsLabel: apiLabel,
            uptime: isApiActive ? (liveData?.metrics?.success_rate ? `${liveData.metrics.success_rate} uptime` : '100% uptime') : '0% (Arrêté)',
            bars: liveData?.history?.api || fallbackHistory,
        },
        {
            id: 'backend',
            name: 'Backend',
            status: backendStatus,
            hasInfo: true,
            componentsLabel: backendLabel,
            uptime: isBackendActive ? '100% uptime' : '0% (Arrêté)',
            bars: liveData?.history?.backend || fallbackHistory,
        },
        {
            id: 'frontend',
            name: 'Frontend',
            status: frontStatus,
            hasInfo: true,
            componentsLabel: frontLabel,
            uptime: isFrontActive ? '100% uptime' : '0% (Arrêté)',
            bars: liveData?.history?.frontend || fallbackHistory,
        },
        {
            id: 'database',
            name: 'Base de données',
            status: dbStatus,
            hasInfo: true,
            componentsLabel: dbLabel,
            uptime: isDbConnected ? '100% uptime' : '0% (Déconnectée)',
            bars: liveData?.history?.database || fallbackHistory,
        },
        {
            id: 'smtp',
            name: 'SMTP',
            status: smtpStatus,
            hasInfo: true,
            componentsLabel: smtpLabel,
            uptime: isSmtpActive ? '100% uptime' : '0% (Éteint)',
            bars: liveData?.history?.smtp || fallbackHistory,
        },
    ];

    // Calcul du statut global résumé pour le badge
    const totalServices = services.length;
    const operationalCount = services.filter((s) => s.status === 'operational').length;
    const outageCount = services.filter((s) => s.status === 'outage').length;
    const degradedCount = services.filter((s) => s.status === 'degraded').length;

    let globalStatusType = 'operational';
    let globalStatusSummary = `${operationalCount}/${totalServices} opérationnels`;

    if (isOffline) {
        globalStatusType = 'outage';
        globalStatusSummary = 'Système hors-ligne';
    } else if (outageCount > 0) {
        globalStatusType = 'outage';
        globalStatusSummary = `${outageCount} incident${outageCount > 1 ? 's' : ''}`;
    } else if (degradedCount > 0) {
        globalStatusType = 'degraded';
        globalStatusSummary = `${degradedCount} dégradé${degradedCount > 1 ? 's' : ''}`;
    }

    const primaryServices = services.slice(0, 2); // Uptime Général & Api (toujours visibles)
    const collapsibleServices = services.slice(2); // Backend, Frontend, Base de données, SMTP (dépliables)

    const renderStatusIcon = (status) => {
        if (status === 'operational') return <CheckCircleIcon />;
        if (status === 'degraded') return <WarningTriangleIcon />;
        return <RedCircleIcon />;
    };

    const renderServiceRow = (svc, isLast = false) => (
        <div key={svc.id} className={`admin-uptime-row ${isLast ? 'admin-uptime-row--last' : ''}`}>
            <div className="admin-uptime-row__top">
                <div className="admin-uptime-row__left">
                    <div className="admin-uptime-row__status-icon">
                        {renderStatusIcon(svc.status)}
                    </div>
                    <span className="admin-uptime-row__name">{svc.name}</span>
                    {svc.hasInfo && <InfoIcon />}
                    <button type="button" className="admin-uptime-row__dropdown-trigger">
                        <span>{svc.componentsLabel}</span>
                        <ChevronDownIcon />
                    </button>
                </div>

                {svc.uptime && (
                    <div className="admin-uptime-row__right">
                        <span>{svc.uptime}</span>
                    </div>
                )}
            </div>

            {/* Barres d'uptime réelles depuis le premier jour */}
            {svc.bars && (
                <div className="admin-uptime-bars" role="group" aria-label={`Historique uptime réel pour ${svc.name}`}>
                    {svc.bars.map((bar, idx) => {
                        const statusClass = (isOffline && idx === svc.bars.length - 1) || bar.status === 'outage'
                            ? 'admin-uptime-bar--red'
                            : bar.status === 'degraded'
                                ? 'admin-uptime-bar--yellow'
                                : 'admin-uptime-bar--green';

                        return (
                            <div key={bar.id || idx} className="admin-uptime-bar-wrapper">
                                <div className={`admin-uptime-bar ${statusClass}`} />
                                <div className="admin-uptime-bar-tooltip">
                                    <strong>{bar.date_formatted || bar.date}</strong> : {bar.status_label || `${bar.uptime_percentage}%`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className={`admin-uptime-card ${!isExpanded ? 'admin-uptime-card--collapsed' : ''}`}>
            {/* Header du rectangle Uptime avec bouton dépliable */}
            <div 
                className="admin-uptime-card__header"
                onClick={toggleExpanded}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpanded();
                    }
                }}
                aria-expanded={isExpanded}
                aria-controls="admin-uptime-content"
            >
                <div className="admin-uptime-card__header-left">
                    <h2 className="admin-uptime-card__title">System status</h2>
                    <div className={`admin-uptime-badge admin-uptime-badge--${globalStatusType}`}>
                        <span className={`admin-uptime-badge__dot admin-uptime-badge__dot--${globalStatusType}`} />
                        <span className="admin-uptime-badge__label">{globalStatusSummary}</span>
                    </div>
                </div>

                <div className="admin-uptime-card__header-right" onClick={(e) => e.stopPropagation()}>
                    <div className="admin-uptime-card__range">
                        <button type="button" className="admin-uptime-card__arrow-btn" aria-label="Période précédente">
                            <ChevronLeftIcon />
                        </button>
                        <span className="admin-uptime-card__range-text">{dateRangeLabel}</span>
                        <button type="button" className="admin-uptime-card__arrow-btn" aria-label="Période suivante">
                            <ChevronRightIcon />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="admin-uptime-card__toggle-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded();
                        }}
                        aria-label={isExpanded ? 'Replier les services détaillés' : 'Déplier tous les services'}
                        title={isExpanded ? 'Replier' : 'Déplier'}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="admin-uptime-card__toggle-icon"
                            aria-hidden="true"
                        >
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Rangées permanentes (visibles même quand la carte est pliée) : Uptime Général & Api */}
            <div className="admin-uptime-rows admin-uptime-rows--primary">
                {primaryServices.map((svc, idx) =>
                    renderServiceRow(svc, !isExpanded && idx === primaryServices.length - 1)
                )}
            </div>

            {/* Rangées secondaires dépliables : Backend, Frontend, Base de données, SMTP */}
            <div id="admin-uptime-content" className="admin-uptime-card__content-wrapper">
                <div className="admin-uptime-card__content-inner">
                    <div className="admin-uptime-rows admin-uptime-rows--secondary">
                        {collapsibleServices.map((svc, idx) =>
                            renderServiceRow(svc, idx === collapsibleServices.length - 1)
                        )}
                    </div>
                </div>
            </div>

            {/* Bouton de bascule en pied de carte */}
            <div className="admin-uptime-card__footer-toggle">
                <button
                    type="button"
                    className="admin-uptime-card__footer-btn"
                    onClick={() => toggleExpanded()}
                >
                    <span>
                        {isExpanded
                            ? 'Masquer les services détaillés'
                            : `Afficher plus de services (${collapsibleServices.length})`}
                    </span>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="admin-uptime-card__footer-icon"
                        aria-hidden="true"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
