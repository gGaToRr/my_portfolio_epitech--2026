import React from 'react';

export default function PixelGameHeader({
    cowboyScore,
    spideyScore,
    kermitScore,
    isFighting,
    isNukeRunning,
    battleCountdown,
    onStartBattle,
    onTriggerNuke,
}) {
    return (
        <div className="admin-pixel-pet-header">
            <div className="admin-pixel-pet-score-wrap">
                <span className="admin-pixel-pet-score-pulse" />
                <span className="admin-pixel-pet-score-title">VICTOIRES :</span>
                <span className="admin-pixel-pet-score admin-pixel-pet-score--cowboy">
                    COWBOY {cowboyScore}
                </span>
                <span className="admin-pixel-pet-score-sep">|</span>
                <span className="admin-pixel-pet-score admin-pixel-pet-score--spidey">
                    SPIDEY {spideyScore}
                </span>
                <span className="admin-pixel-pet-score-sep">|</span>
                <span className="admin-pixel-pet-score admin-pixel-pet-score--kermit">
                    KERMIT {kermitScore}
                </span>
            </div>

            <div className="admin-pixel-pet-actions">
                <button
                    type="button"
                    onClick={onStartBattle}
                    disabled={isFighting || isNukeRunning}
                    className={`admin-pixel-fight-btn ${isFighting ? 'is-fighting' : ''}`}
                    title="Déclencher le combat pixel-art"
                >
                    {isFighting ? 'Combat en cours...' : `Lancer le combat (Auto : ${battleCountdown}s)`}
                </button>

                <button
                    type="button"
                    onClick={onTriggerNuke}
                    disabled={isFighting || isNukeRunning}
                    className={`admin-pixel-nuke-btn ${isNukeRunning ? 'is-nuke-active' : ''}`}
                    title="Déclencher la NUKE Tactique (Remet les scores adverses à 0)"
                >
                    {isNukeRunning ? 'NUKE en cours...' : 'Lancer la NUKE'}
                </button>
            </div>
        </div>
    );
}
