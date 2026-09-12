import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import { sendContactMessage } from '../../utils/sendContactMessage';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { renderIcon } from '../../utils/iconRegistry';
import { isSafeUrl } from '../../utils/urlSafety';
import './Contact.css';

function getSteps(t) {
    return [
        {
            name: 'name',
            type: 'text',
            placeholder: t.contact.phName,
            required: true,
            question: t.contact.qName,
            maxLength: 80,
        },
        {
            name: 'email',
            type: 'email',
            placeholder: t.contact.phEmail,
            required: true,
            question: t.contact.qEmail,
            maxLength: 120,
        },
        {
            name: 'phone',
            type: 'tel',
            placeholder: t.contact.phPhone,
            required: false,
            question: t.contact.qPhone,
            maxLength: 32,
        },
        {
            name: 'message',
            type: 'textarea',
            placeholder: t.contact.phMessage,
            required: true,
            question: t.contact.qMessage,
            maxLength: 4000,
        },
    ];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.-]{6,32}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function sanitizeInput(raw, maxLength) {
    if (raw == null) return '';
    let v = String(raw).replace(CONTROL_CHARS_RE, '');
    if (maxLength && v.length > maxLength) v = v.slice(0, maxLength);
    return v;
}

function isStepValid(step, value) {
    const v = (value || '').trim();
    if (!step.required && v === '') return true;
    if (v === '') return false;
    if (step.maxLength && v.length > step.maxLength) return false;
    if (step.type === 'email') return EMAIL_RE.test(v) && v.length <= 120;
    if (step.type === 'tel') return PHONE_RE.test(v);
    return true;
}

function Contact() {
    const { lang } = useLanguage();
    const { translations, cardStyles, socials, openEditDrawer, getFieldColor, isEditMode } = useEditableContent();

    const t = translations[lang] || translations.en;
    const tFr = translations.fr?.contact || {};
    const tEn = translations.en?.contact || {};
    const steps = getSteps(t);

    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [stepIndex, setStepIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const currentStep = steps[stepIndex] || steps[0];
    const currentValue = form[currentStep.name];
    const canAdvance = isStepValid(currentStep, currentValue);
    const isLast = stepIndex === steps.length - 1;

    const handleChange = (e) => {
        const step = steps.find((s) => s.name === e.target.name);
        const clean = sanitizeInput(e.target.value, step ? step.maxLength : undefined);
        setForm({ ...form, [e.target.name]: clean });
    };

    const submitForm = async () => {
        setSending(true);
        setError(null);
        try {
            await sendContactMessage(form);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || (lang === 'fr' ? "Une erreur est survenue. Réessayez." : "An error occurred. Please try again."));
        } finally {
            setSending(false);
        }
    };

    const goNext = () => {
        if (!canAdvance || sending) return;
        if (isLast) {
            submitForm();
            return;
        }
        setStepIndex(stepIndex + 1);
    };

    const goPrev = () => {
        if (stepIndex > 0 && !sending) setStepIndex(stepIndex - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        goNext();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && currentStep.type !== 'textarea') {
            e.preventDefault();
            goNext();
        }
    };

    const reset = () => {
        setForm({ name: '', email: '', phone: '', message: '' });
        setStepIndex(0);
        setSubmitted(false);
        setError(null);
    };

    const progress = ((stepIndex + (submitted ? 1 : 0)) / steps.length) * 100;

    // 1. Édition Formulaire
    const handleEditFormCard = () => {
        openEditDrawer({
            cardId: 'contact-form',
            sectionId: 'contact',
            sectionLabel: 'Section 07 • Formulaire de Contact',
            title: 'Édition : En-têtes du Formulaire',
            type: 'translation',
            colors: cardStyles?.['contact-form'],
            fields: [
                { key: 'formTitle', label: 'Titre du formulaire', valueFr: tFr.formTitle, valueEn: tEn.formTitle, placeholder: 'Envoyez-moi un message', color: getFieldColor('contact-form', 'formTitle') },
                { key: 'formSubtitle', label: 'Sous-titre (Markdown)', type: 'textarea', rows: 2, valueFr: tFr.formSubtitle, valueEn: tEn.formSubtitle, color: getFieldColor('contact-form', 'formSubtitle') },
                { key: 'qName', label: 'Question Étape 1 (Nom)', valueFr: tFr.qName, valueEn: tEn.qName, color: getFieldColor('contact-form', 'qName') },
                { key: 'qEmail', label: 'Question Étape 2 (Email)', valueFr: tFr.qEmail, valueEn: tEn.qEmail, color: getFieldColor('contact-form', 'qEmail') },
                { key: 'qPhone', label: 'Question Étape 3 (Téléphone)', valueFr: tFr.qPhone, valueEn: tEn.qPhone, color: getFieldColor('contact-form', 'qPhone') },
                { key: 'qMessage', label: 'Question Étape 4 (Message)', valueFr: tFr.qMessage, valueEn: tEn.qMessage, color: getFieldColor('contact-form', 'qMessage') },
            ],
        });
    };

    // 2. Édition Opportunités
    const handleEditLookingCard = () => {
        openEditDrawer({
            cardId: 'contact-looking',
            sectionId: 'contact',
            sectionLabel: 'Section 07 • Carte Opportunités',
            title: 'Édition : Opportunités Recherchées',
            type: 'translation',
            colors: cardStyles?.['contact-looking'],
            fields: [
                { key: 'lookingTitle', label: 'Titre', valueFr: tFr.lookingTitle, valueEn: tEn.lookingTitle, color: getFieldColor('contact-looking', 'lookingTitle') },
                { key: 'lookingSubtitle', label: 'Sous-titre', valueFr: tFr.lookingSubtitle, valueEn: tEn.lookingSubtitle, color: getFieldColor('contact-looking', 'lookingSubtitle') },
                { key: 'lookingBody', label: 'Description détaillée (Markdown)', type: 'textarea', rows: 4, valueFr: tFr.lookingBody, valueEn: tEn.lookingBody, color: getFieldColor('contact-looking', 'lookingBody') },
            ],
        });
    };

    // 3. Édition Réseaux & SVGs
    const handleEditSocialsCard = () => {
        openEditDrawer({
            cardId: 'contact-socials',
            sectionId: 'contact',
            sectionLabel: 'Section 07 • Réseaux Sociaux & SVGs',
            title: 'Édition : Réseaux & Icônes SVG (Ajout / Suppression)',
            type: 'socials',
            socialsData: socials,
            colors: cardStyles?.['contact-socials'],
        });
    };

    return (
        <section id="contact">
            <ScrollReveal animation="fade-up">
                <h2>{t.contact.title}</h2>
            </ScrollReveal>

            <div className="contact-grid">
                {/* 1. Carte Formulaire */}
                <ScrollReveal
                    animation="fade-up"
                    delay={0}
                    as="article"
                    className="contact-card contact-card--form"
                    style={cardStyles?.['contact-form']?.accentColor ? { '--accent': cardStyles['contact-form'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditFormCard} label="Éditer Formulaire" />}

                    <h3
                        className="contact-card__title"
                        style={{ color: getFieldColor('contact-form', 'formTitle') || undefined }}
                    >
                        {t.contact.formTitle}
                    </h3>
                    <p
                        className="contact-card__subtitle"
                        style={{ color: getFieldColor('contact-form', 'formSubtitle') || undefined }}
                    >
                        <MarkdownView text={t.contact.formSubtitle} />
                    </p>

                    {!submitted && (
                        <div className="contact-stepper">
                            <div className="contact-stepper__bar">
                                <div
                                    className="contact-stepper__bar-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="contact-stepper__meta">
                                {t.contact.stepLabel} {stepIndex + 1} {t.contact.stepOf} {steps.length}
                            </div>
                        </div>
                    )}

                    {submitted ? (
                        <div className="contact-success">
                            <h4 className="contact-success__title">
                                {t.contact.successTitle.replace('{name}', form.name)}
                            </h4>
                            <p className="contact-success__text">
                                {lang === 'fr' ? (
                                    <>
                                        Votre message a bien été envoyé. Je vous répondrai à l'adresse <strong>{form.email}</strong> dès que possible.
                                    </>
                                ) : (
                                    <>
                                        Your message has been sent successfully. I will get back to you at <strong>{form.email}</strong> as soon as possible.
                                    </>
                                )}
                            </p>
                            <button
                                type="button"
                                className="contact-submit contact-submit--ghost"
                                onClick={reset}
                            >
                                {t.contact.btnReset}
                            </button>
                        </div>
                    ) : (
                        <form
                            className="contact-form"
                            onSubmit={handleSubmit}
                            onKeyDown={handleKeyDown}
                        >
                            <label
                                key={currentStep.name}
                                className="contact-field contact-field--step"
                            >
                                <span
                                    className="contact-field__question"
                                    style={{ color: getFieldColor('contact-form', currentStep.name === 'name' ? 'qName' : currentStep.name === 'email' ? 'qEmail' : currentStep.name === 'phone' ? 'qPhone' : 'qMessage') || undefined }}
                                >
                                    {currentStep.question}
                                </span>
                                {currentStep.type === 'textarea' ? (
                                    <textarea
                                        name={currentStep.name}
                                        rows="5"
                                        value={currentValue}
                                        onChange={handleChange}
                                        placeholder={currentStep.placeholder}
                                        required={currentStep.required}
                                        disabled={sending}
                                        maxLength={currentStep.maxLength}
                                    />
                                ) : (
                                    <input
                                        type={currentStep.type}
                                        name={currentStep.name}
                                        value={currentValue}
                                        onChange={handleChange}
                                        placeholder={currentStep.placeholder}
                                        required={currentStep.required}
                                        disabled={sending}
                                        maxLength={currentStep.maxLength}
                                        autoComplete={
                                            currentStep.type === 'email'
                                                ? 'email'
                                                : currentStep.type === 'tel'
                                                ? 'tel'
                                                : 'off'
                                        }
                                    />
                                )}
                            </label>

                            {error && (
                                <p className="contact-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="contact-form__actions">
                                <button
                                    type="button"
                                    className="contact-submit contact-submit--ghost"
                                    onClick={goPrev}
                                    disabled={stepIndex === 0 || sending}
                                >
                                    {t.contact.btnPrev}
                                </button>
                                <button
                                    type="submit"
                                    className="contact-submit"
                                    disabled={!canAdvance || sending}
                                >
                                    {sending
                                        ? t.contact.btnSending
                                        : isLast
                                        ? t.contact.btnSend
                                        : t.contact.btnNext}
                                </button>
                            </div>
                        </form>
                    )}
                </ScrollReveal>

                {/* 2. Carte Opportunités */}
                <ScrollReveal
                    animation="fade-up"
                    delay={120}
                    as="article"
                    className="contact-card"
                    style={cardStyles?.['contact-looking']?.accentColor ? { '--accent': cardStyles['contact-looking'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditLookingCard} label="Éditer Opportunités" />}

                    <h3
                        className="contact-card__title"
                        style={{ color: getFieldColor('contact-looking', 'lookingTitle') || undefined }}
                    >
                        {t.contact.lookingTitle}
                    </h3>
                    <p
                        className="contact-card__subtitle"
                        style={{ color: getFieldColor('contact-looking', 'lookingSubtitle') || undefined }}
                    >
                        {t.contact.lookingSubtitle}
                    </p>
                    <p
                        className="contact-card__body"
                        style={{ color: getFieldColor('contact-looking', 'lookingBody') || undefined }}
                    >
                        <MarkdownView text={t.contact.lookingBody} />
                    </p>
                </ScrollReveal>

                {/* 3. Carte Réseaux Sociaux & SVGs */}
                <ScrollReveal
                    animation="fade-up"
                    delay={240}
                    as="article"
                    className="contact-card contact-card--socials"
                    style={cardStyles?.['contact-socials']?.accentColor ? { '--accent': cardStyles['contact-socials'].accentColor } : {}}
                >
                    {isEditMode && <EditCardTrigger onClick={handleEditSocialsCard} label="Éditer Réseaux (SVG)" />}

                    <h3
                        className="contact-card__title"
                        style={{ color: getFieldColor('contact-socials', 'socialsTitle') || undefined }}
                    >
                        {t.contact.socialsTitle}
                    </h3>
                    <p
                        className="contact-card__subtitle"
                        style={{ color: getFieldColor('contact-socials', 'socialsSubtitle') || undefined }}
                    >
                        {t.contact.socialsSubtitle}
                    </p>
                    <p
                        className="contact-card__body"
                        style={{ color: getFieldColor('contact-socials', 'socialsBody') || undefined }}
                    >
                        <MarkdownView text={t.contact.socialsBody} />
                    </p>

                    <div className="contact-social-icons-row">
                        {(socials || []).filter((soc) => isSafeUrl(soc.url)).map((soc) => {
                            const isInternal = soc.url && soc.url.startsWith('/');
                            const colorStyle = soc.color ? { color: soc.color, borderColor: soc.color } : {};

                            if (isInternal) {
                                return (
                                    <Link
                                        key={soc.id || soc.name}
                                        to={soc.url}
                                        className="contact-icon-btn"
                                        aria-label={soc.name}
                                        title={soc.title || soc.name}
                                        style={colorStyle}
                                    >
                                        {renderIcon(soc.iconKey, { size: 20 })}
                                    </Link>
                                );
                            }

                            return (
                                <a
                                    key={soc.id || soc.name}
                                    href={soc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-icon-btn"
                                    aria-label={soc.name}
                                    title={soc.title || soc.name}
                                    style={colorStyle}
                                >
                                    {renderIcon(soc.iconKey, { size: 20 })}
                                </a>
                            );
                        })}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

export default Contact;
