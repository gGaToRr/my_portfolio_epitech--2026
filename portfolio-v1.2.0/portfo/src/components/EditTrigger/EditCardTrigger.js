import React from 'react';
import './EditCardTrigger.css';

export function EditCardTrigger({
    onClick,
    onDelete,
    label = 'Modifier',
    deleteLabel = 'Supprimer',
    className = '',
    title,
}) {
    return (
        <div className={`edit-card-actions-bar ${className}`.trim()}>
            <button
                type="button"
                className="edit-card-trigger-btn"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onClick) onClick(e);
                }}
                title={title || 'Modifier cet élément (Texte, liens, couleurs)'}
                aria-label={label || 'Modifier cet élément'}
            >
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="edit-trigger-svg"
                >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {label && <span className="edit-trigger-text">{label}</span>}
            </button>

            {onDelete && (
                <button
                    type="button"
                    className="edit-card-delete-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Voulez-vous vraiment supprimer cet élément ?')) {
                            onDelete(e);
                        }
                    }}
                    title={deleteLabel || 'Supprimer cet élément'}
                    aria-label={deleteLabel || 'Supprimer cet élément'}
                >
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export function AddSectionItemButton({ onClick, label = 'Ajouter un élément', className = '' }) {
    return (
        <button
            type="button"
            className={`btn-add-section-item ${className}`.trim()}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) onClick(e);
            }}
            title={label}
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{label}</span>
        </button>
    );
}

export default EditCardTrigger;
