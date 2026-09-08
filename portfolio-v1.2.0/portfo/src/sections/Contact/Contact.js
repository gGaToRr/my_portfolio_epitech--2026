import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../data/translations';
import { sendContactMessage } from '../../utils/sendContactMessage';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Contact.css';

function EpitechLogo({ size = 28 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="contact-social-svg"
            aria-hidden="true"
        >
            <rect width="100" height="100" rx="20" fill="currentColor" fillOpacity="0.15" />
            <path
                d="M26 26H76V38H40V46H70V58H40V66H76V78H26V26Z"
                fill="currentColor"
            />
        </svg>
    );
}

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
// Strip control chars (sauf \n \r \t) pour bloquer payloads d'injection d'headers
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
    const t = translations[lang] || translations.en;
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

    return (
        <section id="contact">
            <ScrollReveal animation="fade-up">
                <h2>{t.contact.title}</h2>
            </ScrollReveal>

            <div className="contact-grid">
                <ScrollReveal
                    animation="fade-up"
                    delay={0}
                    as="article"
                    className="contact-card contact-card--form"
                >
                    <h3 className="contact-card__title">{t.contact.formTitle}</h3>
                    <p className="contact-card__subtitle">
                        {t.contact.formSubtitle}
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
                                <span className="contact-field__question">
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

                <ScrollReveal
                    animation="fade-up"
                    delay={120}
                    as="article"
                    className="contact-card"
                >
                    <h3 className="contact-card__title">{t.contact.lookingTitle}</h3>
                    <p className="contact-card__subtitle">{t.contact.lookingSubtitle}</p>
                    <p className="contact-card__body">
                        {t.contact.lookingBody}
                    </p>
                </ScrollReveal>

                <ScrollReveal
                    animation="fade-up"
                    delay={240}
                    as="article"
                    className="contact-card contact-card--socials"
                >
                    <h3 className="contact-card__title">{t.contact.socialsTitle}</h3>
                    <p className="contact-card__subtitle">{t.contact.socialsSubtitle}</p>
                    <p className="contact-card__body">
                        {t.contact.socialsBody}
                    </p>

                    <div className="contact-social-icons-row">
                        <a
                            href="https://github.com/gGaToRr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-icon-btn"
                            aria-label="GitHub @gGaToRr"
                            title="GitHub (@gGaToRr)"
                        >
                            <FaGithub />
                        </a>

                        <a
                            href="https://www.linkedin.com/in/pierre-untersinger-406685253/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-icon-btn"
                            aria-label="LinkedIn Pierre Untersinger"
                            title="LinkedIn (Pierre Untersinger)"
                        >
                            <FaLinkedin />
                        </a>

                        <Link
                            to="/youtube"
                            className="contact-icon-btn contact-icon-btn--yt"
                            aria-label={t.notFound.ytBadge}
                            title="YouTube"
                        >
                            <FaYoutube />
                        </Link>

                        <a
                            href="https://www.epitech.eu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-icon-btn contact-icon-btn--epitech"
                            aria-label="Epitech Marseille"
                            title="Epitech Marseille"
                        >
                            <EpitechLogo size={26} />
                        </a>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

export default Contact;
