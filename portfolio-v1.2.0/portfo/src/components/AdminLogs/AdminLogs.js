import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLiveLogs } from '../../services/api';
import './AdminLogs.css';

export default function AdminLogs({ onBack }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'errors', 'admin', 'success'
    const [linesCount, setLinesCount] = useState(150);
    const [filename, setFilename] = useState('');
    const consoleEndRef = useRef(null);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchLiveLogs(linesCount);
            if (data && Array.isArray(data.lines)) {
                setLogs(data.lines);
                if (data.filename) setFilename(data.filename);
            }
        } catch (err) {
            console.warn('[AdminLogs] Erreur chargement logs :', err.message);
        } finally {
            setLoading(false);
        }
    }, [linesCount]);

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 8000);
        return () => clearInterval(interval);
    }, [loadLogs]);

    const filteredLogs = logs.filter((line) => {
        const lower = line.toLowerCase();

        // Filtre de recherche
        if (searchTerm && !lower.includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Filtre de niveau
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
            return lower.includes('/api/admin') || lower.includes('/api/auth') || lower.includes('paneladmin');
        }
        if (filterLevel === 'success') {
            return lower.includes('statut 200') || lower.includes('succès') || lower.includes('success');
        }

        return true;
    });

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
        if (lower.includes('statut 200') || lower.includes('success')) {
            return 'admin-logs-line--success';
        }
        return '';
    };

    return (
        <div className="admin-logs-view">
            <div className="admin-logs-card">
                <div className="admin-logs-header">
                    <div className="admin-logs-title-box">
                        {onBack && (
                            <button type="button" className="admin-logs-back-btn" onClick={onBack}>
                                ← Retour
                            </button>
                        )}
                        <h2 className="admin-logs-title">Logs & Sécurité du serveur</h2>
                        <span className="admin-logs-badge">
                            {filename ? filename : 'Direct'} • {logs.length} lignes
                        </span>
                    </div>

                    <button type="button" className="admin-logs-refresh-btn" onClick={loadLogs} disabled={loading}>
                        {loading ? 'Chargement…' : '🔄 Actualiser'}
                    </button>
                </div>

                <div className="admin-logs-toolbar">
                    <div className="admin-logs-search-box">
                        <input
                            type="text"
                            className="admin-logs-search-input"
                            placeholder="Rechercher une IP, une route, un statut..."
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
                            Tous ({logs.length})
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
                        <select
                            className="admin-logs-filter-btn"
                            value={linesCount}
                            onChange={(e) => setLinesCount(Number(e.target.value))}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            <option value={50}>50 lignes</option>
                            <option value={150}>150 lignes</option>
                            <option value={300}>300 lignes</option>
                            <option value={500}>500 lignes</option>
                        </select>
                    </div>
                </div>

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
