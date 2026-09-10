import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchRecentDaysLogs, fetchLiveLogs } from '../../services/api';
import { cleanLogLine, getLineClass } from '../../utils/logLines';
import CustomDropdown from '../CustomDropdown/CustomDropdown';
import './AdminLogs.css';

const HTTP_METHOD_OPTIONS = [
    { value: 'ALL', label: 'Toutes les méthodes', shortLabel: 'Toutes', tag: 'ALL', tagClass: 'method-tag--all' },
    { value: 'GET', label: 'Lecture & Consultations', shortLabel: 'GET', tag: 'GET', tagClass: 'method-tag--get' },
    { value: 'POST', label: 'Créations & Actions', shortLabel: 'POST', tag: 'POST', tagClass: 'method-tag--post' },
    { value: 'PUT', label: 'Mises à jour', shortLabel: 'PUT', tag: 'PUT', tagClass: 'method-tag--put' },
    { value: 'DELETE', label: 'Suppressions', shortLabel: 'DELETE', tag: 'DELETE', tagClass: 'method-tag--delete' },
    { value: 'OPTIONS', label: 'Pré-vols CORS', shortLabel: 'OPTIONS', tag: 'OPTIONS', tagClass: 'method-tag--options' },
];

const LINES_COUNT_OPTIONS = [
    { value: 50, label: '50 lignes / jour' },
    { value: 150, label: '150 lignes / jour' },
    { value: 200, label: '200 lignes / jour' },
    { value: 500, label: '500 lignes / jour' },
];

export default function AdminLogs({ onBack }) {
    // Liste des 5 jours (Aujourd'hui + 4 jours précédents)
    const [days, setDays] = useState([]);
    const [selectedDayKey, setSelectedDayKey] = useState('all'); // 'all' ou filename spécifique
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'admin', 'errors', 'success'
    const [selectedMethod, setSelectedMethod] = useState('ALL'); // 'ALL', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'
    const [linesCount, setLinesCount] = useState(200);

    const consoleContainerRef = useRef(null);

    // Enregistrement de la consultation de la page de logs pour la session
    useEffect(() => {
        try {
            sessionStorage.setItem('admin_logs_viewed_session', 'true');
        } catch (_) {}
    }, []);

    // Cache mémoire pour stocker les logs par fichier/jour
    const logsCacheRef = useRef({});

    // Chargement initial des 5 jours (Aujourd'hui + 4 précédents) en cache
    const loadAllRecentLogs = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const data = await fetchRecentDaysLogs(5, linesCount);
            if (data && Array.isArray(data.days)) {
                const updatedDays = [];
                data.days.forEach((day) => {
                    logsCacheRef.current[day.filename] = {
                        filename: day.filename,
                        label: day.label,
                        date: day.date,
                        exists: day.exists,
                        lines: day.lines || [],
                        total_lines: day.total_lines || 0,
                        size_bytes: day.size_bytes || 0,
                        cachedAt: Date.now(),
                    };
                    updatedDays.push(logsCacheRef.current[day.filename]);
                });
                setDays(updatedDays);
            }
        } catch (err) {
            console.warn('[AdminLogs] Erreur chargement logs multi-jours, fallback live :', err.message);
            try {
                const liveData = await fetchLiveLogs(linesCount);
                if (liveData && Array.isArray(liveData.lines)) {
                    const fallbackDay = {
                        filename: liveData.filename || 'portfolio.log',
                        label: "Aujourd'hui",
                        date: new Date().toISOString().slice(0, 10),
                        exists: true,
                        lines: liveData.lines,
                        total_lines: liveData.total_lines || liveData.lines.length,
                        size_bytes: liveData.size_bytes || 0,
                        cachedAt: Date.now(),
                    };
                    logsCacheRef.current[fallbackDay.filename] = fallbackDay;
                    setDays([fallbackDay]);
                }
            } catch (fallbackErr) {
                console.error('[AdminLogs] Erreur fallback logs :', fallbackErr);
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [linesCount]);

    // Initialisation
    useEffect(() => {
        loadAllRecentLogs(false);
    }, [loadAllRecentLogs]);

    // Polling automatique et silencieux toutes les 5 secondes (actualisation temps réel sans bouton)
    useEffect(() => {
        const interval = setInterval(() => {
            loadAllRecentLogs(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [loadAllRecentLogs]);

    // Calcul des logs actifs selon le jour sélectionné (Depuis le cache mémoire)
    // Les anciens logs sont placés en haut de la console (ordre chronologique : passé en haut, présent en bas)
    // Nettoyage et classification effectués une seule fois par ligne, à chaque
    // rechargement des logs. Ils étaient auparavant recalculés à chaque rendu,
    // donc à chaque caractère tapé dans la recherche — jusqu'à 1 000 lignes ×
    // deux expressions régulières par frappe.
    const activeLogs = useMemo(() => {
        const rawLines = (() => {
        if (selectedDayKey === 'all') {
            const all = [];
            // days est renvoyé du plus récent au plus ancien par l'API, on inverse pour mettre les anciens jours en haut
            const chronoSortedDays = [...days].reverse();
            chronoSortedDays.forEach((d) => {
                const cached = logsCacheRef.current[d.filename];
                if (cached && cached.lines) {
                    all.push(...cached.lines);
                }
            });
            return all;
        }

        const cached = logsCacheRef.current[selectedDayKey];
        return cached && Array.isArray(cached.lines) ? cached.lines : [];
        })();

        return rawLines.map((raw) => {
            const text = cleanLogLine(raw);
            const className = getLineClass(text);
            return {
                text,
                lower: text.toLowerCase(),
                upper: text.toUpperCase(),
                className,
                isError: className === 'admin-logs-line--error',
                isAdmin: className === 'admin-logs-line--admin',
                isSuccess: className === 'admin-logs-line--success',
            };
        });
    }, [selectedDayKey, days]);

    // Filtres dynamiques (Recherche + Niveau + Méthode HTTP)
    const filteredLogs = useMemo(() => {
        return activeLogs.filter((line) => {
            const { lower, upper } = line;

            // 1. Filtre de recherche textuelle
            if (searchTerm && !lower.includes(searchTerm.toLowerCase())) {
                return false;
            }

            // 2. Filtre par méthode HTTP (Custom Dropdown)
            if (selectedMethod !== 'ALL') {
                if (!upper.includes(`${selectedMethod} /`) && !upper.includes(`${selectedMethod} `)) {
                    return false;
                }
            }

            // 3. Filtre de catégorie / niveau
            // Classification déléguée à utils/logLines.js : les mêmes règles
            // servent au coloriage des lignes et au compteur d'anomalies du
            // tableau de bord, qui pouvaient diverger quand chaque composant
            // avait sa propre copie.
            if (filterLevel === 'errors') return line.isError;
            if (filterLevel === 'admin') return line.isAdmin;
            if (filterLevel === 'success') return line.isSuccess;

            return true;
        });
    }, [activeLogs, searchTerm, filterLevel, selectedMethod]);

    // Maintien du scroll en haut (anciens logs visibles immédiatement) lors des changements de filtre/date
    useEffect(() => {
        if (consoleContainerRef.current) {
            consoleContainerRef.current.scrollTop = 0;
        }
    }, [selectedDayKey, filterLevel, selectedMethod]);


    const totalCachedLines = useMemo(() => {
        return days.reduce((acc, d) => acc + (d.lines?.length || 0), 0);
    }, [days]);

    // Formatage concis de la date (JJ/MM) pour l'affichage avec l'icône calendrier
    const formatDayDate = (dateStr, fallbackLabel) => {
        if (dateStr) {
            try {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}`;
                }
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    return `${dd}/${mm}`;
                }
            } catch (_) {}
        }
        if (fallbackLabel) {
            const match = fallbackLabel.match(/(\d{2}\/\d{2})/);
            if (match) return match[1];
        }
        return dateStr || fallbackLabel || '';
    };

    // Options enrichies pour le menu déroulant de sélection des jours
    const dateOptions = useMemo(() => {
        const list = [
            {
                value: 'all',
                label: '5 derniers jours',
                shortLabel: '5 jours',
                tag: `${totalCachedLines} logs`,
                tagClass: 'date-tag--all',
                description: 'Flux combiné des 5 derniers jours',
            },
        ];

        days.forEach((day) => {
            const formattedDate = formatDayDate(day.date, day.label);
            const count = day.exists ? (day.lines?.length || 0) : 0;
            list.push({
                value: day.filename,
                label: day.label || `Logs du ${formattedDate}`,
                shortLabel: formattedDate,
                tag: `${count} logs`,
                tagClass: count > 0 ? 'date-tag--active' : 'date-tag--empty',
                description: `${day.filename} • ${day.total_lines || count} lignes`,
            });
        });

        return list;
    }, [days, totalCachedLines]);

    return (
        <div className="admin-logs-view">
            {/* 1. Bandeau supérieur séparé (Titre, Filtres, Menus déroulants & Recherche) */}
            <div className="admin-logs-toolbar-card">
                {/* En-tête épuré avec bouton retour SVG seul */}
                <div className="admin-logs-header">
                    <div className="admin-logs-title-box">
                        {onBack && (
                            <button
                                type="button"
                                className="admin-logs-back-btn"
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
                        <h2 className="admin-logs-title">Logs & Sécurité du serveur</h2>
                    </div>
                </div>

                {/* Barre d'outils unifiée (Recherche, filtres rapides, dropdowns Date, Méthode, Volume) */}
                <div className="admin-logs-toolbar">
                    <div className="admin-logs-search-box">
                        <input
                            type="text"
                            className="admin-logs-search-input"
                            placeholder="Rechercher une IP, une route, un statut, un message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="admin-logs-filter-group">
                        <button
                            type="button"
                            className={`admin-logs-filter-btn ${filterLevel === 'all' ? 'is-active' : ''}`}
                            onClick={() => setFilterLevel('all')}
                        >
                            Tous ({activeLogs.length})
                        </button>
                        <button
                            type="button"
                            className={`admin-logs-filter-btn ${filterLevel === 'admin' ? 'is-active' : ''}`}
                            onClick={() => setFilterLevel('admin')}
                        >
                            Appels Admin
                        </button>
                        <button
                            type="button"
                            className={`admin-logs-filter-btn ${filterLevel === 'errors' ? 'is-active' : ''}`}
                            onClick={() => setFilterLevel('errors')}
                        >
                            Erreurs & Alertes
                        </button>
                        <button
                            type="button"
                            className={`admin-logs-filter-btn ${filterLevel === 'success' ? 'is-active' : ''}`}
                            onClick={() => setFilterLevel('success')}
                        >
                            Succès 200
                        </button>

                        {/* Dropdown customisé pour la sélection de la période / date avec icône calendrier */}
                        <CustomDropdown
                            value={selectedDayKey}
                            options={dateOptions}
                            onChange={(val) => setSelectedDayKey(val)}
                            prefix="Date : "
                            icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            }
                            align="right"
                        />

                        {/* Dropdown customisé pour la sélection de la méthode HTTP */}
                        <CustomDropdown
                            value={selectedMethod}
                            options={HTTP_METHOD_OPTIONS}
                            onChange={(val) => setSelectedMethod(val)}
                            prefix="Méthode : "
                            align="right"
                        />

                        {/* Dropdown customisé pour le volume de lignes par jour */}
                        <CustomDropdown
                            value={linesCount}
                            options={LINES_COUNT_OPTIONS}
                            onChange={(val) => setLinesCount(Number(val))}
                            prefix=""
                            align="right"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Card inférieure dédiée exclusivement à la console des logs */}
            <div className="admin-logs-console-card">
                <div className="admin-logs-console" ref={consoleContainerRef}>
                    {filteredLogs.length === 0 ? (
                        <div className="admin-logs-empty">
                            {loading ? 'Chargement du flux de logs…' : 'Aucune ligne ne correspond aux filtres actuels.'}
                        </div>
                    ) : (
                        filteredLogs.map((line, idx) => (
                            <div key={idx} className={`admin-logs-line ${line.className}`}>
                                <span className="admin-logs-line-num">{idx + 1}</span>
                                <span className="admin-logs-line-content">
                                    {line.text}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}



