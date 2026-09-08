import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaHome, FaRedo } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../data/translations';
import './NotFound.css';

function NotFound({ isYouTube = false }) {
    const [fallKey, setFallKey] = useState(0);
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;

    const replayAnimation = () => {
        setFallKey((k) => k + 1);
    };

    return (
        <main className="not-found-container">
            <div className="not-found-card">
                {isYouTube && (
                    <div className="not-found-badge">
                        <FaYoutube className="yt-icon" /> {t.notFound.ytBadge}
                    </div>
                )}

                <div
                    key={fallKey}
                    className="not-found-digits"
                    onClick={replayAnimation}
                    title={t.notFound.btnReplay}
                >
                    <span className="digit digit-stable">4</span>
                    <span className="digit digit-zero">0</span>
                    <span className="digit digit-falling">4</span>
                </div>

                <div className="not-found-ground" />

                <h1 className="not-found-title">
                    {isYouTube ? t.notFound.ytTitle : t.notFound.notFoundTitle}
                </h1>

                <p className="not-found-desc">
                    {isYouTube
                        ? t.notFound.ytDesc
                        : t.notFound.notFoundDesc}
                </p>

                <div className="not-found-actions">
                    <Link to="/" className="btn-not-found btn-not-found--primary">
                        <FaHome /> {t.notFound.btnHome}
                    </Link>
                    <button
                        type="button"
                        onClick={replayAnimation}
                        className="btn-not-found btn-not-found--ghost"
                        title={t.notFound.btnReplay}
                    >
                        <FaRedo /> {t.notFound.btnReplay}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default NotFound;
