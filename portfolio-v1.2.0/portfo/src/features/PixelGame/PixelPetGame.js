import React from 'react';
import { usePixelGameEngine } from './engine/usePixelGameEngine';
import PixelGameHeader from './components/PixelGameHeader';
import PixelGameCanvas from './components/PixelGameCanvas';
import './PixelPetGame.css';

export default function PixelPetGame() {
    const {
        canvasRef,
        containerRef,
        cowboyScore,
        spideyScore,
        kermitScore,
        battleCountdown,
        isFighting,
        isNukeRunning,
        startBattle,
        triggerNuke,
    } = usePixelGameEngine();

    return (
        <div className="admin-pixel-pet-card" ref={containerRef}>
            <PixelGameHeader
                cowboyScore={cowboyScore}
                spideyScore={spideyScore}
                kermitScore={kermitScore}
                isFighting={isFighting}
                isNukeRunning={isNukeRunning}
                battleCountdown={battleCountdown}
                onStartBattle={startBattle}
                onTriggerNuke={() => triggerNuke()}
            />
            <PixelGameCanvas canvasRef={canvasRef} />
        </div>
    );
}

// Alias pour rétrocompatibilité
export const PixelPetCard = PixelPetGame;
