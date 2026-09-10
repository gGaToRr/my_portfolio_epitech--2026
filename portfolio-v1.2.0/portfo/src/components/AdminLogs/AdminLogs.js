import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchRecentDaysLogs, fetchLiveLogs } from '../../services/api';
import './AdminLogs.css';

export default function AdminLogs({ onBack }) {
    // Liste des 5 jours (Aujourd'hui + 4 jours précédents)
    const [days, setDays] = useState([]);
    const [selectedDayKey, setSelectedDayKey] = useState('all'); // 'all' ou filename spécifique
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'admin', 'errors', 'success'
    const [selectedMethod, setSelectedMethod] = useState('ALL'); // 'ALL', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'
    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const [linesCount, setLinesCount] = useState(200);

    const consoleEndRef = useRef(null);
    const methodDropdownRef = useRef(null);

    // Fermeture du dropdown de méthode au clic à l'extérieur
    useEffect(() => {
        function handleClickOutside(e) {
            if (methodDropdownRef.current && !methodDropdownRef.current.contains(e.target)) {
                setIsMethodDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Initialisation & actualisation
    useEffect(() => {
        loadAllRecentLogs();
    }, [loadAllRecentLogs]);

    // Polling silencieux pour mettre à jour les logs du jour en arrière-plan sans bloquer l'UI
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const todayData = await fetchLiveLogs(linesCount);
                if (todayData && Array.isArray(todayData.lines)) {
                    const todayFilename = todayData.filename;
                    if (logsCacheRef.current[todayFilename]) {
                        logsCacheRef.current[todayFilename] = {
                            ...logsCacheRef.current[todayFilename],
                            lines: todayData.lines,
                            total_lines: todayData.total_lines,
                            size_bytes: todayData.size_bytes,
                            cachedAt: Date.now(),
                        };
                        setDays((prev) =>
                            prev.map((d) =>
                                d.filename === todayFilename
                                    ? { ...d, lines: todayData.lines, total_lines: todayData.total_lines }
                                    : d
                            )
                        );
                    }
                }
            } catch (err) {
                // Ignore silent refresh errors
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [linesCount]);

    // Calcul des logs actifs selon le jour sélectionné (Depuis le cache mémoire)
    const activeLogs = useMemo(() => {
        if (selectedDayKey === 'all') {
            const all = [];
            days.forEach((d) => {
                const cached = logsCacheRef.current[d.filename];
                if (cached && cached.lines) {
                    all.push(...cached.lines);
                }
            });
            return all;
        }

        const cached = logsCacheRef.current[selectedDayKey];
        return cached && Array.isArray(cached.lines) ? cached.lines : [];
    }, [selectedDayKey, days]);

    // Filtres dynamiques (Recherche + Niveau + Méthode HTTP)
    const filteredLogs = useMemo(() => {
        return activeLogs.filter((line) => {
            const lower = line.toLowerCase();
            const upper = line.toUpperCase();

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
            if (filterLevel === 'errors') {
                return (
                    lower.includes('statut 401') ||
                    lower.includes('statut 403') ||
                    lower.includes('statut 404') ||
                    lower.includes('statut 500') ||
                    lower.includes('erreur') ||
                    lower.includes('error') ||
                    lower.includes('exception') ||
                    lower.includes('failed') ||
                    lower.includes('[91m')
                );
            }
            if (filterLevel === 'admin') {
                return (
                    lower.includes('/api/admin') ||
                    lower.includes('/api/auth') ||
                    lower.includes('paneladmin') ||
                    lower.includes('[status.py]') ||
                    lower.includes('[auth.py]')
                );
            }
            if (filterLevel === 'success') {
                return lower.includes('statut 200') || lower.includes('succès') || lower.includes('success');
            }

            return true;
        });
    }, [activeLogs, searchTerm, filterLevel, selectedMethod]);

    // Auto-scroll vers le bas lors de l'arrivée de nouveaux logs
    useEffect(() => {
        if (consoleEndRef.current && filteredLogs.length > 0) {
            consoleEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [filteredLogs.length]);

    const getLineClass = (line) => {
        const lower = line.toLowerCase();
        if (
            lower.includes('statut 500') ||
            lower.includes('statut 401') ||
            lower.includes('statut 403') ||
            lower.includes('statut 404') ||
            lower.includes('erreur') ||
            lower.includes('error') ||
            lower.includes('exception') ||
            lower.includes('failed') ||
            lower.includes('[91m')
        ) {
            return 'admin-logs-line--error';
        }
        if (lower.includes('warning') || lower.includes('avertissement')) {
            return 'admin-logs-line--warning';
        }
        if (lower.includes('/api/admin') || lower.includes('/api/auth')) {
            return 'admin-logs-line--admin';
        }
        if (lower.includes('statut 200') || lower.includes('success') || lower.includes('succès')) {
            return 'admin-logs-line--success';
        }
        return '';
    };

    const totalCachedLines = useMemo(() => {
        return days.reduce((acc, d) => acc + (d.lines?.length || 0), 0);
    }, [days]);

    return (
        <div className="admin-logs-view">
            {/* 1. Bandeau supérieur séparé (Titre, Jours en cache, Filtres & Recherche) */}
            <div className="admin-logs-toolbar-card">
                {/* En-tête sans emojis avec typographie agrandie */}
                <div className="admin-logs-header">
                    <div className="admin-logs-title-box">
                        {onBack && (
                            <button type="button" className="admin-logs-back-btn" onClick={onBack}>
                                ← Retour
                            </button>
                        )}
                        <h2 className="admin-logs-title">Logs & Sécurité du serveur</h2>
                        <span className="admin-logs-badge">
                            {filteredLogs.length} logs affichés
                        </span>
                        <span className="admin-logs-cache-badge">
                            Cache 5 jours ({totalCachedLines} lignes)
                        </span>
                    </div>

                    <button
                        type="button"
                        className="admin-logs-refresh-btn"
                        onClick={() => loadAllRecentLogs(false)}
                        disabled={loading}
                    >
                        {loading ? 'Chargement…' : 'Actualiser'}
                    </button>
                </div>

                {/* Sélecteur de date (Cache 5 jours : Aujourd'hui + 4 précédents) */}
                <div className="admin-logs-days-bar">
                    <button
                        type="button"
                        className={`admin-logs-day-btn ${selectedDayKey === 'all' ? 'is-active' : ''}`}
                        onClick={() => setSelectedDayKey('all')}
                    >
                        Tous les 5 jours <span className="admin-logs-day-count">{totalCachedLines}</span>
                    </button>
                    {days.map((day) => (
                        <button
                            key={day.filename}
                            type="button"
                            className={`admin-logs-day-btn ${selectedDayKey === day.filename ? 'is-active' : ''}`}
                            onClick={() => setSelectedDayKey(day.filename)}
                            title={`${day.filename} (${day.total_lines} lignes au total)`}
                        >
                            {day.label}
                            <span className="admin-logs-day-count">
                                {day.exists ? (day.lines?.length || 0) : '0'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Barre d'outils (Recherche, filtres rapides, dropdown méthode HTTP custom, sélecteur de volume) */}
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

                        {/* Dropdown customisé pour la sélection de la méthode HTTP */}
                        <div className="admin-logs-dropdown-wrapper" ref={methodDropdownRef}>
                            <button
                                type="button"
                                className={`admin-logs-filter-btn admin-logs-dropdown-btn ${selectedMethod !== 'ALL' ? 'is-active' : ''}`}
                                onClick={() => setIsMethodDropdownOpen((prev) => !prev)}
                            >
                                <span>Méthode : {selectedMethod === 'ALL' ? 'Toutes' : selectedMethod}</span>
                                <span className={`admin-logs-dropdown-caret ${isMethodDropdownOpen ? 'is-open' : ''}`}>▾</span>
                            </button>
                            {isMethodDropdownOpen && (
                                <div className="admin-logs-dropdown-menu">
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'ALL' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('ALL');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--all">ALL</span>
                                        <span>Toutes les méthodes</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'GET' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('GET');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--get">GET</span>
                                        <span>Lecture & Consultations</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'POST' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('POST');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--post">POST</span>
                                        <span>Créations & Actions</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'PUT' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('PUT');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--put">PUT</span>
                                        <span>Mises à jour</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'DELETE' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('DELETE');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--delete">DELETE</span>
                                        <span>Suppressions</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`admin-logs-dropdown-item ${selectedMethod === 'OPTIONS' ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMethod('OPTIONS');
                                            setIsMethodDropdownOpen(false);
                                        }}
                                    >
                                        <span className="method-tag method-tag--options">OPTIONS</span>
                                        <span>Pré-vols CORS</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <select
                            className="admin-logs-filter-btn"
                            value={linesCount}
                            onChange={(e) => setLinesCount(Number(e.target.value))}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            <option value={50}>50 lignes/jour</option>
                            <option value={150}>150 lignes/jour</option>
                            <option value={200}>200 lignes/jour</option>
                            <option value={500}>500 lignes/jour</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. Card inférieure dédiée exclusivement à la console des logs */}
            <div className="admin-logs-console-card">
                <div className="admin-logs-console">
                    {filteredLogs.length === 0 ? (
                        <div className="admin-logs-empty">
                            {loading ? 'Chargement du flux de logs…' : 'Aucune ligne ne correspond aux filtres actuels.'}
                        </div>
                    ) : (
                        filteredLogs.map((line, idx) => (
                            <div key={idx} className={`admin-logs-line ${getLineClass(line)}`}>
                                <span className="admin-logs-line-num">{idx + 1}</span>
                                <span className="admin-logs-line-content">
                                    {line.replace(/\[\d+m/g, '')}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={consoleEndRef} />
                </div>
            </div>
        </div>
    );
}


