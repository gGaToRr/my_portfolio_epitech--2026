import { FaArrowDown, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import './Hero.css';

function Hero() {
    const { lang } = useLanguage();
    const { translations, cardStyles, openEditDrawer, getFieldColor, isEditMode } = useEditableContent();

    const t = translations[lang] || translations.en;
    const tFr = translations.fr?.hero || {};
    const tEn = translations.en?.hero || {};
    const heroStyles = cardStyles?.hero || {};

    const handleEditHero = () => {
        openEditDrawer({
            cardId: 'hero',
            sectionId: 'hero',
            sectionLabel: 'Section 01 • Hero / Accueil',
            title: 'Édition : Hero & En-tête Principal',
            type: 'translation',
            colors: heroStyles,
            fields: [
                { key: 'eyebrow', label: 'Texte d’introduction (Eyebrow)', valueFr: tFr.eyebrow, valueEn: tEn.eyebrow, placeholder: 'Bonjour, je suis', color: getFieldColor('hero', 'eyebrow') },
                { key: 'name', label: 'Nom & Prénom', valueFr: tFr.name, valueEn: tEn.name, placeholder: 'Pierre Untersinger', color: getFieldColor('hero', 'name') },
                { key: 'taglinePrefix', label: 'Préfixe de fonction', valueFr: tFr.taglinePrefix, valueEn: tEn.taglinePrefix, placeholder: 'Étudiant en Ingénierie logicielle @', color: getFieldColor('hero', 'taglinePrefix') },
                { key: 'school', label: 'Établissement / École', valueFr: tFr.school, valueEn: tEn.school, placeholder: 'Epitech Marseille', color: getFieldColor('hero', 'school') },
                { key: 'description', label: 'Description & Pitch (Markdown)', type: 'textarea', rows: 4, valueFr: tFr.description, valueEn: tEn.description, color: getFieldColor('hero', 'description') },
                { key: 'btnProfile', label: 'Texte bouton 1 (Profil)', valueFr: tFr.btnProfile, valueEn: tEn.btnProfile, placeholder: 'Découvrir mon profil', color: getFieldColor('hero', 'btnProfile') },
                { key: 'btnContact', label: 'Texte bouton 2 (Contact)', valueFr: tFr.btnContact, valueEn: tEn.btnContact, placeholder: 'Me contacter', color: getFieldColor('hero', 'btnContact') },
            ],
        });
    };

    const heroCustomStyle = heroStyles.accentColor ? { '--accent': heroStyles.accentColor } : {};

    return (
        <section id="home" className="hero-section" style={heroCustomStyle}>
            <div className="hero-content">
                {isEditMode && <EditCardTrigger onClick={handleEditHero} label="Modifier le Hero" />}

                <span
                    className="hero-eyebrow"
                    style={{ color: getFieldColor('hero', 'eyebrow') || undefined }}
                >
                    {t.hero.eyebrow}
                </span>

                <h1
                    className="hero-name"
                    style={{ color: getFieldColor('hero', 'name') || heroStyles.accentColor || undefined }}
                >
                    {t.hero.name}
                </h1>

                <p className="hero-tagline">
                    <span style={{ color: getFieldColor('hero', 'taglinePrefix') || undefined }}>
                        {t.hero.taglinePrefix}{' '}
                    </span>
                    <strong style={{ color: getFieldColor('hero', 'school') || undefined }}>
                        {t.hero.school}
                    </strong>
                </p>

                <p
                    className="hero-description"
                    style={{ color: getFieldColor('hero', 'description') || undefined }}
                >
                    <MarkdownView text={t.hero.description} />
                </p>

                <div className="hero-actions">
                    <a
                        href="#who"
                        className="btn-hero btn-hero--primary"
                        style={{
                            color: getFieldColor('hero', 'btnProfile') || undefined,
                            borderColor: getFieldColor('hero', 'btnProfile') || undefined,
                        }}
                    >
                        {t.hero.btnProfile} <FaArrowDown className="btn-icon" />
                    </a>
                    <a
                        href="#contact"
                        className="btn-hero btn-hero--ghost"
                        style={{
                            color: getFieldColor('hero', 'btnContact') || undefined,
                            borderColor: getFieldColor('hero', 'btnContact') || undefined,
                        }}
                    >
                        {t.hero.btnContact} <FaPaperPlane className="btn-icon" />
                    </a>
                </div>
            </div>

            <a href="#who" className="hero-scroll-indicator" aria-label={t.hero.scroll}>
                <div className="mouse-wheel">
                    <span className="mouse-dot" />
                </div>
                <span className="scroll-text">{t.hero.scroll}</span>
            </a>
        </section>
    );
}

export default Hero;
