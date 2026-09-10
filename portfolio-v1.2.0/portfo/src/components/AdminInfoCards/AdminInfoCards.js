import React, { useState, useEffect } from 'react';
import { 
    fetchAnalyticsStats, 
    fetchProjects, 
    fetchEpitechProjects, 
    fetchLiveLogs,
    fetchSystemStatus 
} from '../../services/api';
import './AdminInfoCards.css';

export default function AdminInfoCards({ customCards }) {
    const [analytics, setAnalytics] = useState(null);
    const [persoProjectsCount, setPersoProjectsCount] = useState(null);
    const [epitechProjectsCount, setEpitechProjectsCount] = useState(null);
    const [anomaliesCount, setAnomaliesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadAllData() {
            try {
                // 1, 2, 3 & 4. Chargement parallèle
                const [analyticsData, persoData, epitechData, logsData, statusData] = await Promise.allSettled([
                    fetchAnalyticsStats(30),
                    fetchProjects('fr'),
                    fetchEpitechProjects('fr'),
                    fetchLiveLogs(150),
                    fetchSystemStatus(),
                ]);

                if (!isMounted) return;

                if (analyticsData.status === 'fulfilled' && analyticsData.value) {
                    setAnalytics(analyticsData.value);
                }

                if (persoData.status === 'fulfilled' && Array.isArray(persoData.value)) {
                    setPersoProjectsCount(persoData.value.length);
                }

                if (epitechData.status === 'fulfilled' && Array.isArray(epitechData.value)) {
                    setEpitechProjectsCount(epitechData.value.length);
                }

                // 4. Extraction et comptage précis des anomalies
                let totalLogAnomalies = 0;

                if (logsData.status === 'fulfilled' && logsData.value?.lines) {
                    const rawLines = logsData.value.lines;
                    const anomalyLines = rawLines.filter((line) => {
                        // Exclure les tests automatisés pytest
                        if (line.includes('testclient') || line.includes('testadmin')) return false;

                        const lower = line.toLowerCase();
                        return (
                            line.includes('[91m') ||
                            lower.includes('erreur') ||
                            lower.includes('error') ||
                            lower.includes('exception') ||
                            lower.includes('critique') ||
                            lower.includes('failed') ||
                            lower.includes('interruption')
                        );
                    });

                    totalLogAnomalies = anomalyLines.length;
                }

                let recordedBugs = 0;
                if (statusData.status === 'fulfilled' && statusData.value) {
                    recordedBugs = statusData.value.metrics?.total_bugs_recorded || 
                                   statusData.value.recent_bugs?.length || 0;
                }

                const totalCalculated = Math.max(totalLogAnomalies, recordedBugs);
                setAnomaliesCount(totalCalculated);
            } catch (err) {
                console.warn('[AdminInfoCards] Erreur de chargement des métriques :', err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadAllData();
        const pollInterval = setInterval(loadAllData, 12000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    // 1. Visiteurs
    const visitorsTotal = analytics?.unique_visitors ?? (loading ? '…' : 0);
    const todayVisitors = analytics?.today_unique_visitors ?? 0;
    const totalPageviews = analytics?.total_pageviews ?? 0;

    // 2. Téléchargements CV avec extraction des adresses IP et métadonnées réelles
    const cvDownloadsCount = analytics?.total_cv_downloads ?? 
        (analytics?.recent_events?.find((e) => e.event_name === 'download_cv')?.count ?? (loading ? '…' : 0));

    const recentDownloadsFromApi = analytics?.recent_cv_downloads || [];
    
    let cvDownloadsList = [];
    if (recentDownloadsFromApi.length > 0) {
        cvDownloadsList = recentDownloadsFromApi.slice(0, 3).map((dl) => {
            let timeLabel = 'Live';
            if (dl.timestamp) {
                try {
                    const d = new Date(dl.timestamp);
                    if (!isNaN(d.getTime())) {
                        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                } catch (_) {}
            } else if (dl.time) {
                timeLabel = dl.time;
            }

            return {
                time: timeLabel,
                source: dl.ip || '127.0.0.1',
                message: `${dl.format || 'PDF'} • ${dl.os || 'OS'} / ${dl.browser || 'Web'}`,
                raw: `IP: ${dl.ip} - ${dl.target || 'CV'} (${dl.os} / ${dl.browser})`,
            };
        });

        if (cvDownloadsList.length === 1) {
            cvDownloadsList.push(
                { time: 'Format', source: 'Cible', message: 'CV_PIERRE_UNTERSINGER.pdf' },
                { time: 'Télémétrie', source: 'Tracking', message: 'Écoute active (IP & OS)' }
            );
        } else if (cvDownloadsList.length === 2) {
            cvDownloadsList.push(
                { time: 'Télémétrie', source: 'Tracking', message: 'Écoute active (IP & OS)' }
            );
        }
    } else {
        cvDownloadsList = [
            { time: 'Live', source: 'Statut', message: '0 téléchargement enregistré' },
            { time: 'Format', source: 'Cible', message: 'CV_PIERRE_UNTERSINGER.pdf' },
            { time: 'Télémétrie', source: 'Tracking', message: 'Écoute active (IP & OS)' },
        ];
    }

    // 3. Projets en ligne
    const totalProjects = (persoProjectsCount ?? 0) + (epitechProjectsCount ?? 0);

    // 4. Anomalies logs & coloration dynamique
    let logVariant = 'healthy';
    let logSubtitle = 'Journée saine • 0 incident';

    if (anomaliesCount > 0 && anomaliesCount <= 3) {
        logVariant = 'warning';
        logSubtitle = `${anomaliesCount} événement${anomaliesCount > 1 ? 's' : ''} détecté${anomaliesCount > 1 ? 's' : ''}`;
    } else if (anomaliesCount > 3) {
        logVariant = 'danger';
        logSubtitle = `${anomaliesCount} anomalies • 3 plus récentes`;
    }

    const logItems = [
        { source: 'Santé système', message: anomaliesCount === 0 ? 'Optimale (0 incident)' : `${anomaliesCount} anomalie${anomaliesCount > 1 ? 's' : ''}` },
        { source: 'Serveur API', message: anomaliesCount === 0 ? 'Opérationnel' : 'Vérification requise' },
        { source: 'Télémétrie', message: 'Surveillance active' },
    ];

    // Mini rangées structurées et harmonisées pour les 4 cartes
    const visitorItems = [
        { time: 'Live', source: "Aujourd'hui", message: `+${todayVisitors} visiteur${todayVisitors > 1 ? 's' : ''}` },
        { time: 'Total', source: 'Pages vues', message: `${totalPageviews} vues` },
        { time: '30j', source: 'Période', message: 'Télémétrie active' },
    ];

    const projectItems = [
        { time: 'Perso', source: 'Personnels', message: `${persoProjectsCount ?? 0} en ligne` },
        { time: 'Epi', source: 'Epitech', message: `${epitechProjectsCount ?? 0} validés` },
        { time: '100%', source: 'Statut', message: 'Tous opérationnels' },
    ];

    const cards = customCards || [
        {
            id: 'card-visitors',
            title: 'Visiteurs du site',
            value: typeof visitorsTotal === 'number' 
                ? `${visitorsTotal.toLocaleString('fr-FR')} visiteur${visitorsTotal > 1 ? 's' : ''}` 
                : visitorsTotal,
            subtitle: `${todayVisitors} aujourd'hui • ${totalPageviews} pages vues`,
            variant: 'visitors',
            items: visitorItems,
        },
        {
            id: 'card-cv',
            title: 'Téléchargements CV',
            value: typeof cvDownloadsCount === 'number' 
                ? `${cvDownloadsCount} téléchargement${cvDownloadsCount > 1 ? 's' : ''}` 
                : cvDownloadsCount,
            subtitle: typeof cvDownloadsCount === 'number'
                ? (cvDownloadsCount === 0 ? 'En attente • CV_PIERRE_UNTERSINGER.pdf' : `${cvDownloadsCount} téléchargement${cvDownloadsCount > 1 ? 's' : ''} • PDF Vectoriel`)
                : 'Format PDF Vectoriel • CV_PIERRE_UNTERSINGER.pdf',
            variant: 'cv',
            items: cvDownloadsList,
        },
        {
            id: 'card-projects',
            title: 'Projets en ligne',
            value: `${totalProjects} projet${totalProjects > 1 ? 's' : ''}`,
            subtitle: `${persoProjectsCount ?? 0} personnels • ${epitechProjectsCount ?? 0} Epitech`,
            variant: 'projects',
            items: projectItems,
        },
        {
            id: 'card-logs',
            title: 'Anomalies logs',
            value: `${anomaliesCount} anomalie${anomaliesCount > 1 ? 's' : ''}`,
            subtitle: logSubtitle,
            variant: logVariant,
            items: logItems,
        },
    ];

    return (
        <div className="admin-info-grid">
            {cards.map((card) => {
                const variantClass = card.variant ? `admin-info-card--${card.variant}` : '';

                return (
                    <div key={card.id} className={`admin-info-card ${variantClass}`}>
                        <div className="admin-info-card__header">
                            <span className="admin-info-card__title">{card.title}</span>
                        </div>

                        <div className="admin-info-card__body">
                            <div className="admin-info-card__value">{card.value}</div>
                            
                            {card.items && card.items.length > 0 && (
                                <div className="admin-info-card__rows">
                                    {card.items.map((item, idx) => (
                                        <div key={idx} className="admin-info-card__row" title={item.raw || `${item.source}: ${item.message}`}>
                                            <div className="admin-info-card__row-left">
                                                {item.time && (
                                                    <span className="admin-info-card__row-time">{item.time}</span>
                                                )}
                                                <span className="admin-info-card__row-source">{item.source}</span>
                                            </div>
                                            <span className="admin-info-card__row-msg">{item.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="admin-info-card__footer">
                            <span className="admin-info-card__subtitle">{card.subtitle}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
