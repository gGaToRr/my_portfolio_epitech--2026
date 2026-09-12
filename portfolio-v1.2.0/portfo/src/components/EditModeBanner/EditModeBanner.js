import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditableContent } from '../../context/EditableContentContext';
import './EditModeBanner.css';

function BackArrowIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    );
}

function ResetIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    );
}

export default function EditModeBanner() {
    const navigate = useNavigate();
    const { resetToDefaults } = useEditableContent();

    const handleBack = () => {
        navigate('/panelAdmin');
    };

    const handleReset = () => {
        if (window.confirm('Voulez-vous réinitialiser tout le contenu et les couleurs aux valeurs par défaut ?')) {
            resetToDefaults();
        }
    };

    return (
        <div className="edit-mode-overlay-frame" aria-label="Mode édition">
            {/* Cadre rouge avec border-radius tout autour de l'écran */}
            <div className="edit-mode-outer-frame" />

            {/* Bandeau / Carte supérieure rouge unie sans bordure */}
            <header className="edit-mode-top-banner">
                <button
                    type="button"
                    className="edit-mode-back-btn"
                    onClick={handleBack}
                    title="Retour au PanelAdmin"
                    aria-label="Retour au PanelAdmin"
                >
                    <BackArrowIcon />
                </button>

                <div className="edit-mode-title-wrapper">
                    <span className="edit-mode-pulse-dot" />
                    <span className="edit-mode-title-text">Mode édition activé</span>
                </div>

                <button
                    type="button"
                    className="edit-mode-reset-btn"
                    onClick={handleReset}
                    title="Rétablir les contenus et couleurs d'origine"
                    aria-label="Réinitialiser"
                >
                    <ResetIcon />
                    <span className="reset-btn-text">Réinitialiser</span>
                </button>
            </header>
        </div>
    );
}
