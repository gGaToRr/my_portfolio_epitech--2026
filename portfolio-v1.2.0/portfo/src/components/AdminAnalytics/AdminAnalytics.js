import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnalyticsOverview, fetchAnalyticsChart } from '../../services/api';
import CustomDropdown from '../CustomDropdown/CustomDropdown';
import './AdminAnalytics.css';

const PERIODES = [
    { value: 7, label: '7 derniers jours', shortLabel: '7 j' },
    { value: 30, label: '30 derniers jours', shortLabel: '30 j' },
    { value: 90, label: '90 derniers jours', shortLabel: '90 j' },
    { value: 365, label: '12 derniers mois', shortLabel: '1 an' },
];

/**
 * Descriptif de chaque figure.
 *
 * `cle` correspond au nom accepté par /api/admin/analytics/chart/{nom}, et
 * `donnees` au champ de l'aperçu qui porte les mêmes valeurs sous forme de
 * tableau. Les deux vont toujours ensemble : un graphique rendu côté serveur
 * ne se survole pas, le tableau est donc le seul moyen de lire une valeur
 * exacte — et le seul lisible par un lecteur d'écran.
 */
const FIGURES = [
    {
        cle: 'trafic',
        titre: 'Trafic quotidien',
        legende: 'Pages vues et visiteurs uniques, jour par jour.',
        donnees: null,
        large: true,
    },
    {
        cle: 'heures',
        titre: "Heures d'affluence",
        legende: 'Répartition des visites par jour de semaine et par heure.',
        donnees: null,
        large: true,
    },
    {
        cle: 'pages',
        titre: 'Pages les plus vues',
        legende: 'Hors panneau d’administration.',
        donnees: 'pages',
    },
    {
        cle: 'sources',
        titre: 'Sources de trafic',
        legende: 'Domaine d’où provient la visite.',
        donnees: 'sources',
    },
    {
        cle: 'technologies',
        titre: 'Navigateurs et systèmes',
        legende: 'Deux répartitions indépendantes, à ne pas comparer entre elles.',
        donnees: null,
    },
    {
        cle: 'ecrans',
        titre: 'Largeurs d’écran',
        legende: 'Largeur réelle de la fenêtre, collectée depuis les visites récentes.',
        donnees: 'ecrans',
    },
];

function Chiffre({ valeur, libelle, precision }) {
    return (
        <div className="analytics-stat">
            <div className="analytics-stat-value">{valeur}</div>
            <div className="analytics-stat-label">{libelle}</div>
            {precision && <div className="analytics-stat-hint">{precision}</div>}
        </div>
    );
}

function TableauValeurs({ lignes }) {
    if (!lignes || lignes.length === 0) return null;
    const total = lignes.reduce((somme, l) => somme + l.valeur, 0);

    return (
        <table className="analytics-table">
            <thead>
                <tr>
                    <th scope="col">Libellé</th>
                    <th scope="col">Vues</th>
                    <th scope="col">Part</th>
                </tr>
            </thead>
            <tbody>
                {lignes.map((ligne) => (
                    <tr key={ligne.libelle}>
                        <td>{ligne.libelle}</td>
                        <td className="analytics-table-num">{ligne.valeur}</td>
                        <td className="analytics-table-num">
                            {total ? `${Math.round((ligne.valeur / total) * 100)} %` : '—'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/**
 * Une figure : le SVG rendu par le serveur, plus ses valeurs sous forme de
 * tableau dépliable.
 */
function Figure({ figure, urls, apercu, erreurs, chargement }) {
    const [tableauOuvert, setTableauOuvert] = useState(false);
    const lignes = figure.donnees ? apercu?.[figure.donnees] : null;
    const url = urls[figure.cle];
    const erreur = erreurs[figure.cle];

    return (
        <section className={`analytics-card ${figure.large ? 'analytics-card--wide' : ''}`}>
            <header className="analytics-card-head">
                <h3>{figure.titre}</h3>
                <p>{figure.legende}</p>
            </header>

            <div className="analytics-figure">
                {erreur ? (
                    <p className="analytics-figure-error">{erreur}</p>
                ) : url ? (
                    // Le SVG vient de notre propre serveur ; il est affiché via
                    // <img>, qui ne l'exécute pas comme un document.
                    <img src={url} alt={`${figure.titre} — ${figure.legende}`} />
                ) : (
                    <p className="analytics-figure-loading">
                        {chargement ? 'Rendu du graphique…' : 'Aucune donnée'}
                    </p>
                )}
            </div>

            {lignes && lignes.length > 0 && (
                <>
                    <button
                        type="button"
                        className="analytics-table-toggle"
                        onClick={() => setTableauOuvert((ouvert) => !ouvert)}
                        aria-expanded={tableauOuvert}
                    >
                        {tableauOuvert ? 'Masquer les valeurs' : 'Afficher les valeurs'}
                    </button>
                    {tableauOuvert && <TableauValeurs lignes={lignes} />}
                </>
            )}
        </section>
    );
}

export default function AdminAnalytics({ theme = 'light' }) {
    const [jours, setJours] = useState(30);
    const [apercu, setApercu] = useState(null);
    const [urls, setUrls] = useState({});
    const [erreurs, setErreurs] = useState({});
    const [chargement, setChargement] = useState(true);
    const [erreurGlobale, setErreurGlobale] = useState(null);

    // Les URLs blob doivent être révoquées à la main : sans cela, chaque
    // changement de période ou de thème abandonne six images en mémoire.
    const urlsRef = useRef({});
    const libererUrls = useCallback(() => {
        Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
        urlsRef.current = {};
    }, []);

    useEffect(() => {
        // AbortController : si la période change pendant un rendu, la réponse
        // de la requête précédente ne doit pas écraser la nouvelle.
        const controleur = new AbortController();
        let monte = true;

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
                FIGURES.map((figure) =>
                    fetchAnalyticsChart(figure.cle, {
                        days: jours,
                        theme,
                        signal: controleur.signal,
                    })
                )
            );

            if (!monte) {
                resultats.forEach((r) => {
                    if (r.status === 'fulfilled') URL.revokeObjectURL(r.value);
                });
                return;
            }

            libererUrls();
            const nouvellesUrls = {};
            const nouvellesErreurs = {};
            resultats.forEach((resultat, index) => {
                const cle = FIGURES[index].cle;
                if (resultat.status === 'fulfilled') {
                    nouvellesUrls[cle] = resultat.value;
                } else if (resultat.reason?.name !== 'AbortError') {
                    nouvellesErreurs[cle] = resultat.reason?.message || 'Rendu impossible';
                }
            });

            urlsRef.current = nouvellesUrls;
            setUrls(nouvellesUrls);
            setErreurs(nouvellesErreurs);
            setChargement(false);
        }

        charger();

        return () => {
            monte = false;
            controleur.abort();
        };
    }, [jours, theme, libererUrls]);

    // Libération finale au démontage du composant.
    useEffect(() => libererUrls, [libererUrls]);

    const totaux = apercu?.totaux;

    const evenements = useMemo(() => apercu?.evenements || [], [apercu]);

    return (
        <div className="analytics-view">
            <div className="analytics-toolbar">
                <div>
                    <h2 className="analytics-title">Analytics</h2>
                    <p className="analytics-subtitle">
                        Fréquentation du portfolio. Les pages du panneau d’administration
                        sont exclues des compteurs de visiteurs — elles ne sont visitées
                        que par vous.
                    </p>
                </div>
                <CustomDropdown
                    value={jours}
                    options={PERIODES}
                    onChange={(valeur) => setJours(Number(valeur))}
                    prefix="Période : "
                    align="right"
                />
            </div>

            {erreurGlobale && (
                <div className="analytics-alert">
                    Chiffres indisponibles : {erreurGlobale}
                </div>
            )}

            <div className="analytics-stats">
                <Chiffre
                    valeur={totaux ? totaux.pages_vues : '…'}
                    libelle="Pages vues"
                    precision={totaux ? `${totaux.moyenne_par_jour} / jour en moyenne` : null}
                />
                <Chiffre
                    valeur={totaux ? totaux.visiteurs_uniques : '…'}
                    libelle="Visiteurs uniques"
                    precision={totaux ? `${totaux.pages_par_visiteur} pages par visiteur` : null}
                />
                <Chiffre
                    valeur={totaux ? totaux.telechargements_cv : '…'}
                    libelle="Téléchargements du CV"
                />
                <Chiffre
                    valeur={totaux ? totaux.vues_admin : '…'}
                    libelle="Vues du panneau admin"
                    precision="Exclues des chiffres ci-contre"
                />
            </div>

            <div className="analytics-grid">
                {FIGURES.map((figure) => (
                    <Figure
                        key={figure.cle}
                        figure={figure}
                        urls={urls}
                        apercu={apercu}
                        erreurs={erreurs}
                        chargement={chargement}
                    />
                ))}
            </div>

            {evenements.length > 0 && (
                <section className="analytics-card analytics-card--wide">
                    <header className="analytics-card-head">
                        <h3>Actions des visiteurs</h3>
                        <p>Événements déclenchés depuis le site sur la période.</p>
                    </header>
                    <TableauValeurs lignes={evenements} />
                </section>
            )}
        </div>
    );
}
