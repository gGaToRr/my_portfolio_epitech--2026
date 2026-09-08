import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaHome, FaRedo } from 'react-icons/fa';
import './NotFound.css';

function NotFound({ isYouTube = false }) {
    const [fallKey, setFallKey] = useState(0);

    const replayAnimation = () => {
        setFallKey((k) => k + 1);
    };

    return (
        <main className="not-found-container">
            <div className="not-found-card">
                {isYouTube && (
                    <div className="not-found-badge">
                        <FaYoutube className="yt-icon" /> Chaîne YouTube
                    </div>
                )}

                <div
                    key={fallKey}
                    className="not-found-digits"
                    onClick={replayAnimation}
                    title="Clique pour relancer la chute !"
                >
                    <span className="digit digit-stable">4</span>
                    <span className="digit digit-zero">0</span>
                    <span className="digit digit-falling">4</span>
                </div>

                <div className="not-found-ground" />

                <h1 className="not-found-title">
                    {isYouTube ? 'Bientôt disponible sur YouTube !' : 'Oups ! Page introuvable'}
                </h1>

                <p className="not-found-desc">
                    {isYouTube
                        ? 'La chaîne YouTube est actuellement en cours de préparation (démos de projets, architectures réseaux et tutoriels tech arrivent bientôt !).'
                        : 'Il semble que ce lien soit brisé ou que la page ait été déplacée.'}
                </p>

                <div className="not-found-actions">
                    <Link to="/" className="btn-not-found btn-not-found--primary">
                        <FaHome /> Retour à l'accueil
                    </Link>
                    <button
                        type="button"
                        onClick={replayAnimation}
                        className="btn-not-found btn-not-found--ghost"
                        title="Relancer l'animation"
                    >
                        <FaRedo /> Faire tomber le 4
                    </button>
                </div>
            </div>
        </main>
    );
}

export default NotFound;
