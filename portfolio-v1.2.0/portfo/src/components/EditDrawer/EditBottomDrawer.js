import React, { useState, useEffect, useMemo } from 'react';
import { useEditableContent } from '../../context/EditableContentContext';
import { parseMarkdown } from '../../utils/markdownParser';
import { isSafeUrl } from '../../utils/urlSafety';
import {
    renderIcon,
    AVAILABLE_SKILL_ICONS,
    AVAILABLE_SOCIAL_ICONS,
    AVAILABLE_OBJECTIVE_ICONS,
} from '../../utils/iconRegistry';
import './EditBottomDrawer.css';

const PRESET_COLORS = [
    { label: 'Cyan Accent', value: '#00f2fe' },
    { label: 'Bleu Intense', value: '#3b82f6' },
    { label: 'Émeraude', value: '#10b981' },
    { label: 'Pourpre', value: '#8b5cf6' },
    { label: 'Ambre / Or', value: '#f59e0b' },
    { label: 'Rouge Édition', value: '#ef4444' },
    { label: 'Rose Néon', value: '#ec4899' },
    { label: 'Blanc', value: '#ffffff' },
];

function SvgPaletteIcon({ size = 16, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <circle cx="13.5" cy="6.5" r=".7" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".7" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".7" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".7" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
    );
}

function SvgTrashIcon({ size = 14 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
}

function SvgPlusIcon({ size = 14 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

// Composant Sélecteur de Couleur Inline avec bouton SVG Palette
function FieldColorButton({ fieldKey, color, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const activeColor = color || '';

    return (
        <div className="field-color-picker-root">
            <button
                type="button"
                className={`btn-field-palette ${activeColor ? 'has-custom-color' : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                title={activeColor ? `Couleur personnalisée : ${activeColor}` : 'Choisir la couleur de cet élément'}
                aria-label={`Couleur pour ${fieldKey}`}
            >
                <SvgPaletteIcon size={14} />
                {activeColor && <span className="palette-active-dot" style={{ background: activeColor }} />}
            </button>

            {isOpen && (
                <div className="field-color-popover">
                    <div className="popover-header">
                        <span className="popover-title">Couleur du champ</span>
                        <button
                            type="button"
                            className="popover-close"
                            onClick={() => setIsOpen(false)}
                            title="Fermer"
                        >
                            ×
                        </button>
                    </div>

                    <div className="popover-picker-row">
                        <input
                            type="color"
                            value={activeColor || '#00f2fe'}
                            onChange={(e) => onChange(fieldKey, e.target.value)}
                            className="popover-native-color"
                        />
                        <input
                            type="text"
                            value={activeColor}
                            onChange={(e) => onChange(fieldKey, e.target.value)}
                            placeholder="#00f2fe"
                            className="popover-hex-input"
                        />
                    </div>

                    <div className="popover-swatches">
                        {PRESET_COLORS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                className="popover-swatch-chip"
                                style={{ background: p.value }}
                                onClick={() => onChange(fieldKey, p.value)}
                                title={p.label}
                            />
                        ))}
                    </div>

                    {activeColor && (
                        <button
                            type="button"
                            className="popover-reset-btn"
                            onClick={() => {
                                onChange(fieldKey, '');
                                setIsOpen(false);
                            }}
                        >
                            Rétablir par défaut
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function EditBottomDrawer() {
    const {
        activeEditTarget,
        isClosingDrawer,
        closeEditDrawer,
        updateTranslationFields,
        updateObjective,
        updateFormation,
        updateJob,
        updateProject,
        updateEpitechProject,
        updateSkills,
        updateSocials,
        updateAsset,
        skills: currentSkills,
        socials: currentSocials,
    } = useEditableContent();

    const [activeLangTab, setActiveLangTab] = useState('fr'); // 'fr' | 'en'
    const [formDataFr, setFormDataFr] = useState({});
    const [formDataEn, setFormDataEn] = useState({});
    const [fieldColors, setFieldColors] = useState({});
    const [cardAccentColor, setCardAccentColor] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    // Listes spécifiques pour édition Skills / Socials
    const [skillsList, setSkillsList] = useState([]);
    const [socialsList, setSocialsList] = useState([]);

    // Initialisation
    useEffect(() => {
        if (!activeEditTarget) return;

        const initialFr = {};
        const initialEn = {};
        const initialFieldColors = { ...(activeEditTarget.colors?.fieldColors || {}) };

        (activeEditTarget.fields || []).forEach((field) => {
            initialFr[field.key] = field.valueFr != null ? field.valueFr : '';
            initialEn[field.key] = field.valueEn != null ? field.valueEn : '';
            if (field.color) {
                initialFieldColors[field.key] = field.color;
            }
        });

        setFormDataFr(initialFr);
        setFormDataEn(initialEn);
        setFieldColors(initialFieldColors);
        setCardAccentColor(activeEditTarget.colors?.accentColor || '');
        setActiveLangTab('fr');
        setPreviewMode(false);

        if (activeEditTarget.type === 'skills') {
            setSkillsList(JSON.parse(JSON.stringify(activeEditTarget.skillsData || currentSkills || [])));
        } else if (activeEditTarget.type === 'socials') {
            setSocialsList(JSON.parse(JSON.stringify(activeEditTarget.socialsData || currentSocials || [])));
        }
    }, [activeEditTarget, currentSkills, currentSocials]);

    // Validation bilingue obligatoire
    const isEnglishValid = useMemo(() => {
        if (!activeEditTarget) return true;

        if (activeEditTarget.type === 'skills') {
            for (const sk of skillsList) {
                if (sk.nameFr && (!sk.nameEn || !sk.nameEn.trim())) return false;
                if (sk.categoryFr && (!sk.categoryEn || !sk.categoryEn.trim())) return false;
            }
            return true;
        }

        if (activeEditTarget.type === 'socials') {
            for (const soc of socialsList) {
                if (!soc.name || !soc.name.trim() || !soc.url || !soc.url.trim()) return false;
            }
            return true;
        }

        if (!activeEditTarget.fields) return true;

        for (const field of activeEditTarget.fields) {
            // Ignorer la validation bilingue pour les champs d'images et urls simples
            if (field.type === 'image' || field.type === 'url' || field.key === 'iconKey') continue;

            const valFr = formDataFr[field.key];
            const valEn = formDataEn[field.key];

            if (Array.isArray(valFr)) {
                if (valFr.length > 0 && (!Array.isArray(valEn) || valEn.length === 0)) {
                    return false;
                }
            } else if (typeof valFr === 'string' && valFr.trim().length > 0) {
                if (!valEn || typeof valEn !== 'string' || valEn.trim().length === 0) {
                    return false;
                }
            }
        }
        return true;
    }, [activeEditTarget, formDataFr, formDataEn, skillsList, socialsList]);

    // Un lien "javascript:" ou "data:" saisi ici se retrouve tel quel dans un
    // href côté public : on bloque la sauvegarde plutôt que de filtrer en
    // silence, pour que la personne qui édite voie tout de suite le problème.
    // Couvre à la fois la liste "socials" et tout champ générique type: 'url'
    // (ex. le lien de repo des projets Epitech).
    const hasUnsafeSocialUrl = useMemo(() => {
        if (!activeEditTarget) return false;
        if (activeEditTarget.type === 'socials') {
            return socialsList.some((soc) => soc.url && soc.url.trim() && !isSafeUrl(soc.url));
        }
        return (activeEditTarget.fields || []).some((field) => {
            if (field.type !== 'url') return false;
            const valFr = formDataFr[field.key];
            const valEn = formDataEn[field.key];
            const filled = (v) => typeof v === 'string' && v.trim();
            return (filled(valFr) && !isSafeUrl(valFr)) || (filled(valEn) && !isSafeUrl(valEn));
        });
    }, [activeEditTarget, socialsList, formDataFr, formDataEn]);

    if (!activeEditTarget) return null;

    const handleFieldChange = (lang, key, value) => {
        if (lang === 'fr') {
            setFormDataFr((prev) => ({ ...prev, [key]: value }));
        } else {
            setFormDataEn((prev) => ({ ...prev, [key]: value }));
        }
    };

    const handleFieldColorChange = (key, newColor) => {
        setFieldColors((prev) => ({
            ...prev,
            [key]: newColor,
        }));
    };

    const handleArrayItemChange = (lang, fieldKey, index, value) => {
        const currentList = lang === 'fr' ? (formDataFr[fieldKey] || []) : (formDataEn[fieldKey] || []);
        const nextList = [...currentList];
        nextList[index] = value;
        handleFieldChange(lang, fieldKey, nextList);
    };

    const handleAddArrayItem = (fieldKey) => {
        setFormDataFr((prev) => ({
            ...prev,
            [fieldKey]: [...(prev[fieldKey] || []), 'Nouveau tag'],
        }));
        setFormDataEn((prev) => ({
            ...prev,
            [fieldKey]: [...(prev[fieldKey] || []), 'New tag'],
        }));
    };

    const handleRemoveArrayItem = (fieldKey, index) => {
        setFormDataFr((prev) => ({
            ...prev,
            [fieldKey]: (prev[fieldKey] || []).filter((_, i) => i !== index),
        }));
        setFormDataEn((prev) => ({
            ...prev,
            [fieldKey]: (prev[fieldKey] || []).filter((_, i) => i !== index),
        }));
    };

    // Gestion du téléversement d'image locale (Convertit en data URL)
    const handleImageUpload = (fieldKey, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            handleFieldChange('fr', fieldKey, dataUrl);
            handleFieldChange('en', fieldKey, dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Skills CRUD dans le Drawer
    const handleAddSkillItem = () => {
        const defaultIcon = AVAILABLE_SKILL_ICONS[0];
        setSkillsList((prev) => [
            ...prev,
            {
                id: `sk-${Date.now()}`,
                nameFr: 'Nouvelle Techno',
                nameEn: 'New Tech',
                categoryFr: 'Dev',
                categoryEn: 'Dev',
                iconKey: defaultIcon.key,
                color: defaultIcon.defaultColor,
            },
        ]);
    };

    const handleRemoveSkillItem = (id) => {
        setSkillsList((prev) => prev.filter((s) => s.id !== id));
    };

    const handleSkillItemChange = (id, key, value) => {
        setSkillsList((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
        );
    };

    // Socials CRUD dans le Drawer
    const handleAddSocialItem = () => {
        const defaultIcon = AVAILABLE_SOCIAL_ICONS[0];
        setSocialsList((prev) => [
            ...prev,
            {
                id: `soc-${Date.now()}`,
                name: 'Nouveau lien',
                url: 'https://',
                iconKey: defaultIcon.key,
                color: defaultIcon.defaultColor,
            },
        ]);
    };

    const handleRemoveSocialItem = (id) => {
        setSocialsList((prev) => prev.filter((s) => s.id !== id));
    };

    const handleSocialItemChange = (id, key, value) => {
        setSocialsList((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
        );
    };

    // Sauvegarde CRUD
    const handleSave = (e) => {
        e.preventDefault();
        if (!isEnglishValid || hasUnsafeSocialUrl) return;

        const { type, sectionId, cardId, customSaveHandler } = activeEditTarget;
        const stylePayload = { accentColor: cardAccentColor };

        if (customSaveHandler) {
            customSaveHandler(formDataFr, formDataEn, stylePayload, fieldColors);
        } else if (type === 'skills') {
            updateSkills(skillsList);
        } else if (type === 'socials') {
            updateSocials(socialsList);
        } else if (type === 'translation') {
            const updates = {};
            Object.keys(formDataFr).forEach((k) => {
                updates[k] = { fr: formDataFr[k], en: formDataEn[k] };
            });

            // Si c'est un asset photo
            if (formDataFr.profilePhoto) updateAsset('profilePhoto', formDataFr.profilePhoto);
            if (formDataFr.setupPhoto) updateAsset('setupPhoto', formDataFr.setupPhoto);

            updateTranslationFields(sectionId, updates, stylePayload, fieldColors);
        } else if (type === 'objective') {
            updateObjective(cardId, formDataFr, formDataEn, stylePayload, fieldColors);
        } else if (type === 'formation') {
            updateFormation(cardId, formDataFr, formDataEn, stylePayload, fieldColors);
        } else if (type === 'job') {
            updateJob(cardId, formDataFr, formDataEn, stylePayload, fieldColors);
        } else if (type === 'project') {
            updateProject(cardId, formDataFr, formDataEn, stylePayload, fieldColors);
        } else if (type === 'epitechProject') {
            updateEpitechProject(cardId, formDataFr, formDataEn, stylePayload, fieldColors);
        }

        closeEditDrawer();
    };

    return (
        <div className={`edit-drawer-overlay ${isClosingDrawer ? 'is-closing' : 'is-opening'}`}>
            <div
                className="edit-drawer-backdrop"
                onClick={closeEditDrawer}
                title="Cliquer pour fermer"
            />

            <aside
                className={`edit-drawer-sheet ${isClosingDrawer ? 'is-closing' : 'is-opening'}`}
                role="dialog"
                aria-label={`Édition : ${activeEditTarget.title}`}
            >
                <div className="edit-drawer-handle-bar" onClick={closeEditDrawer}>
                    <div className="edit-drawer-handle" />
                </div>

                <header className="edit-drawer-header">
                    <div className="edit-drawer-header__info">
                        <div className="edit-drawer-badge">
                            <span className="badge-dot" />
                            <span>{activeEditTarget.sectionLabel || 'Section'}</span>
                        </div>
                        <h3 className="edit-drawer-title">{activeEditTarget.title}</h3>
                    </div>

                    <div className="edit-drawer-header__actions">
                        {activeEditTarget.type !== 'socials' && (
                            <div className="edit-drawer-lang-pills">
                                <button
                                    type="button"
                                    className={`lang-pill-btn ${activeLangTab === 'fr' ? 'is-active' : ''}`}
                                    onClick={() => setActiveLangTab('fr')}
                                >
                                    <span>FR (Français)</span>
                                </button>
                                <button
                                    type="button"
                                    className={`lang-pill-btn ${activeLangTab === 'en' ? 'is-active' : ''} ${!isEnglishValid ? 'is-warning' : 'is-complete'}`}
                                    onClick={() => setActiveLangTab('en')}
                                >
                                    <span>EN (Anglais)</span>
                                    {!isEnglishValid ? (
                                        <span className="lang-req-pill" title="Traduction requise">Requis</span>
                                    ) : (
                                        <span className="lang-ok-pill">✓</span>
                                    )}
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            className="edit-drawer-close-btn"
                            onClick={closeEditDrawer}
                            title="Fermer le volet d'édition"
                            aria-label="Fermer"
                        >
                            ×
                        </button>
                    </div>
                </header>

                {!isEnglishValid && (
                    <div className="edit-drawer-alert edit-drawer-alert--warning">
                        <span className="alert-icon">⚠️</span>
                        <span>
                            <strong>Traduction anglaise requise :</strong> Pour sauvegarder, veuillez remplir les équivalents en anglais dans l'onglet <strong>EN (Anglais)</strong>.
                        </span>
                    </div>
                )}

                {hasUnsafeSocialUrl && (
                    <div className="edit-drawer-alert edit-drawer-alert--warning">
                        <span className="alert-icon">⚠️</span>
                        <span>
                            <strong>Lien non autorisé :</strong> seules les URL en <code>http(s)://</code>, <code>mailto:</code>, <code>tel:</code> ou internes (<code>/...</code>) sont acceptées.
                        </span>
                    </div>
                )}

                <form className="edit-drawer-body" onSubmit={handleSave}>
                    {/* Bascule Markdown (uniquement pour les champs texte) */}
                    {activeEditTarget.type !== 'skills' && activeEditTarget.type !== 'socials' && (
                        <div className="edit-drawer-preview-toggle">
                            <button
                                type="button"
                                className={`toggle-preview-btn ${previewMode ? 'is-active' : ''}`}
                                onClick={() => setPreviewMode((prev) => !prev)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>{previewMode ? 'Revenir au formulaire' : 'Aperçu Markdown & Couleurs'}</span>
                            </button>
                            <span className="markdown-hint">
                                Supporte <code>**gras**</code>, <code>*italique*</code>, <code>[lien](url)</code> et couleurs individuelles.
                            </span>
                        </div>
                    )}

                    {/* 1. ÉDITION COMPÉTENCES / SVGs */}
                    {activeEditTarget.type === 'skills' ? (
                        <div className="edit-skills-manager">
                            <div className="edit-field-header">
                                <label className="edit-field-label">
                                    <span>Liste des compétences & Icônes SVG</span>
                                    <span className="field-lang-badge">{activeLangTab.toUpperCase()}</span>
                                </label>
                                <button
                                    type="button"
                                    className="btn-add-item"
                                    onClick={handleAddSkillItem}
                                >
                                    <SvgPlusIcon /> Ajouter une compétence SVG
                                </button>
                            </div>

                            <div className="skills-edit-cards-list">
                                {skillsList.map((sk) => (
                                    <div key={sk.id} className="skill-edit-row">
                                        <div className="skill-edit-icon-box" style={{ color: sk.color || '#00f2fe' }}>
                                            {renderIcon(sk.iconKey, { size: 24 })}
                                        </div>

                                        <div className="skill-edit-inputs">
                                            <div className="skill-edit-field-row">
                                                <div className="skill-input-wrap">
                                                    <label>Nom {activeLangTab.toUpperCase()} :</label>
                                                    <input
                                                        type="text"
                                                        value={activeLangTab === 'fr' ? sk.nameFr : sk.nameEn}
                                                        onChange={(e) =>
                                                            handleSkillItemChange(
                                                                sk.id,
                                                                activeLangTab === 'fr' ? 'nameFr' : 'nameEn',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={activeLangTab === 'fr' ? 'Nom FR' : 'Name EN'}
                                                        className="edit-field-input"
                                                    />
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--cat">
                                                    <label>Catégorie :</label>
                                                    <input
                                                        type="text"
                                                        value={activeLangTab === 'fr' ? sk.categoryFr : sk.categoryEn}
                                                        onChange={(e) =>
                                                            handleSkillItemChange(
                                                                sk.id,
                                                                activeLangTab === 'fr' ? 'categoryFr' : 'categoryEn',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Dev, Infra…"
                                                        className="edit-field-input"
                                                    />
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--icon">
                                                    <label>Icône SVG :</label>
                                                    <select
                                                        value={sk.iconKey}
                                                        onChange={(e) => {
                                                            const chosen = AVAILABLE_SKILL_ICONS.find((i) => i.key === e.target.value);
                                                            handleSkillItemChange(sk.id, 'iconKey', e.target.value);
                                                            if (chosen && !sk.color) {
                                                                handleSkillItemChange(sk.id, 'color', chosen.defaultColor);
                                                            }
                                                        }}
                                                        className="edit-field-select"
                                                    >
                                                        {AVAILABLE_SKILL_ICONS.map((opt) => (
                                                            <option key={opt.key} value={opt.key}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--color">
                                                    <label>Couleur :</label>
                                                    <div className="skill-color-flex">
                                                        <FieldColorButton
                                                            fieldKey={`sk-color-${sk.id}`}
                                                            color={sk.color}
                                                            onChange={(_, newCol) => handleSkillItemChange(sk.id, 'color', newCol)}
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-trash-item"
                                                    onClick={() => handleRemoveSkillItem(sk.id)}
                                                    title="Supprimer cette compétence SVG"
                                                >
                                                    <SvgTrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeEditTarget.type === 'socials' ? (
                        /* 2. ÉDITION RÉSEAUX SOCIAUX / SVGs */
                        <div className="edit-socials-manager">
                            <div className="edit-field-header">
                                <label className="edit-field-label">
                                    <span>Liens & Icônes Réseaux Sociaux</span>
                                </label>
                                <button
                                    type="button"
                                    className="btn-add-item"
                                    onClick={handleAddSocialItem}
                                >
                                    <SvgPlusIcon /> Ajouter un réseau SVG
                                </button>
                            </div>

                            <div className="socials-edit-cards-list">
                                {socialsList.map((soc) => (
                                    <div key={soc.id} className="social-edit-row">
                                        <div className="social-edit-icon-box" style={{ color: soc.color || '#3b82f6' }}>
                                            {renderIcon(soc.iconKey, { size: 24 })}
                                        </div>

                                        <div className="social-edit-inputs">
                                            <div className="skill-edit-field-row">
                                                <div className="skill-input-wrap">
                                                    <label>Nom / Titre :</label>
                                                    <input
                                                        type="text"
                                                        value={soc.name}
                                                        onChange={(e) => handleSocialItemChange(soc.id, 'name', e.target.value)}
                                                        placeholder="GitHub, LinkedIn…"
                                                        className="edit-field-input"
                                                    />
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--url">
                                                    <label>URL / Lien :</label>
                                                    <input
                                                        type="text"
                                                        value={soc.url}
                                                        onChange={(e) => handleSocialItemChange(soc.id, 'url', e.target.value)}
                                                        placeholder="https://..."
                                                        className="edit-field-input"
                                                    />
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--icon">
                                                    <label>Icône SVG :</label>
                                                    <select
                                                        value={soc.iconKey}
                                                        onChange={(e) => {
                                                            const chosen = AVAILABLE_SOCIAL_ICONS.find((i) => i.key === e.target.value);
                                                            handleSocialItemChange(soc.id, 'iconKey', e.target.value);
                                                            if (chosen && !soc.color) {
                                                                handleSocialItemChange(soc.id, 'color', chosen.defaultColor);
                                                            }
                                                        }}
                                                        className="edit-field-select"
                                                    >
                                                        {AVAILABLE_SOCIAL_ICONS.map((opt) => (
                                                            <option key={opt.key} value={opt.key}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="skill-input-wrap skill-input-wrap--color">
                                                    <label>Couleur :</label>
                                                    <FieldColorButton
                                                        fieldKey={`soc-color-${soc.id}`}
                                                        color={soc.color}
                                                        onChange={(_, newCol) => handleSocialItemChange(soc.id, 'color', newCol)}
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-trash-item"
                                                    onClick={() => handleRemoveSocialItem(soc.id)}
                                                    title="Supprimer ce réseau"
                                                >
                                                    <SvgTrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* 3. FORMULAIRE STANDARD AVEC PALETTE SVG PAR CHAMP */
                        <div className="edit-drawer-fields-grid">
                            {(activeEditTarget.fields || []).map((field) => {
                                const valFr = formDataFr[field.key];
                                const valEn = formDataEn[field.key];
                                const activeVal = activeLangTab === 'fr' ? valFr : valEn;
                                const customCol = fieldColors[field.key];

                                // MODE APERÇU
                                if (previewMode) {
                                    return (
                                        <div key={field.key} className="edit-field-group edit-field-group--preview">
                                            <label className="edit-field-label">
                                                <span>{field.label}</span>
                                                <span className="field-lang-badge">{activeLangTab.toUpperCase()}</span>
                                            </label>
                                            <div className="edit-field-preview-box" style={customCol ? { color: customCol } : {}}>
                                                {field.type === 'image' ? (
                                                    <img src={activeVal} alt="Aperçu" className="preview-image-thumb" />
                                                ) : Array.isArray(activeVal) ? (
                                                    <div className="preview-tags-row">
                                                        {activeVal.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="preview-tag"
                                                                style={fieldColors[`${field.key}-${idx}`] ? { color: fieldColors[`${field.key}-${idx}`], borderColor: fieldColors[`${field.key}-${idx}`] } : {}}
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    parseMarkdown(activeVal || '(Vide)')
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                // 3.1 CHAMP IMAGE / PHOTO
                                if (field.type === 'image') {
                                    return (
                                        <div key={field.key} className="edit-field-group edit-field-group--image">
                                            <label className="edit-field-label">
                                                <span>{field.label}</span>
                                                <span className="field-lang-badge">PHOTO / ASSET</span>
                                            </label>

                                            <div className="image-edit-container">
                                                <div className="image-edit-preview-wrap">
                                                    {activeVal ? (
                                                        <img src={activeVal} alt={field.label} className="image-edit-preview" />
                                                    ) : (
                                                        <div className="image-edit-placeholder">Pas d'image</div>
                                                    )}
                                                </div>

                                                <div className="image-edit-controls">
                                                    <div className="image-url-row">
                                                        <input
                                                            type="text"
                                                            value={activeVal || ''}
                                                            onChange={(e) => {
                                                                handleFieldChange('fr', field.key, e.target.value);
                                                                handleFieldChange('en', field.key, e.target.value);
                                                            }}
                                                            placeholder="URL de l'image (https://... ou data:...)"
                                                            className="edit-field-input"
                                                        />
                                                    </div>

                                                    <div className="image-upload-row">
                                                        <label className="btn-upload-file">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                            <span>Choisir une image depuis l'ordinateur</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(field.key, e.target.files[0])}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // 3.2 SÉLECTEUR D'ICÔNE SVG DOMAINE (pour Objectifs)
                                if (field.key === 'iconKey') {
                                    return (
                                        <div key={field.key} className="edit-field-group">
                                            <div className="edit-field-header">
                                                <label className="edit-field-label">
                                                    <span>{field.label}</span>
                                                    <span className="field-lang-badge">SVG DOMAINE</span>
                                                </label>
                                            </div>

                                            <div className="objective-icon-select-row">
                                                <div className="icon-preview-badge">
                                                    {renderIcon(activeVal, { size: 22 })}
                                                </div>
                                                <select
                                                    value={activeVal || 'network'}
                                                    onChange={(e) => {
                                                        handleFieldChange('fr', field.key, e.target.value);
                                                        handleFieldChange('en', field.key, e.target.value);
                                                    }}
                                                    className="edit-field-select"
                                                >
                                                    {AVAILABLE_OBJECTIVE_ICONS.map((item) => (
                                                        <option key={item.key} value={item.key}>
                                                            {item.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                // 3.3 TABLEAU DYNAMIQUE (TAGS / STACK) AVEC PALETTE SVG PAR TAG
                                if (field.isArray) {
                                    const list = Array.isArray(activeVal) ? activeVal : [];

                                    return (
                                        <div key={field.key} className="edit-field-group edit-field-group--array">
                                            <div className="edit-field-header">
                                                <div className="edit-label-with-palette">
                                                    <label className="edit-field-label">
                                                        <span>{field.label}</span>
                                                        <span className="field-lang-badge">{activeLangTab.toUpperCase()}</span>
                                                    </label>
                                                    <FieldColorButton
                                                        fieldKey={field.key}
                                                        color={customCol}
                                                        onChange={handleFieldColorChange}
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-add-item"
                                                    onClick={() => handleAddArrayItem(field.key)}
                                                >
                                                    <SvgPlusIcon /> Ajouter un tag
                                                </button>
                                            </div>

                                            <div className="edit-array-items-list">
                                                {list.map((item, idx) => {
                                                    const tagColorKey = `${field.key}-${idx}`;
                                                    const tagCol = fieldColors[tagColorKey];

                                                    return (
                                                        <div key={idx} className="edit-array-item-row">
                                                            <input
                                                                type="text"
                                                                value={item}
                                                                onChange={(e) =>
                                                                    handleArrayItemChange(
                                                                        activeLangTab,
                                                                        field.key,
                                                                        idx,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="edit-field-input"
                                                                style={tagCol ? { color: tagCol, borderColor: tagCol } : {}}
                                                                placeholder={`Tag #${idx + 1}`}
                                                            />

                                                            {/* SVG Palette pour ce tag précis */}
                                                            <FieldColorButton
                                                                fieldKey={tagColorKey}
                                                                color={tagCol}
                                                                onChange={handleFieldColorChange}
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn-trash-item"
                                                                onClick={() => handleRemoveArrayItem(field.key, idx)}
                                                                title="Supprimer ce tag"
                                                            >
                                                                <SvgTrashIcon />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {list.length === 0 && (
                                                    <p className="edit-empty-hint">Aucun tag pour le moment.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                // 3.4 TEXTAREA (MULTI-LIGNES AVEC PALETTE SVG)
                                if (field.type === 'textarea') {
                                    return (
                                        <div key={field.key} className="edit-field-group">
                                            <div className="edit-field-header">
                                                <div className="edit-label-with-palette">
                                                    <label className="edit-field-label">
                                                        <span>{field.label}</span>
                                                        <span className="field-lang-badge">{activeLangTab.toUpperCase()}</span>
                                                    </label>
                                                    <FieldColorButton
                                                        fieldKey={field.key}
                                                        color={customCol}
                                                        onChange={handleFieldColorChange}
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                rows={field.rows || 4}
                                                value={activeVal || ''}
                                                onChange={(e) =>
                                                    handleFieldChange(activeLangTab, field.key, e.target.value)
                                                }
                                                className="edit-field-textarea"
                                                style={customCol ? { color: customCol } : {}}
                                                placeholder={field.placeholder || `Saisissez ${field.label}…`}
                                            />
                                        </div>
                                    );
                                }

                                // 3.5 CHAMP TEXTE STANDARD (AVEC PALETTE SVG)
                                return (
                                    <div key={field.key} className="edit-field-group">
                                        <div className="edit-field-header">
                                            <div className="edit-label-with-palette">
                                                <label className="edit-field-label">
                                                    <span>{field.label}</span>
                                                    <span className="field-lang-badge">{activeLangTab.toUpperCase()}</span>
                                                </label>
                                                <FieldColorButton
                                                    fieldKey={field.key}
                                                    color={customCol}
                                                    onChange={handleFieldColorChange}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type={field.type === 'url' ? 'url' : 'text'}
                                            value={activeVal || ''}
                                            onChange={(e) =>
                                                handleFieldChange(activeLangTab, field.key, e.target.value)
                                            }
                                            className="edit-field-input"
                                            style={customCol ? { color: customCol } : {}}
                                            placeholder={field.placeholder || `Saisissez ${field.label}…`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Section Couleur d'Accent Globale de la Carte */}
                    <div className="edit-colors-section">
                        <h4 className="edit-colors-title">Couleur d'accent globale de la carte</h4>
                        <div className="edit-colors-row">
                            <div className="color-field-box">
                                <label>Accent :</label>
                                <div className="color-picker-wrap">
                                    <input
                                        type="color"
                                        value={cardAccentColor || '#00f2fe'}
                                        onChange={(e) => setCardAccentColor(e.target.value)}
                                        className="color-input"
                                    />
                                    <input
                                        type="text"
                                        value={cardAccentColor}
                                        onChange={(e) => setCardAccentColor(e.target.value)}
                                        placeholder="#00f2fe"
                                        className="color-hex-input"
                                    />
                                </div>
                            </div>

                            <div className="color-swatches-wrap">
                                <span className="swatches-label">Palettes rapides :</span>
                                <div className="color-swatches">
                                    {PRESET_COLORS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            className="color-swatch-btn"
                                            style={{ background: preset.value }}
                                            onClick={() => setCardAccentColor(preset.value)}
                                            title={preset.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="edit-drawer-footer">
                        <div className="edit-drawer-footer__left">
                            <button
                                type="button"
                                className="drawer-btn drawer-btn--ghost"
                                onClick={closeEditDrawer}
                            >
                                Annuler
                            </button>
                        </div>

                        <div className="edit-drawer-footer__right">
                            <button
                                type="submit"
                                className={`drawer-btn drawer-btn--save ${(!isEnglishValid || hasUnsafeSocialUrl) ? 'is-disabled' : ''}`}
                                disabled={!isEnglishValid || hasUnsafeSocialUrl}
                                title={
                                    hasUnsafeSocialUrl
                                        ? 'Corrigez le lien non autorisé avant de sauvegarder'
                                        : !isEnglishValid
                                        ? 'Veuillez renseigner la version anglaise (EN) pour sauvegarder'
                                        : 'Enregistrer les modifications'
                                }
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Enregistrer les modifications</span>
                            </button>
                        </div>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
