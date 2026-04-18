import { useState } from 'react';
import './Contact.css';

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <section id="contact">
            <h2>Contact Me</h2>

            <div className="contact-grid">
                <article className="contact-card contact-card--form">
                    <h3 className="contact-card__title">Écrivez-moi</h3>
                    <p className="contact-card__subtitle">
                        Une question, un projet ? Remplissez le formulaire.
                    </p>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="contact-form__row">
                            <label className="contact-field">
                                <span>Nom</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Votre nom"
                                    required
                                />
                            </label>
                            <label className="contact-field">
                                <span>Téléphone</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+33 6 XX XX XX XX"
                                />
                            </label>
                        </div>
                        <label className="contact-field">
                            <span>Email</span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="vous@exemple.com"
                                required
                            />
                        </label>
                        <label className="contact-field">
                            <span>Message</span>
                            <textarea
                                name="message"
                                rows="4"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Votre message..."
                                required
                            />
                        </label>
                        <button type="submit" className="contact-submit">
                            Envoyer
                        </button>
                    </form>
                </article>

                <article className="contact-card">
                    <h3 className="contact-card__title">Lorem Ipsum</h3>
                    <p className="contact-card__subtitle">Placeholder</p>
                    <p className="contact-card__body">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                        veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                </article>

                <article className="contact-card">
                    <h3 className="contact-card__title">Lorem Ipsum</h3>
                    <p className="contact-card__subtitle">Placeholder</p>
                    <p className="contact-card__body">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                        proident, sunt in culpa qui officia deserunt mollit.
                    </p>
                </article>
            </div>
        </section>
    );
}

export default Contact;
