import React from 'react';
import { usePixelGameEngine } from './engine/usePixelGameEngine';
import PixelGameHeader from './components/PixelGameHeader';
import PixelGameCanvas from './components/PixelGameCanvas';
import PixelGameFooter from './components/PixelGameFooter';
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
        statusText,
        bubble,
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

            <PixelGameCanvas canvasRef={canvasRef} bubble={bubble} />

            <PixelGameFooter statusText={statusText} cycleSeconds={60} />
        </div>
    );
}

// Alias pour rétrocompatibilité
export const PixelPetCard = PixelPetGame;
