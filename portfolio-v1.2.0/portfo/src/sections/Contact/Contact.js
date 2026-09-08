import { useState } from 'react';
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { sendContactMessage } from '../../utils/sendContactMessage';
import './Contact.css';

function EpitechLogo({ size = 22 }) {
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

const STEPS = [
    {
        name: 'name',
        label: 'Nom',
        type: 'text',
        placeholder: 'Votre nom',
        required: true,
        question: 'Comment vous appelez-vous ?',
        maxLength: 80,
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'vous@exemple.com',
        required: true,
        question: 'Quelle est votre adresse email ?',
        maxLength: 120,
    },
    {
        name: 'phone',
        label: 'Téléphone',
        type: 'tel',
        placeholder: '+33 6 XX XX XX XX',
        required: false,
        question: 'Un numéro pour vous joindre ? (optionnel)',
        maxLength: 32,
    },
    {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Votre message...',
        required: true,
        question: 'Que souhaitez-vous me dire ?',
        maxLength: 4000,
    },
];

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
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [stepIndex, setStepIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const currentStep = STEPS[stepIndex];
    const currentValue = form[currentStep.name];
    const canAdvance = isStepValid(currentStep, currentValue);
    const isLast = stepIndex === STEPS.length - 1;

    const handleChange = (e) => {
        const step = STEPS.find((s) => s.name === e.target.name);
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
            setError(err.message || "Une erreur est survenue. Réessayez.");
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

    const progress = ((stepIndex + (submitted ? 1 : 0)) / STEPS.length) * 100;

    return (
        <section id="contact">
            <h2>Contact Me</h2>

            <div className="contact-grid">
                <article className="contact-card contact-card--form">
                    <h3 className="contact-card__title">Écrivez-moi</h3>
                    <p className="contact-card__subtitle">
                        Une question, un projet ? Répondez étape par étape.
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
                                Étape {stepIndex + 1} / {STEPS.length}
                            </div>
                        </div>
                    )}

                    {submitted ? (
                        <div className="contact-success">
                            <h4 className="contact-success__title">Merci {form.name} !</h4>
                            <p className="contact-success__text">
                                Votre message a bien été envoyé. Je vous répondrai à
                                l'adresse <strong>{form.email}</strong> dès que possible.
                            </p>
                            <button
                                type="button"
                                className="contact-submit contact-submit--ghost"
                                onClick={reset}
                            >
                                Envoyer un autre message
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
                                        autoFocus
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
                                        autoFocus
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
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    className="contact-submit"
                                    disabled={!canAdvance || sending}
                                >
                                    {sending
                                        ? 'Envoi…'
                                        : isLast
                                        ? 'Envoyer'
                                        : 'Suivant'}
                                </button>
                            </div>
                        </form>
                    )}
                </article>

                <article className="contact-card">
                    <h3 className="contact-card__title">Ce que je cherche</h3>
                    <p className="contact-card__subtitle">Stage · alternance · collab</p>
                    <p className="contact-card__body">
                        Étudiant à Epitech Marseille (promo 2028), je m'oriente vers le
                        réseau et la cybersécurité. Ouvert aux opportunités de stage,
                        d'alternance ou de collaboration sur des projets perso autour de
                        l'infra, du pentest et de l'embarqué.
                    </p>
                </article>

                <article className="contact-card">
                    <h3 className="contact-card__title">Où me trouver</h3>
                    <p className="contact-card__subtitle">Code, réseaux & école</p>
                    <p className="contact-card__body">
                        Retrouvez mon profil, mes projets et mes activités :
                    </p>

                    <div className="contact-socials-grid">
                        <a
                            href="https://github.com/gGaToRr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-btn"
                            title="Profil GitHub"
                        >
                            <FaGithub className="contact-social-icon" />
                            <div className="contact-social-text">
                                <span className="contact-social-title">GitHub</span>
                                <span className="contact-social-handle">@gGaToRr</span>
                            </div>
                            <span className="contact-social-arrow">↗</span>
                        </a>

                        <a
                            href="https://www.linkedin.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-btn"
                            title="Profil LinkedIn"
                        >
                            <FaLinkedin className="contact-social-icon" />
                            <div className="contact-social-text">
                                <span className="contact-social-title">LinkedIn</span>
                                <span className="contact-social-handle">Pierre Untersinger</span>
                            </div>
                            <span className="contact-social-arrow">↗</span>
                        </a>

                        <a
                            href="https://www.youtube.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-btn"
                            title="Chaîne YouTube"
                        >
                            <FaYoutube className="contact-social-icon" />
                            <div className="contact-social-text">
                                <span className="contact-social-title">YouTube</span>
                                <span className="contact-social-handle">Démos & Tech</span>
                            </div>
                            <span className="contact-social-arrow">↗</span>
                        </a>

                        <a
                            href="https://www.epitech.eu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-btn"
                            title="Epitech Marseille"
                        >
                            <EpitechLogo size={22} />
                            <div className="contact-social-text">
                                <span className="contact-social-title">Epitech</span>
                                <span className="contact-social-handle">Marseille · Promo 2028</span>
                            </div>
                            <span className="contact-social-arrow">↗</span>
                        </a>
                    </div>
                </article>
            </div>
        </section>
    );
}

export default Contact;
