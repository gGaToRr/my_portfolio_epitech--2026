import React from 'react';

export default function PixelGameFooter({ statusText, cycleSeconds = 60 }) {
    return (
        <div className="admin-pixel-pet-footer">
            <span className="admin-pixel-pet-status-msg">{statusText}</span>
            <span className="admin-pixel-pet-timer-tag">Cycle automatique : {cycleSeconds}s</span>
        </div>
    );
}
