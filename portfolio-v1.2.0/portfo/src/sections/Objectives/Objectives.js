import { useState, useCallback, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaNetworkWired, FaCloud, FaBrain, FaTasks } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { getObjectives } from '../../data/objectives';
import translations from '../../data/translations';
import './Objectives.css';

const ICON_MAP = {
    network: FaNetworkWired,
    cloud: FaCloud,
    ai: FaBrain,
    project: FaTasks,
};

function Objectives() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const objectivesList = getObjectives(lang);

    const [active, setActive] = useState(0);
    const count = objectivesList.length;

    const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
    const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

    // Navigation au clavier (flèches gauche / droite)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [next, prev]);

    return (
        <section id="objectives">
            <div className="section-head">
                <span className="section-subtitle">{t.objectives.subtitle}</span>
                <h2 className="section-title">{t.objectives.title}</h2>
            </div>

            <div className="obj-container">
                {/* Carousel 3D de cartes */}
                <div className="obj-carousel-viewport">
                    <div className="obj-carousel-stage">
                        {objectivesList.map((obj, i) => {
                            let diff = i - active;
                            if (diff > count / 2) diff -= count;
                            if (diff < -count / 2) diff += count;
                            const abs = Math.abs(diff);
                            const isVisible = abs <= 1;
                            const isActive = diff === 0;
                            const IconComponent = ICON_MAP[obj.iconKey] || FaNetworkWired;

                            const style = {
                                transform: `translate(-50%, -50%) translateX(${diff * 60}%) scale(${1 - abs * 0.12})`,
                                opacity: isVisible ? (isActive ? 1 : 0.45) : 0,
                                zIndex: 10 - abs,
                                pointerEvents: isVisible ? 'auto' : 'none',
                                filter: isActive ? 'none' : 'blur(1px)',
                            };

                            return (
                                <article
                                    key={obj.id}
                                    className={`obj-card ${isActive ? 'is-active' : 'is-inactive'}`}
                                    style={style}
                                    aria-hidden={!isActive}
                                    onClick={() => !isActive && setActive(i)}
                                >
                                    <div className="obj-card-content">
                                        <div className="obj-card-top">
                                            <div className="obj-card-icon-pill">
                                                <IconComponent className="obj-domain-icon" />
                                                <span className="obj-card-num">{obj.number}</span>
                                            </div>
                                            <span className="obj-card-preview">{obj.preview}</span>
                                        </div>

                                        <h3 className="obj-card-title">{obj.title}</h3>
                                        <p className="obj-card-desc">{obj.desc}</p>

                                        <div className="obj-card-footer">
                                            <div className="obj-card-items">
                                                {obj.items.map((item, j) => (
                                                    <span key={j} className="obj-card-item">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {/* Barre de contrôles et pagination */}
                <div className="obj-controls">
                    <button
                        type="button"
                        className="obj-nav-btn"
                        onClick={prev}
                        aria-label={t.objectives.prevLabel}
                        title={t.objectives.prevLabel}
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="obj-dots-container">
                        {objectivesList.map((obj, i) => (
                            <button
                                key={obj.id}
                                type="button"
                                className={`obj-dot-btn ${i === active ? 'is-active' : ''}`}
                                onClick={() => setActive(i)}
                                aria-label={`${t.objectives.goTo} ${i + 1} : ${obj.title}`}
                            >
                                <span className="obj-dot-label">{obj.number}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="obj-nav-btn"
                        onClick={next}
                        aria-label={t.objectives.nextLabel}
                        title={t.objectives.nextLabel}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Objectives;
