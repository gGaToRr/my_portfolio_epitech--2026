import { useEffect, useState } from 'react';
import { useEditableContent } from '../../context/EditableContentContext';
import { fetchLogsFiles, triggerLogArchive, clearBugs } from '../../services/api';
import './AdminSettings.css';

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const ArchiveIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const ResetIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

function formatBytes(bytes) {
    if (!bytes) return '0 o';
    const units = ['o', 'Ko', 'Mo', 'Go'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function AdminSettings({ onBack, onLogout }) {
    const { resetToDefaults } = useEditableContent();
    const adminUser = (() => {
        try {
            return localStorage.getItem('admin_user') || 'admin';
        } catch (_) {
            return 'admin';
        }
    })();

    const [logsInfo, setLogsInfo] = useState(null);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logsError, setLogsError] = useState(null);

    const [archiveStatus, setArchiveStatus] = useState(null);
    const [archiveLoading, setArchiveLoading] = useState(false);

    const [bugsStatus, setBugsStatus] = useState(null);
    const [bugsLoading, setBugsLoading] = useState(false);

    const [resetDone, setResetDone] = useState(false);

    const loadLogsInfo = async () => {
        setLogsLoading(true);
        setLogsError(null);
        try {
            const data = await fetchLogsFiles();
            setLogsInfo(data);
        } catch (err) {
            setLogsError(err.message || 'Impossible de lister les fichiers de logs.');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        loadLogsInfo();
    }, []);

    const handleArchive = async () => {
        if (!window.confirm(
            "Archiver le mois précédent maintenant ? Les logs quotidiens de ce mois seront compressés dans un .tar.gz puis supprimés (l'archive, elle, est conservée)."
        )) {
            return;
        }
        setArchiveLoading(true);
        setArchiveStatus(null);
        try {
            const res = await triggerLogArchive();
            // "empty" (rien à archiver) n'est pas un échec : ni vert succès, ni
            // rouge erreur, juste une information neutre.
            const tone = res.status === 'ok' ? 'ok' : res.status === 'empty' ? 'neutral' : 'error';
            setArchiveStatus({ tone, ...res });
            await loadLogsInfo();
        } catch (err) {
            setArchiveStatus({ tone: 'error', message: err.message || 'Échec de l\'archivage.' });
        } finally {
            setArchiveLoading(false);
        }
    };

    const handleClearBugs = async () => {
        if (!window.confirm('Vider tout l\'historique des bugs remontés par les visiteurs ?')) {
            return;
        }
        setBugsLoading(true);
        setBugsStatus(null);
        try {
            const res = await clearBugs();
            setBugsStatus({ ok: true, message: res.message || 'Historique des bugs réinitialisé.' });
        } catch (err) {
            setBugsStatus({ ok: false, message: err.message || 'Échec de la réinitialisation.' });
        } finally {
            setBugsLoading(false);
        }
    };

    const handleResetContent = () => {
        if (!window.confirm('Voulez-vous vraiment réinitialiser tout le contenu et les couleurs édités aux valeurs par défaut ?')) {
            return;
        }
        resetToDefaults();
        setResetDone(true);
        setTimeout(() => setResetDone(false), 3000);
    };

    return (
        <div className="admin-settings-view">
            <div className="admin-settings-toolbar-card">
                <div className="admin-settings-header">
                    <div className="admin-settings-title-box">
                        {onBack && (
                            <button
                                type="button"
                                className="admin-settings-back-btn"
                                onClick={onBack}
                                title="Retour au tableau de bord"
                                aria-label="Retour au tableau de bord"
                            >
                                <BackIcon />
                            </button>
                        )}
                        <div>
                            <h2 className="admin-settings-title">Réglages & Maintenance</h2>
                            <p className="admin-settings-subtitle">Compte administrateur, contenu édité et opérations de maintenance du serveur.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-settings-scroll-area">
                {/* 1. Compte */}
                <section className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <h3 className="admin-settings-section-title">Compte administrateur</h3>
                    </div>
                    <div className="admin-settings-kpi-grid">
                        <div className="admin-info-card admin-info-card--healthy">
                            <div className="admin-info-card__header">
                                <span className="admin-info-card__title">Identifiant</span>
                                <span className="admin-info-card__tag">Session</span>
                            </div>
                            <div className="admin-info-card__body">
                                <div className="admin-info-card__value">{adminUser}</div>
                                <div className="admin-info-card__rows">
                                    <div className="admin-info-card__row">
                                        <span className="admin-info-card__row-source">Authentification</span>
                                        <span className="admin-info-card__row-msg">Cookie HttpOnly sécurisé</span>
                                    </div>
                                    <div className="admin-info-card__row">
                                        <span className="admin-info-card__row-source">Durée de session</span>
                                        <span className="admin-info-card__row-msg">30 minutes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="admin-info-card__footer">
                                <span className="admin-info-card__subtitle">Le mot de passe se configure côté serveur (backend/.env.local)</span>
                            </div>
                        </div>
                    </div>
                    {onLogout && (
                        <button type="button" className="admin-settings-btn admin-settings-btn--ghost" onClick={onLogout}>
                            Se déconnecter
                        </button>
                    )}
                </section>

                {/* 2. Contenu du site */}
                <section className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <h3 className="admin-settings-section-title">Contenu du portfolio (mode édition)</h3>
                    </div>
                    <div className="admin-settings-card">
                        <p className="admin-settings-card__text">
                            Les modifications faites en <strong>mode édition en direct</strong> (textes, couleurs, projets, compétences,
                            réseaux…) sont un brouillon conservé uniquement dans <strong>ce navigateur</strong> (localStorage) : elles ne
                            sont pas publiées pour les autres visiteurs. Pour les rendre définitives, reportez-les à la main dans le code
                            source puis redéployez.
                        </p>
                        <div className="admin-settings-card__actions">
                            <button
                                type="button"
                                className="admin-settings-btn admin-settings-btn--danger"
                                onClick={handleResetContent}
                            >
                                <ResetIcon />
                                <span>Réinitialiser tous les contenus & couleurs</span>
                            </button>
                            {resetDone && <span className="admin-settings-inline-status admin-settings-inline-status--ok">Contenu réinitialisé.</span>}
                        </div>
                    </div>
                </section>

                {/* 3. Maintenance & Logs */}
                <section className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <h3 className="admin-settings-section-title">Maintenance & Logs</h3>
                    </div>

                    <div className="admin-settings-card">
                        <div className="admin-settings-card__head">
                            <span className="admin-settings-card__label">Archivage mensuel</span>
                            {!logsLoading && !logsError && logsInfo && (
                                <span className="admin-settings-card__meta">
                                    {logsInfo.total_daily_logs} log{logsInfo.total_daily_logs > 1 ? 's' : ''} quotidien{logsInfo.total_daily_logs > 1 ? 's' : ''} · {logsInfo.total_archives} archive{logsInfo.total_archives > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <p className="admin-settings-card__text">
                            Compresse les logs quotidiens du mois précédent dans une archive <code>.tar.gz</code> puis supprime les
                            fichiers d'origine. Sans configuration particulière, cette opération se fait automatiquement chaque début de
                            mois ; ce bouton permet de la déclencher manuellement.
                        </p>
                        {logsError && <p className="admin-settings-inline-status admin-settings-inline-status--error">{logsError}</p>}
                        <div className="admin-settings-card__actions">
                            <button
                                type="button"
                                className="admin-settings-btn"
                                onClick={handleArchive}
                                disabled={archiveLoading}
                            >
                                <ArchiveIcon />
                                <span>{archiveLoading ? 'Archivage en cours…' : 'Archiver le mois précédent'}</span>
                            </button>
                            {archiveStatus && (
                                <span className={`admin-settings-inline-status admin-settings-inline-status--${archiveStatus.tone}`}>
                                    {archiveStatus.status === 'empty'
                                        ? (archiveStatus.message || 'Aucun log à archiver pour le mois précédent.')
                                        : archiveStatus.status === 'ok'
                                        ? `Archive créée : ${archiveStatus.archive_name} (${archiveStatus.files_count} fichier${archiveStatus.files_count > 1 ? 's' : ''}, ${formatBytes(archiveStatus.archive_size_bytes)})`
                                        : (archiveStatus.message || 'Échec de l\'archivage.')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="admin-settings-card">
                        <div className="admin-settings-card__head">
                            <span className="admin-settings-card__label">Signalements de bugs</span>
                        </div>
                        <p className="admin-settings-card__text">
                            Efface l'historique des erreurs client remontées automatiquement par le site (voir la carte « Statut » du
                            tableau de bord).
                        </p>
                        <div className="admin-settings-card__actions">
                            <button
                                type="button"
                                className="admin-settings-btn admin-settings-btn--danger"
                                onClick={handleClearBugs}
                                disabled={bugsLoading}
                            >
                                <TrashIcon />
                                <span>{bugsLoading ? 'Suppression…' : 'Vider les signalements de bugs'}</span>
                            </button>
                            {bugsStatus && (
                                <span className={`admin-settings-inline-status ${bugsStatus.ok ? 'admin-settings-inline-status--ok' : 'admin-settings-inline-status--error'}`}>
                                    {bugsStatus.message}
                                </span>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
