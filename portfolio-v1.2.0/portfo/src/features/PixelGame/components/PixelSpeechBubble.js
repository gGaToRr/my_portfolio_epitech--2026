import React from 'react';

export default function PixelSpeechBubble({ bubble }) {
    if (!bubble || !bubble.visible) return null;

    return (
        <div
            className="admin-pixel-speech-bubble"
            style={{
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
            }}
        >
            <span className="admin-pixel-speech-text">{bubble.text}</span>
            <div className="admin-pixel-speech-arrow" />
        </div>
    );
}
