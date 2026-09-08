import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaPaperPlane, FaTimes, FaFilePdf } from 'react-icons/fa';
import './CvModal.css';

function CvModal({ isOpen, onClose, t }) {
    const [isRendered, setIsRendered] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            setIsClosing(false);
        } else if (isRendered) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsRendered(false);
                setIsClosing(false);
            }, 320);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isRendered]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isRendered && !isClosing) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRendered, isClosing, onClose]);

    if (!isRendered) return null;

    const modalData = t?.cvModal || {
        badge: "CV Téléchargé",
        title: "Merci pour votre intérêt !",
        message: "Le téléchargement de mon CV (CV_PIERRE_UNTERSINGER.pdf) a démarré.",
        subMessage: "Si vous avez une opportunité ou souhaitez échanger sur mon parcours, n'hésitez pas à me contacter via le formulaire ou sur LinkedIn !",
        btnContact: "Me contacter",
        btnClose: "Fermer",
    };

    return (
        <div
            className={`cv-modal-overlay ${isClosing ? 'is-closing' : 'is-open'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-modal-title"
        >
            <div
                className={`cv-modal-box ${isClosing ? 'is-closing' : 'is-open'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="cv-modal-close"
                    onClick={onClose}
                    aria-label={modalData.btnClose}
                >
                    <FaTimes />
                </button>

                <div className="cv-modal-icon-wrap">
                    <div className="cv-modal-icon-ring">
                        <FaCheckCircle className="cv-modal-check-icon" />
                    </div>
                </div>

                <div className="cv-modal-badge">
                    <FaFilePdf className="cv-modal-badge-icon" />
                    <span>{modalData.badge}</span>
                </div>

                <h3 id="cv-modal-title" className="cv-modal-title">
                    {modalData.title}
                </h3>

                <p className="cv-modal-message">
                    {modalData.message}
                </p>

                <p className="cv-modal-submessage">
                    {modalData.subMessage}
                </p>

                <div className="cv-modal-actions">
                    <a
                        href="#contact"
                        className="btn-cv-modal btn-cv-modal--primary"
                        onClick={onClose}
                    >
                        <FaPaperPlane /> {modalData.btnContact}
                    </a>
                    <button
                        type="button"
                        className="btn-cv-modal btn-cv-modal--ghost"
                        onClick={onClose}
                    >
                        {modalData.btnClose}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CvModal;
