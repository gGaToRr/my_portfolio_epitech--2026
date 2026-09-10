import React from 'react';
import PixelSpeechBubble from './PixelSpeechBubble';

export default function PixelGameCanvas({ canvasRef, bubble }) {
    return (
        <div className="admin-pixel-pet-canvas-wrap">
            <canvas ref={canvasRef} className="admin-pixel-pet-canvas" />
            <PixelSpeechBubble bubble={bubble} />
        </div>
    );
}
