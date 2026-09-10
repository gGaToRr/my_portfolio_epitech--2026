import React from 'react';
import { usePixelGameEngine } from './engine/usePixelGameEngine';
import PixelGameCanvas from './components/PixelGameCanvas';
import './PixelPetGame.css';

export default function PixelPetGame() {
    const {
        canvasRef,
        containerRef,
    } = usePixelGameEngine();

    return (
        <div className="admin-pixel-pet-card" ref={containerRef}>
            <PixelGameCanvas canvasRef={canvasRef} />
        </div>
    );
}

// Alias pour rétrocompatibilité
export const PixelPetCard = PixelPetGame;
