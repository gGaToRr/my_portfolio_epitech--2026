import { useState, useCallback, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger, AddSectionItemButton } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { renderIcon } from '../../utils/iconRegistry';
import './Objectives.css';

function Objectives() {
    const { lang } = useLanguage();
    const {
        translations,
        objectives,
        cardStyles,
        openEditDrawer,
        createObjective,
        deleteObjective,
        getFieldColor,
        isEditMode,
    } = useEditableContent();

    const t = translations[lang] || translations.en;
    const objectivesList = objectives[lang] || objectives.en || [];
    const objectivesFr = objectives.fr || [];
    const objectivesEn = objectives.en || [];

    const [active, setActive] = useState(0);
    const count = objectivesList.length || 1;

    const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
    const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [next, prev]);

    const handleEditObjective = (objId) => {
        const itemFr = objectivesFr.find((o) => String(o.id) === String(objId)) || {};
        const itemEn = objectivesEn.find((o) => String(o.id) === String(objId)) || {};
        const customStyle = cardStyles?.[`obj-${objId}`] || {};

        openEditDrawer({
            cardId: objId,
            sectionId: 'objectives',
            sectionLabel: `Section 03 • Objectif ${itemFr.number || objId}`,
            title: `Édition : Objectif ${itemFr.number || objId} — ${itemFr.title || ''}`,
            type: 'objective',
            colors: customStyle,
            fields: [
                { key: 'number', label: 'Numéro (ex: 01, 02)', valueFr: itemFr.number, valueEn: itemEn.number, placeholder: '01' },
                { key: 'iconKey', label: 'Icône SVG Domaine', valueFr: itemFr.iconKey || 'network', valueEn: itemEn.iconKey || 'network' },
                { key: 'title', label: 'Titre de l’objectif', valueFr: itemFr.title, valueEn: itemEn.title, placeholder: 'Réseaux & Infrastructures', color: getFieldColor(`obj-${objId}`, 'title') },
                { key: 'preview', label: 'Sous-titre / Aperçu', valueFr: itemFr.preview, valueEn: itemEn.preview, placeholder: 'Protocoles, supervision…', color: getFieldColor(`obj-${objId}`, 'preview') },
                { key: 'desc', label: 'Description détaillée (Markdown)', type: 'textarea', rows: 3, valueFr: itemFr.desc, valueEn: itemEn.desc, color: getFieldColor(`obj-${objId}`, 'desc') },
                { key: 'items', label: 'Compétences cibles (Tags)', isArray: true, valueFr: itemFr.items || [], valueEn: itemEn.items || [] },
            ],
        });
    };

    const handleAddNewObjective = () => {
        const nextNum = String(objectivesFr.length + 1).padStart(2, '0');
        createObjective(
            {
                number: nextNum,
                title: 'Nouvel Objectif',
                preview: 'Aperçu du nouvel objectif',
                desc: 'Description détaillée du nouvel objectif.',
                items: ['Compétence 1', 'Compétence 2'],
                iconKey: 'network',
            },
            {
                number: nextNum,
                title: 'New Objective',
                preview: 'Preview of the new objective',
                desc: 'Detailed description of the new objective.',
                items: ['Skill 1', 'Skill 2'],
                iconKey: 'network',
            }
        );
    };

    return (
        <section id="objectives">
            <ScrollReveal animation="fade-up">
                <div className="section-head">
                    <span className="section-subtitle">{t.objectives.subtitle}</span>
                    <h2 className="section-title">{t.objectives.title}</h2>
                    {isEditMode && (
                        <AddSectionItemButton
                            onClick={handleAddNewObjective}
                            label="+ Ajouter un objectif"
                        />
                    )}
                </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={120} className="obj-container">
                <div className="obj-carousel-viewport">
                    <div className="obj-carousel-stage">
                        {objectivesList.map((obj, i) => {
                            let diff = i - active;
                            if (diff > count / 2) diff -= count;
                            if (diff < -count / 2) diff += count;
                            const abs = Math.abs(diff);
                            const isVisible = abs <= 1;
                            const isActive = diff === 0;
                            const customStyle = cardStyles?.[`obj-${obj.id}`] || {};

                            const style = {
                                transform: `translate(-50%, -50%) translateX(${diff * 60}%) scale(${1 - abs * 0.12})`,
                                opacity: isVisible ? (isActive ? 1 : 0.45) : 0,
                                zIndex: 10 - abs,
                                pointerEvents: isVisible ? 'auto' : 'none',
                                filter: isActive ? 'none' : 'blur(1px)',
                                ...(customStyle.accentColor ? { '--obj-accent': customStyle.accentColor } : {}),
                            };

                            return (
                                <article
                                    key={obj.id}
                                    className={`obj-card ${isActive ? 'is-active' : 'is-inactive'}`}
                                    style={style}
                                    aria-hidden={!isActive}
                                    onClick={() => !isActive && setActive(i)}
                                >
                                    {isEditMode && isActive && (
                                        <EditCardTrigger
                                            onClick={() => handleEditObjective(obj.id)}
                                            onDelete={() => deleteObjective(obj.id)}
                                            label={`Éditer Obj ${obj.number}`}
                                            deleteLabel="Supprimer cet objectif"
                                        />
                                    )}

                                    <div className="obj-card-content">
                                        <div className="obj-card-top">
                                            <div
                                                className="obj-card-icon-pill"
                                                style={customStyle.accentColor ? { color: customStyle.accentColor, borderColor: customStyle.accentColor } : {}}
                                            >
                                                {renderIcon(obj.iconKey || 'network', { className: 'obj-domain-icon' })}
                                                <span className="obj-card-num">{obj.number}</span>
                                            </div>
                                            <span
                                                className="obj-card-preview"
                                                style={{ color: getFieldColor(`obj-${obj.id}`, 'preview') || undefined }}
                                            >
                                                {obj.preview}
                                            </span>
                                        </div>

                                        <h3
                                            className="obj-card-title"
                                            style={{ color: getFieldColor(`obj-${obj.id}`, 'title') || undefined }}
                                        >
                                            {obj.title}
                                        </h3>
                                        <p
                                            className="obj-card-desc"
                                            style={{ color: getFieldColor(`obj-${obj.id}`, 'desc') || undefined }}
                                        >
                                            <MarkdownView text={obj.desc} />
                                        </p>

                                        <div className="obj-card-footer">
                                            <div className="obj-card-items">
                                                {(obj.items || []).map((item, j) => {
                                                    const tagColor = getFieldColor(`obj-${obj.id}`, `items-${j}`);
                                                    return (
                                                        <span
                                                            key={j}
                                                            className="obj-card-item"
                                                            style={tagColor ? { color: tagColor, borderColor: tagColor } : {}}
                                                        >
                                                            <MarkdownView text={item} />
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

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
            </ScrollReveal>
        </section>
    );
}

export default Objectives;
