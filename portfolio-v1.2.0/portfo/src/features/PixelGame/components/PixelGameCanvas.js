import React from 'react';

export default function PixelGameCanvas({ canvasRef }) {
    return (
        <div className="admin-pixel-pet-canvas-wrap">
            <canvas ref={canvasRef} className="admin-pixel-pet-canvas" />
        </div>
    );
}
