import { useState, useCallback } from 'react';
import objectives from '../../data/objectives';
import './Objectives.css';

function Objectives() {
    const [active, setActive] = useState(0);
    const count = objectives.length;

    const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
    const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

    return (
        <section id="objectives">
            <h2>My objectives</h2>
            <div className="obj-carousel">
                <div className="obj-carousel-viewport">
                    <div className="obj-carousel-stage">
                        {objectives.map((obj, i) => {
                            let diff = i - active;
                            if (diff > count / 2) diff -= count;
                            if (diff < -count / 2) diff += count;
                            const abs = Math.abs(diff);
                            const visible = abs <= 1;

                            const style = {
                                transform: `translate(-50%, 0) translateX(${diff * 68}%) scale(${1 - abs * 0.15})`,
                                opacity: visible ? 1 - abs * 0.45 : 0,
                                zIndex: 10 - abs,
                                pointerEvents: visible && diff !== 0 ? 'auto' : diff === 0 ? 'auto' : 'none',
                                visibility: visible ? 'visible' : 'hidden',
                            };

                            return (
                                <article
                                    key={obj.id}
                                    className={`obj-card ${diff === 0 ? 'is-active' : ''}`}
                                    style={style}
                                    aria-hidden={diff !== 0}
                                    onClick={() => diff !== 0 && setActive(i)}
                                >
                                    <div className="obj-card-head">
                                        <span className="obj-card-num">{obj.number}</span>
                                        <span className="obj-card-preview">{obj.preview}</span>
                                    </div>
                                    <h3 className="obj-card-title">{obj.title}</h3>
                                    <p className="obj-card-desc">{obj.desc}</p>
                                    <div className="obj-card-items">
                                        {obj.items.map((item, j) => (
                                            <span key={j} className="obj-card-item">{item}</span>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="obj-carousel-actions">
                    <button type="button" className="obj-carousel-btn" onClick={prev} aria-label="Objectif précédent">
                        Prev
                    </button>
                    <div className="obj-carousel-dots">
                        {objectives.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`obj-carousel-dot ${i === active ? 'is-active' : ''}`}
                                onClick={() => setActive(i)}
                                aria-label={`Aller à l'objectif ${i + 1}`}
                            />
                        ))}
                    </div>
                    <button type="button" className="obj-carousel-btn" onClick={next} aria-label="Objectif suivant">
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Objectives;
