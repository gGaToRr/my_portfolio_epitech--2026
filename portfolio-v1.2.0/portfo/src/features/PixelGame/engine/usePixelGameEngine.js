import { useEffect, useRef, useState, useCallback } from 'react';
import {
    COWBOY_PALETTE,
    COWBOY_FRAMES,
    COWBOY_SHOOT,
    COWBOY_KO,
    SPIDEY_PALETTE,
    SPIDEY_FRAMES,
    SPIDEY_SHOOT,
    SPIDEY_KO,
    KERMIT_PALETTE,
    KERMIT_WALK_FRAMES,
    KERMIT_ATTACK_FRAMES,
    KERMIT_DANCE_FRAMES,
    KERMIT_KO,
    SNAKE_PALETTE,
    SNAKE_FRAMES,
    MINE_PALETTE,
    MINE_SPRITE,
    AK47_PALETTE,
    AK47_SPRITE_R,
    AK47_SPRITE_L,
    CACTUS_PALETTE,
    CACTUS_SPRITE,
} from '../sprites';
import {
    play8BitRetroSound,
    playNukeSirenSound,
    playNukeExplosionSound,
} from '../audio/retroAudio';
import {
    CANVAS_HEIGHT,
    PIXEL_SCALE,
    GROUND_PADDING,
    INITIAL_CLOUDS,
    AUTO_BATTLE_INTERVAL,
} from './gameConstants';

export function usePixelGameEngine() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Compteurs de victoires
    const [cowboyScore, setCowboyScore] = useState(0);
    const [spideyScore, setSpideyScore] = useState(0);
    const [kermitScore, setKermitScore] = useState(0);

    // Compte à rebours du combat auto
    const [battleCountdown, setBattleCountdown] = useState(AUTO_BATTLE_INTERVAL);
    const [isFighting, setIsFighting] = useState(false);
    const [isNukeRunning, setIsNukeRunning] = useState(false);
    const [statusText, setStatusText] = useState('Patrouille active : Cowboy, Spider-Man & Kermit');
    const [bubble, setBubble] = useState({ text: '', visible: false, x: 0, y: 0 });

    const stateRef = useRef({
        // Cowboy
        cowboyX: 0,
        cowboyY: 0,
        cowboyFrame: 0,
        cowboyPowerup: null, // 'shield' | 'ak47'
        cowboyPowerupTimer: 0,
        // Spider-Man
        spideyX: -100,
        spideyY: 0,
        spideyFrame: 0,
        spideyPowerup: null,
        spideyPowerupTimer: 0,
        // Kermit the Frog
        kermitX: 200,
        kermitY: 0,
        kermitFrame: 0,
        kermitAttackFrame: 0,
        kermitDanceFrame: 0,
        kermitPowerup: null,
        kermitPowerupTimer: 0,
        // Serpent (suit le cowboy)
        snakeX: 0,
        snakeFrame: 0,
        // Mine / Caisse mystère aléatoire fréquente
        mine: {
            x: 320,
            active: true,
            respawnTimer: 0,
        },
        // Décor d'arrière-plan (Nuages)
        clouds: JSON.parse(JSON.stringify(INITIAL_CLOUDS)),
        // Douilles et balles AK-47
        casingParticles: [],
        // Combat sur place (sans déplacement)
        fightActive: false,
        fightPhase: 0,
        fightTimer: 0,
        chosenWinner: 'cowboy', // 'cowboy', 'spidey', 'kermit'
        scoreAlreadyAdded: false,
        battleVFX: [],
        smokeParticles: [],
        webLines: [],
        cucumberProjectiles: [],
        bulletTracers: [],
        battleTexts: [],
        // Tactical NUKE System
        nukeActive: false,
        nukePhase: 0, // 0: inactive, 1: alerte sirène, 2: détonation & champignon, 3: aftermath
        nukeTimer: 0,
        nukeLauncher: 'cowboy',
        nukeFlashAlpha: 0,
        nukeShakeX: 0,
        nukeShakeY: 0,
        nukeShockwaves: [],
        nukeMushroomParticles: [],
        nukeEmbers: [],
        // Ticks
        walkTick: 0,
        // Dialogue
        speechText: '',
        speechTimer: 0,
        speechSpeaker: 'cowboy',
    });

    // Déclencheur du Tactical NUKE
    const triggerNuke = useCallback((specifiedLauncher) => {
        const s = stateRef.current;
        if (s.nukeActive) return;

        let launcher = specifiedLauncher;
        if (!launcher) {
            if (cowboyScore >= spideyScore && cowboyScore >= kermitScore) {
                launcher = 'cowboy';
            } else if (spideyScore >= cowboyScore && spideyScore >= kermitScore) {
                launcher = 'spidey';
            } else {
                launcher = 'kermit';
            }
        }

        s.fightActive = false;
        s.fightPhase = 0;
        setIsFighting(false);

        s.nukeActive = true;
        s.nukePhase = 1;
        s.nukeTimer = 65; // ~1 seconde d'alerte sirène
        s.nukeLauncher = launcher;
        s.nukeFlashAlpha = 0;
        s.nukeShakeX = 0;
        s.nukeShakeY = 0;
        s.nukeShockwaves = [];
        s.nukeMushroomParticles = [];
        s.nukeEmbers = [];

        setIsNukeRunning(true);
        playNukeSirenSound();

        const nameLabel = launcher === 'cowboy' ? 'du Cowboy' : launcher === 'spidey' ? 'de Spider-Man' : 'de Kermit';
        setStatusText(`ALERTE : NUKE TACTIQUE ${nameLabel.toUpperCase()} !`);
        s.speechText = `NUKE TACTIQUE ARMEE ! IMPACT IMMINENT !`;
        s.speechSpeaker = launcher;
        s.speechTimer = 65;
    }, [cowboyScore, spideyScore, kermitScore]);

    // Déclencheur automatique de NUKE quand un joueur atteint 1000 victoires
    const hasNukedAt1000Ref = useRef({ cowboy: false, spidey: false, kermit: false });
    useEffect(() => {
        if (cowboyScore >= 1000 && !hasNukedAt1000Ref.current.cowboy) {
            hasNukedAt1000Ref.current.cowboy = true;
            triggerNuke('cowboy');
        } else if (spideyScore >= 1000 && !hasNukedAt1000Ref.current.spidey) {
            hasNukedAt1000Ref.current.spidey = true;
            triggerNuke('spidey');
        } else if (kermitScore >= 1000 && !hasNukedAt1000Ref.current.kermit) {
            hasNukedAt1000Ref.current.kermit = true;
            triggerNuke('kermit');
        }
    }, [cowboyScore, spideyScore, kermitScore, triggerNuke]);

    // Déclenchement du combat (Choix aléatoire équitable du vainqueur)
    const startBattle = useCallback(() => {
        const s = stateRef.current;
        if (s.fightActive || s.nukeActive) return;

        const rand = Math.random();
        const winner = rand < 0.34 ? 'cowboy' : rand < 0.67 ? 'spidey' : 'kermit';

        s.fightActive = true;
        s.fightPhase = 2; // Combat immédiat à distance
        s.fightTimer = 360; // ~6 secondes
        s.chosenWinner = winner;
        s.scoreAlreadyAdded = false;

        setIsFighting(true);
        setBattleCountdown(AUTO_BATTLE_INTERVAL);
        setStatusText('Mêlée générale : Combat sur place !');

        play8BitRetroSound(220, 660, 0.22);

        s.speechText = 'Combat général ! Kermit dégaine son concombre !';
        s.speechTimer = 75;
        s.speechSpeaker = 'kermit';
    }, []);

    // Compte à rebours automatique
    useEffect(() => {
        const timer = setInterval(() => {
            setBattleCountdown((prev) => {
                if (prev <= 1) {
                    startBattle();
                    return AUTO_BATTLE_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [startBattle]);

    // Boucle de rendu Canvas 2D
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = CANVAS_HEIGHT;
            if (stateRef.current.cowboyX === 0) {
                stateRef.current.cowboyX = rect.width - 130;
                stateRef.current.spideyX = -60;
                stateRef.current.kermitX = rect.width / 2;
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        const render = () => {
            const s = stateRef.current;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            const groundY = h - GROUND_PADDING;
            const pixelScale = PIXEL_SCALE;

            s.walkTick++;

            // ----------------------------------------------------------------
            // 0. LOGIQUE DE LA NUKE TACTIQUE
            // ----------------------------------------------------------------
            if (s.nukeActive) {
                s.nukeTimer--;

                if (s.nukePhase === 1) {
                    if (s.nukeTimer % 20 === 0) {
                        playNukeSirenSound();
                    }
                    if (s.nukeTimer <= 0) {
                        s.nukePhase = 2;
                        s.nukeTimer = 220;
                        s.nukeFlashAlpha = 1.0;
                        playNukeExplosionSound();

                        if (s.nukeLauncher === 'cowboy') {
                            setSpideyScore(0);
                            setKermitScore(0);
                        } else if (s.nukeLauncher === 'spidey') {
                            setCowboyScore(0);
                            setKermitScore(0);
                        } else {
                            setCowboyScore(0);
                            setSpideyScore(0);
                        }

                        s.nukeShockwaves.push({ radius: 10, maxRadius: w * 0.9, speed: 12, alpha: 1 });
                        s.nukeShockwaves.push({ radius: 5, maxRadius: w * 0.7, speed: 8, alpha: 0.85 });

                        const cx = w / 2;
                        for (let k = 0; k < 130; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            const spd = 1.2 + Math.random() * 5.2;
                            s.nukeMushroomParticles.push({
                                x: cx + (Math.random() - 0.5) * 50,
                                y: groundY - 20 + (Math.random() - 0.5) * 20,
                                vx: Math.cos(angle) * spd * (Math.random() < 0.35 ? 1.4 : 0.85),
                                vy: -1.8 - Math.random() * 4.8,
                                size: 6 + Math.random() * 14,
                                color: ['#ffffff', '#fef08a', '#fde047', '#f97316', '#ef4444', '#dc2626', '#475569', '#1e293b'][Math.floor(Math.random() * 8)],
                                life: 140 + Math.random() * 70,
                                maxLife: 210,
                            });
                        }

                        for (let k = 0; k < 80; k++) {
                            s.nukeEmbers.push({
                                x: cx + (Math.random() - 0.5) * (w * 0.85),
                                y: groundY - 80 - Math.random() * 110,
                                vx: (Math.random() - 0.5) * 3,
                                vy: 0.6 + Math.random() * 2.2,
                                size: 3 + Math.random() * 3.5,
                                color: ['#fde047', '#f97316', '#ef4444', '#fb923c'][Math.floor(Math.random() * 4)],
                                life: 180 + Math.random() * 60,
                            });
                        }

                        s.battleTexts.push({
                            x: w / 2 - 110,
                            y: 65,
                            text: 'NUKE TACTIQUE DETONEE !',
                            color: '#ef4444',
                            life: 120,
                        });
                    }
                } else if (s.nukePhase === 2) {
                    if (s.nukeFlashAlpha > 0) {
                        s.nukeFlashAlpha -= 0.015;
                        if (s.nukeFlashAlpha < 0) s.nukeFlashAlpha = 0;
                    }

                    const shakeIntensity = (s.nukeTimer / 220) * 8.5;
                    s.nukeShakeX = (Math.random() - 0.5) * shakeIntensity;
                    s.nukeShakeY = (Math.random() - 0.5) * shakeIntensity;

                    if (s.nukeTimer <= 0) {
                        s.nukePhase = 3;
                        s.nukeTimer = 90;
                        s.nukeShakeX = 0;
                        s.nukeShakeY = 0;

                        const name = s.nukeLauncher === 'cowboy' ? 'Cowboy' : s.nukeLauncher === 'spidey' ? 'Spider-Man' : 'Kermit';
                        setStatusText(`NUKE terminee : ${name} triomphe ! Scores adverses remis a 0.`);
                        s.speechText = `ANNIHILATION COMPLETE ! Seul mon score survit !`;
                        s.speechSpeaker = s.nukeLauncher;
                        s.speechTimer = 90;
                    }
                } else if (s.nukePhase === 3) {
                    if (s.nukeTimer <= 0) {
                        s.nukeActive = false;
                        s.nukePhase = 0;
                        setIsNukeRunning(false);
                        setStatusText('Patrouille active : Cowboy, Spider-Man & Kermit');
                    }
                }
            }

            ctx.save();
            if (s.nukeActive && s.nukePhase === 2) {
                ctx.translate(s.nukeShakeX, s.nukeShakeY);
            }

            // ----------------------------------------------------------------
            // 1. DÉCOR D'ARRIÈRE-PLAN
            // ----------------------------------------------------------------
            ctx.fillStyle = 'rgba(51, 65, 85, 0.14)';
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            for (let x = 0; x <= w; x += 30) {
                const hillY = groundY - 55 + Math.sin(x * 0.01) * 20 + Math.cos(x * 0.02) * 10;
                ctx.lineTo(x, hillY);
            }
            ctx.lineTo(w, groundY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(71, 85, 105, 0.12)';
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            for (let x = 0; x <= w; x += 25) {
                const hillY = groundY - 30 + Math.sin((x + 100) * 0.016) * 14 + Math.cos(x * 0.03) * 6;
                ctx.lineTo(x, hillY);
            }
            ctx.lineTo(w, groundY);
            ctx.closePath();
            ctx.fill();

            for (let i = 0; i < s.clouds.length; i++) {
                const c = s.clouds[i];
                c.x += c.speed;
                if (c.x > w + 80) c.x = -90;
                ctx.fillStyle = 'rgba(226, 232, 240, 0.18)';
                ctx.fillRect(Math.round(c.x), c.y, c.w, c.h);
                ctx.fillRect(Math.round(c.x) + 8, c.y - 5, c.w - 16, c.h + 5);
            }

            const cactusSpots = [w * 0.15, w * 0.50, w * 0.85];
            for (const cx of cactusSpots) {
                const cactusY = Math.round(groundY - 12 * 3.4);
                for (let r = 0; r < CACTUS_SPRITE.length; r++) {
                    const line = CACTUS_SPRITE[r];
                    for (let c = 0; c < line.length; c++) {
                        const ch = line[c];
                        if (ch !== '.' && CACTUS_PALETTE[ch]) {
                            ctx.fillStyle = CACTUS_PALETTE[ch];
                            ctx.fillRect(Math.round(cx) + c * 3.4, cactusY + r * 3.4, 3.4, 3.4);
                        }
                    }
                }
            }

            // ----------------------------------------------------------------
            // EFFETS VISUELS DU CHAMPIGNON NUCLÉAIRE
            // ----------------------------------------------------------------
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                const cx = w / 2;
                const progress = Math.min(1, (220 - s.nukeTimer) / 100);

                const columnHeight = Math.min(140, progress * 150);
                const columnWidth = 32 + Math.sin(s.walkTick * 0.2) * 4;

                for (let py = groundY; py >= groundY - columnHeight; py -= 8) {
                    const yNorm = (groundY - py) / (columnHeight || 1);
                    const curW = columnWidth * (1 - yNorm * 0.3);
                    const colFlicker = (s.walkTick + py) % 4;
                    ctx.fillStyle = colFlicker === 0 ? '#fef08a' : colFlicker === 1 ? '#f97316' : colFlicker === 2 ? '#ef4444' : '#1e293b';
                    ctx.fillRect(Math.round(cx - curW / 2 + (Math.random() - 0.5) * 4), py, Math.round(curW), 8);
                }

                const capY = groundY - columnHeight;
                const capRadiusX = Math.min(85, progress * 95);
                const capRadiusY = Math.min(48, progress * 54);

                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.ellipse(cx, capY, capRadiusX, capRadiusY, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.ellipse(cx, capY + 4, capRadiusX * 0.82, capRadiusY * 0.78, 0, 0, Math.PI * 2);
                ctx.fill();

                const coreFlicker = s.walkTick % 3 === 0 ? '#fffbeb' : '#fde047';
                ctx.fillStyle = coreFlicker;
                ctx.beginPath();
                ctx.ellipse(cx, capY + 8, capRadiusX * 0.55, capRadiusY * 0.52, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
                ctx.beginPath();
                ctx.ellipse(cx, groundY - columnHeight * 0.45, columnWidth * 1.3, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                for (let i = s.nukeShockwaves.length - 1; i >= 0; i--) {
                    const sw = s.nukeShockwaves[i];
                    sw.radius += sw.speed;
                    sw.alpha *= 0.965;
                    ctx.save();
                    ctx.strokeStyle = `rgba(254, 240, 138, ${sw.alpha})`;
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    ctx.ellipse(cx, groundY, sw.radius, sw.radius * 0.18, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = `rgba(239, 68, 68, ${sw.alpha * 0.6})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(cx, groundY, sw.radius * 0.82, sw.radius * 0.15, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();

                    if (sw.alpha < 0.02 || sw.radius > sw.maxRadius) {
                        s.nukeShockwaves.splice(i, 1);
                    }
                }

                for (let i = s.nukeMushroomParticles.length - 1; i >= 0; i--) {
                    const p = s.nukeMushroomParticles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.size += 0.12;
                    p.life--;
                    const alpha = Math.max(0, p.life / p.maxLife);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha * 0.85;
                    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size));
                    ctx.globalAlpha = 1.0;
                    if (p.life <= 0) s.nukeMushroomParticles.splice(i, 1);
                }

                for (let i = s.nukeEmbers.length - 1; i >= 0; i--) {
                    const e = s.nukeEmbers[i];
                    e.x += e.vx + (Math.random() - 0.5) * 0.4;
                    e.y += e.vy;
                    e.life--;
                    if (e.y >= groundY) {
                        e.y = groundY;
                        e.vx *= 0.5;
                        e.vy = 0;
                    }
                    const alpha = Math.max(0, e.life / 180);
                    ctx.fillStyle = e.color;
                    ctx.globalAlpha = alpha;
                    ctx.fillRect(Math.round(e.x), Math.round(e.y), Math.round(e.size), Math.round(e.size));
                    ctx.globalAlpha = 1.0;
                    if (e.life <= 0) s.nukeEmbers.splice(i, 1);
                }
            }

            // ----------------------------------------------------------------
            // 2. SOL
            // ----------------------------------------------------------------
            ctx.strokeStyle = 'rgba(202, 138, 4, 0.32)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(w, groundY);
            ctx.stroke();

            for (let i = 0; i < w; i += 28) {
                const seed = (i * 19) % 29;
                if (seed < 8) {
                    ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
                    ctx.fillRect(i + 6, groundY + 2, 4, 2);
                } else if (seed < 16) {
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
                    ctx.fillRect(i + 8, groundY - 3, 2, 3);
                    ctx.fillRect(i + 10, groundY - 5, 2, 5);
                }
            }

            // ----------------------------------------------------------------
            // 3. MINE ET CAISSE D'ARMES
            // ----------------------------------------------------------------
            if (s.mine.active) {
                const mineY = Math.round(groundY - 7 * 3.8);
                for (let r = 0; r < MINE_SPRITE.length; r++) {
                    const line = MINE_SPRITE[r];
                    for (let c = 0; c < line.length; c++) {
                        const ch = line[c];
                        if (ch !== '.' && MINE_PALETTE[ch]) {
                            ctx.fillStyle = ch === 'R' ? (s.walkTick % 10 < 5 ? '#ef4444' : '#fbbf24') : MINE_PALETTE[ch];
                            ctx.fillRect(Math.round(s.mine.x) + c * 3.8, mineY + r * 3.8, 3.8, 3.8);
                        }
                    }
                }

                if (!s.nukeActive) {
                    const chars = [
                        { name: 'cowboy', x: s.cowboyX + 35, powerupKey: 'cowboyPowerup', timerKey: 'cowboyPowerupTimer' },
                        { name: 'spidey', x: s.spideyX + 35, powerupKey: 'spideyPowerup', timerKey: 'spideyPowerupTimer' },
                        { name: 'kermit', x: s.kermitX + 35, powerupKey: 'kermitPowerup', timerKey: 'kermitPowerupTimer' },
                    ];

                    for (const ch of chars) {
                        if (Math.abs(ch.x - s.mine.x) < 32) {
                            s.mine.active = false;
                            s.mine.respawnTimer = 220;
                            const powerup = Math.random() < 0.5 ? 'shield' : 'ak47';
                            s[ch.powerupKey] = powerup;
                            s[ch.timerKey] = 600;

                            play8BitRetroSound(440, 880, 0.22);
                            for (let k = 0; k < 18; k++) {
                                s.battleVFX.push({
                                    x: s.mine.x + 18,
                                    y: groundY - 18,
                                    vx: (Math.random() - 0.5) * 8,
                                    vy: -2 - Math.random() * 6,
                                    color: powerup === 'shield'
                                        ? ['#38bdf8', '#0ea5e9', '#e0f2fe', '#ffffff'][k % 4]
                                        : ['#f59e0b', '#ef4444', '#b45309', '#1e293b'][k % 4],
                                    life: 25,
                                    size: 5,
                                });
                            }

                            s.battleTexts.push({
                                x: ch.x - 15,
                                y: groundY - 80,
                                text: powerup === 'shield' ? 'BOUCLIER EQUIPE !' : 'AK-47 RECUPEREE !',
                                color: powerup === 'shield' ? '#38bdf8' : '#f59e0b',
                                life: 45,
                            });

                            if (powerup === 'shield') {
                                s.speechText = ch.name === 'kermit' ? 'Bouclier grenouille active !' : ch.name === 'cowboy' ? 'Bouclier de fer active !' : 'Champ de force Spider enclenche !';
                            } else {
                                s.speechText = ch.name === 'kermit' ? 'AK-47 & CONCOMBRE ! RATATATA !' : ch.name === 'cowboy' ? 'AK-47 du Far West ! RATATATA !' : 'Arsenal Spider-Man ! RATATATA !';
                            }
                            s.speechSpeaker = ch.name;
                            s.speechTimer = 55;
                            break;
                        }
                    }
                }
            } else {
                s.mine.respawnTimer--;
                if (s.mine.respawnTimer <= 0) {
                    s.mine.active = true;
                    s.mine.x = Math.round(70 + Math.random() * (w - 140));
                }
            }

            // ----------------------------------------------------------------
            // 4. GESTION DES TIRS D'AK-47
            // ----------------------------------------------------------------
            if (!s.nukeActive) {
                const akUsers = [
                    { name: 'cowboy', x: s.cowboyX, y: Math.round(groundY - 22 * pixelScale), dir: -1, timerKey: 'cowboyPowerupTimer', powerKey: 'cowboyPowerup' },
                    { name: 'spidey', x: s.spideyX, y: Math.round(groundY - 19 * pixelScale), dir: 1, timerKey: 'spideyPowerupTimer', powerKey: 'spideyPowerup' },
                    { name: 'kermit', x: s.kermitX, y: Math.round(groundY - 18 * pixelScale), dir: -1, timerKey: 'kermitPowerupTimer', powerKey: 'kermitPowerup' },
                ];

                for (const user of akUsers) {
                    if (s[user.powerKey] === 'ak47' && s[user.timerKey] > 0) {
                        s[user.timerKey]--;
                        if (s[user.timerKey] <= 0) s[user.powerKey] = null;

                        if (s.walkTick % 16 === 0) {
                            play8BitRetroSound(320, 160, 0.08);
                            const muzzleX = user.dir === 1 ? user.x + 85 : user.x - 10;
                            const muzzleY = user.y + 40;

                            s.bulletTracers.push({
                                x: muzzleX,
                                y: muzzleY,
                                vx: user.dir * 9.5,
                                targetX: user.dir === 1 ? w + 40 : -40,
                                life: 60,
                            });

                            s.casingParticles.push({
                                x: user.x + 40,
                                y: muzzleY,
                                vx: -user.dir * (1.5 + Math.random() * 2),
                                vy: -2.5 - Math.random() * 2,
                                life: 30,
                            });

                            for (let k = 0; k < 4; k++) {
                                s.battleVFX.push({
                                    x: muzzleX,
                                    y: muzzleY,
                                    vx: user.dir * (2 + Math.random() * 3),
                                    vy: (Math.random() - 0.5) * 3,
                                    color: '#f59e0b',
                                    life: 10,
                                    size: 4,
                                });
                            }

                            if (s.walkTick % 48 === 0) {
                                s.battleTexts.push({
                                    x: user.x + 10,
                                    y: user.y - 15,
                                    text: 'RATATATA !',
                                    color: '#f59e0b',
                                    life: 25,
                                });
                            }
                        }
                    } else if (s[user.powerKey] === 'shield' && s[user.timerKey] > 0) {
                        s[user.timerKey]--;
                        if (s[user.timerKey] <= 0) s[user.powerKey] = null;
                    }
                }
            }

            for (let i = s.casingParticles.length - 1; i >= 0; i--) {
                const cp = s.casingParticles[i];
                cp.x += cp.vx;
                cp.y += cp.vy;
                cp.vy += 0.3;
                if (cp.y >= groundY - 2) {
                    cp.y = groundY - 2;
                    cp.vx *= 0.5;
                    cp.vy = 0;
                }
                cp.life--;
                ctx.fillStyle = '#eab308';
                ctx.fillRect(Math.round(cp.x), Math.round(cp.y), 3, 2);
                if (cp.life <= 0) s.casingParticles.splice(i, 1);
            }

            // ----------------------------------------------------------------
            // 5. BATTLE LOGIC SUR PLACE / NUKE
            // ----------------------------------------------------------------
            if (s.nukeActive) {
                s.snakeX = s.cowboyX + 85;
            } else if (s.fightActive) {
                s.fightTimer--;
                s.snakeX = s.cowboyX + 85;

                if (s.fightTimer > 85) {
                    s.fightPhase = 2;

                    if (s.walkTick % 4 === 0) {
                        s.kermitAttackFrame = (s.kermitAttackFrame + 1) % KERMIT_ATTACK_FRAMES.length;
                    }

                    if (s.fightTimer % 22 === 0) {
                        play8BitRetroSound(350, 720, 0.16);

                        s.cucumberProjectiles.push({
                            x: s.kermitX + (s.cowboyX > s.kermitX ? 65 : -15),
                            y: groundY - 45,
                            vx: s.cowboyX > s.kermitX ? 7.5 : -7.5,
                            vy: (Math.random() - 0.5) * 1.5,
                            targetX: s.cowboyX,
                            life: 70,
                        });

                        s.cucumberProjectiles.push({
                            x: s.kermitX + (s.spideyX > s.kermitX ? 65 : -15),
                            y: groundY - 45,
                            vx: s.spideyX > s.kermitX ? 7.5 : -7.5,
                            vy: (Math.random() - 0.5) * 1.5,
                            targetX: s.spideyX,
                            life: 70,
                        });

                        s.speechText = 'Coup de concombre supersonique ! SLAP !';
                        s.speechSpeaker = 'kermit';
                        s.speechTimer = 40;
                    }

                    if (s.fightTimer % 26 === 0) {
                        play8BitRetroSound(580, 280, 0.15);
                        s.webLines.push({
                            startX: s.spideyX + 45,
                            startY: groundY - 65,
                            targetX: s.cowboyX + 25,
                            targetY: groundY - 55,
                            life: 20,
                        });
                        s.webLines.push({
                            startX: s.spideyX + 45,
                            startY: groundY - 65,
                            targetX: s.kermitX + 25,
                            targetY: groundY - 55,
                            life: 20,
                        });
                        s.speechText = 'THWIP ! Tir de toile !';
                        s.speechSpeaker = 'spidey';
                        s.speechTimer = 40;
                    }

                    if (s.fightTimer % 24 === 0) {
                        play8BitRetroSound(260, 130, 0.18);
                        s.bulletTracers.push({
                            x: s.cowboyX + (s.spideyX > s.cowboyX ? 65 : -15),
                            y: groundY - 60,
                            vx: s.spideyX > s.cowboyX ? 8.5 : -8.5,
                            targetX: s.spideyX,
                            life: 60,
                        });
                        s.bulletTracers.push({
                            x: s.cowboyX + (s.kermitX > s.cowboyX ? 65 : -15),
                            y: groundY - 60,
                            vx: s.kermitX > s.cowboyX ? 8.5 : -8.5,
                            targetX: s.kermitX,
                            life: 60,
                        });
                        s.speechText = 'Tir rapide du Far West !';
                        s.speechSpeaker = 'cowboy';
                        s.speechTimer = 40;
                    }

                    if (s.fightTimer % 20 === 0) {
                        for (let i = 0; i < 4; i++) {
                            s.battleVFX.push({
                                x: s.snakeX,
                                y: groundY - 15,
                                vx: -3 - Math.random() * 3,
                                vy: -1 - Math.random() * 2,
                                color: '#10b981',
                                life: 20,
                                size: 4,
                            });
                        }
                    }
                } else {
                    s.fightPhase = 4;

                    if (!s.scoreAlreadyAdded) {
                        s.scoreAlreadyAdded = true;
                        if (s.chosenWinner === 'kermit') {
                            setKermitScore((k) => k + 1);
                            setStatusText('Victoire de Kermit ! Danse triomphale du concombre !');
                            s.speechText = 'YAAAAAY ! Victoire de Kermit ! Le concombre triomphe !';
                            s.speechSpeaker = 'kermit';
                            s.speechTimer = 90;
                            play8BitRetroSound(500, 1000, 0.35);
                        } else if (s.chosenWinner === 'cowboy') {
                            setCowboyScore((c) => c + 1);
                            setStatusText('Victoire du Cowboy !');
                            s.speechText = 'Victoire du Cowboy ! Le Far West triomphe.';
                            s.speechSpeaker = 'cowboy';
                            s.speechTimer = 90;
                            play8BitRetroSound(300, 700, 0.3);
                        } else {
                            setSpideyScore((sp) => sp + 1);
                            setStatusText('Victoire de Spider-Man !');
                            s.speechText = 'Victoire de Spider-Man ! Ville securisee.';
                            s.speechSpeaker = 'spidey';
                            s.speechTimer = 90;
                            play8BitRetroSound(400, 900, 0.3);
                        }
                    }
                }

                if (s.fightTimer <= 0) {
                    s.fightActive = false;
                    s.fightPhase = 0;
                    setIsFighting(false);
                    setStatusText('Patrouille active : Cowboy, Spider-Man & Kermit');
                }
            } else {
                s.cowboyX -= 1.3;
                if (s.cowboyX < -130) s.cowboyX = w + 80;

                s.spideyX += 1.15;
                if (s.spideyX > w + 90) s.spideyX = -100;

                s.kermitX -= 1.0;
                if (s.kermitX < -120) s.kermitX = w + 120;

                s.snakeX = s.cowboyX + 85;
            }

            if (s.walkTick % 6 === 0) {
                s.cowboyFrame = (s.cowboyFrame + 1) % COWBOY_FRAMES.length;
                s.spideyFrame = (s.spideyFrame + 1) % SPIDEY_FRAMES.length;
            }
            if (s.walkTick % 8 === 0) {
                s.kermitFrame = (s.kermitFrame + 1) % KERMIT_WALK_FRAMES.length;
                s.kermitDanceFrame = (s.kermitDanceFrame + 1) % KERMIT_DANCE_FRAMES.length;
            }
            if (s.walkTick % 7 === 0) {
                s.snakeFrame = (s.snakeFrame + 1) % SNAKE_FRAMES.length;
            }

            // Fumée cigarette Cowboy
            const cigX = Math.round(s.cowboyX + 2 * pixelScale);
            const cigY = Math.round(groundY - 22 * pixelScale + 8 * pixelScale);

            if (s.walkTick % 3 === 0) {
                s.smokeParticles.push({
                    x: cigX,
                    y: cigY,
                    vx: -0.6 - Math.random() * 0.7,
                    vy: -1.2 - Math.random() * 0.6,
                    size: 3.5,
                    life: 34,
                    maxLife: 34,
                });
            }

            for (let i = s.smokeParticles.length - 1; i >= 0; i--) {
                const sp = s.smokeParticles[i];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.size += 0.07;
                sp.life--;
                const alpha = Math.max(0, sp.life / sp.maxLife);
                ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.75})`;
                ctx.fillRect(Math.round(sp.x), Math.round(sp.y), Math.round(sp.size), Math.round(sp.size));
                if (sp.life <= 0) s.smokeParticles.splice(i, 1);
            }

            // Projectiles Concombre (Kermit)
            for (let i = s.cucumberProjectiles.length - 1; i >= 0; i--) {
                const cp = s.cucumberProjectiles[i];
                cp.x += cp.vx;
                cp.y += cp.vy;
                cp.life--;

                ctx.fillStyle = '#14532d';
                ctx.fillRect(Math.round(cp.x), Math.round(cp.y), 24, 12);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(Math.round(cp.x) + 2, Math.round(cp.y) + 2, 16, 8);
                ctx.fillStyle = '#86efac';
                ctx.fillRect(Math.round(cp.x) + 4, Math.round(cp.y) + 3, 10, 2);
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(Math.round(cp.x) + (cp.vx > 0 ? 18 : 0), Math.round(cp.y) + 1, 6, 10);
                ctx.fillStyle = '#fda4af';
                ctx.fillRect(Math.round(cp.x) + (cp.vx > 0 ? 21 : 1), Math.round(cp.y) + 3, 2, 6);

                if (Math.abs(cp.x - cp.targetX) < 25 || cp.life <= 0) {
                    play8BitRetroSound(350, 700, 0.12);
                    for (let k = 0; k < 8; k++) {
                        s.battleVFX.push({
                            x: cp.targetX + 30,
                            y: groundY - 50 + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            color: ['#14532d', '#22c55e', '#f43f5e', '#fda4af', '#ffffff'][k % 5],
                            life: 20,
                            size: 5,
                        });
                    }
                    s.battleTexts.push({
                        x: cp.targetX + 15,
                        y: groundY - 70,
                        text: 'SLAP !',
                        color: '#f43f5e',
                        life: 25,
                    });
                    s.cucumberProjectiles.splice(i, 1);
                }
            }

            // Balles du Cowboy
            for (let i = s.bulletTracers.length - 1; i >= 0; i--) {
                const bt = s.bulletTracers[i];
                bt.x += bt.vx;
                bt.life--;
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bt.x, bt.y || groundY - 60);
                ctx.lineTo(bt.x - bt.vx * 2, bt.y || groundY - 60);
                ctx.stroke();

                if (Math.abs(bt.x - bt.targetX) < 25 || bt.life <= 0) {
                    play8BitRetroSound(420, 180, 0.1);
                    for (let k = 0; k < 8; k++) {
                        s.battleVFX.push({
                            x: bt.targetX + 30,
                            y: groundY - 50 + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            color: ['#fbbf24', '#f59e0b', '#ef4444', '#ffffff'][k % 4],
                            life: 20,
                            size: 5,
                        });
                    }
                    s.battleTexts.push({
                        x: bt.targetX + 15,
                        y: groundY - 70,
                        text: 'BANG !',
                        color: '#f59e0b',
                        life: 25,
                    });
                    s.bulletTracers.splice(i, 1);
                }
            }

            // Toiles Spider-Man
            for (let i = s.webLines.length - 1; i >= 0; i--) {
                const wl = s.webLines[i];
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(wl.startX, wl.startY);
                ctx.lineTo(wl.targetX, wl.targetY);
                ctx.stroke();
                ctx.setLineDash([]);
                wl.life--;
                if (wl.life === 1) {
                    s.battleTexts.push({
                        x: wl.targetX + 15,
                        y: groundY - 70,
                        text: 'THWIP !',
                        color: '#60a5fa',
                        life: 25,
                    });
                    for (let k = 0; k < 8; k++) {
                        s.battleVFX.push({
                            x: wl.targetX + 30,
                            y: groundY - 50 + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            color: ['#ffffff', '#60a5fa', '#93c5fd'][k % 3],
                            life: 20,
                            size: 4,
                        });
                    }
                }
                if (wl.life <= 0) s.webLines.splice(i, 1);
            }

            // Textes flottants
            for (let i = s.battleTexts.length - 1; i >= 0; i--) {
                const bt = s.battleTexts[i];
                bt.y -= 0.6;
                bt.life--;
                ctx.fillStyle = bt.color;
                ctx.font = 'bold 16px monospace';
                ctx.fillText(bt.text, bt.x, bt.y);
                if (bt.life <= 0) s.battleTexts.splice(i, 1);
            }

            const drawShieldDome = (cx, cy, color) => {
                const radius = 54;
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = color.replace(')', ', 0.12)').replace('rgb', 'rgba').replace('#38bdf8', 'rgba(56, 189, 248, 0.12)');
                ctx.fill();
                for (let a = 0; a < 3; a++) {
                    const angle = (s.walkTick * 0.06) + (a * (Math.PI * 2 / 3));
                    const nx = cx + Math.cos(angle) * radius;
                    const ny = cy + Math.sin(angle) * radius;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(nx - 3, ny - 3, 6, 6);
                }
                ctx.restore();
            };

            const drawAK47 = (x, y, dir) => {
                const sprite = dir === 1 ? AK47_SPRITE_R : AK47_SPRITE_L;
                const akScale = 3.6;
                for (let r = 0; r < sprite.length; r++) {
                    const line = sprite[r];
                    for (let c = 0; c < line.length; c++) {
                        const ch = line[c];
                        if (ch !== '.' && AK47_PALETTE[ch]) {
                            ctx.fillStyle = AK47_PALETTE[ch];
                            ctx.fillRect(Math.round(x) + c * akScale, y + r * akScale, akScale, akScale);
                        }
                    }
                }
            };

            // ----------------------------------------------------------------
            // 6. RENDU DES PERSONNAGES
            // ----------------------------------------------------------------

            // Spider-Man
            const spideyY = Math.round(groundY - 19 * pixelScale);
            let spideySprite = SPIDEY_FRAMES[s.spideyFrame];
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                spideySprite = s.nukeLauncher === 'spidey' ? SPIDEY_SHOOT : SPIDEY_KO;
            } else if (s.fightPhase === 2) {
                spideySprite = SPIDEY_SHOOT;
            } else if (s.fightPhase === 4) {
                spideySprite = s.chosenWinner === 'spidey' ? SPIDEY_SHOOT : SPIDEY_KO;
            }

            for (let r = 0; r < spideySprite.length; r++) {
                const line = spideySprite[r];
                for (let c = 0; c < line.length; c++) {
                    const ch = line[c];
                    if (ch !== '.' && SPIDEY_PALETTE[ch]) {
                        ctx.fillStyle = SPIDEY_PALETTE[ch];
                        ctx.fillRect(Math.round(s.spideyX) + c * pixelScale, spideyY + r * pixelScale, pixelScale, pixelScale);
                    }
                }
            }
            if (s.spideyPowerup === 'shield' && !s.nukeActive) {
                drawShieldDome(s.spideyX + 45, spideyY + 45, '#38bdf8');
            }
            if (s.spideyPowerup === 'ak47' && !s.nukeActive) {
                drawAK47(s.spideyX + 35, spideyY + 30, 1);
            }

            // Kermit the Frog
            const kermitY = Math.round(groundY - 18 * pixelScale);
            let kermitSprite = KERMIT_WALK_FRAMES[s.kermitFrame];
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                kermitSprite = s.nukeLauncher === 'kermit' ? KERMIT_DANCE_FRAMES[s.kermitDanceFrame] : KERMIT_KO;
            } else if (s.fightPhase === 2) {
                kermitSprite = KERMIT_ATTACK_FRAMES[s.kermitAttackFrame];
            } else if (s.fightPhase === 4) {
                kermitSprite = s.chosenWinner === 'kermit' ? KERMIT_DANCE_FRAMES[s.kermitDanceFrame] : KERMIT_KO;
            }

            for (let r = 0; r < kermitSprite.length; r++) {
                const line = kermitSprite[r];
                for (let c = 0; c < line.length; c++) {
                    const ch = line[c];
                    if (ch !== '.' && KERMIT_PALETTE[ch]) {
                        ctx.fillStyle = KERMIT_PALETTE[ch];
                        ctx.fillRect(Math.round(s.kermitX) + c * pixelScale, kermitY + r * pixelScale, pixelScale, pixelScale);
                    }
                }
            }
            if (s.kermitPowerup === 'shield' && !s.nukeActive) {
                drawShieldDome(s.kermitX + 45, kermitY + 45, '#84cc16');
            }
            if (s.kermitPowerup === 'ak47' && !s.nukeActive) {
                drawAK47(s.kermitX - 15, kermitY + 28, -1);
            }

            // Cowboy
            const cowboyY = Math.round(groundY - 22 * pixelScale);
            let cowboySprite = COWBOY_FRAMES[s.cowboyFrame];
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                cowboySprite = s.nukeLauncher === 'cowboy' ? COWBOY_SHOOT : COWBOY_KO;
            } else if (s.fightPhase === 2) {
                cowboySprite = COWBOY_SHOOT;
            } else if (s.fightPhase === 4) {
                cowboySprite = s.chosenWinner === 'cowboy' ? COWBOY_SHOOT : COWBOY_KO;
            }

            for (let r = 0; r < cowboySprite.length; r++) {
                const line = cowboySprite[r];
                for (let c = 0; c < line.length; c++) {
                    const ch = line[c];
                    if (ch !== '.' && COWBOY_PALETTE[ch]) {
                        ctx.fillStyle = ch === 'F' ? (s.walkTick % 6 < 3 ? '#ff2200' : '#f97316') : COWBOY_PALETTE[ch];
                        ctx.fillRect(Math.round(s.cowboyX) + c * pixelScale, cowboyY + r * pixelScale, pixelScale, pixelScale);
                    }
                }
            }
            if (s.cowboyPowerup === 'shield' && !s.nukeActive) {
                drawShieldDome(s.cowboyX + 45, cowboyY + 50, '#fbbf24');
            }
            if (s.cowboyPowerup === 'ak47' && !s.nukeActive) {
                drawAK47(s.cowboyX - 15, cowboyY + 38, -1);
            }

            // Serpent
            const snakeSprite = SNAKE_FRAMES[s.snakeFrame];
            const snakeY = Math.round(groundY - 5 * pixelScale);
            for (let r = 0; r < snakeSprite.length; r++) {
                const line = snakeSprite[r];
                for (let c = 0; c < line.length; c++) {
                    const ch = line[c];
                    if (ch !== '.' && SNAKE_PALETTE[ch]) {
                        ctx.fillStyle = SNAKE_PALETTE[ch];
                        ctx.fillRect(Math.round(s.snakeX) + c * pixelScale, snakeY + r * pixelScale, pixelScale, pixelScale);
                    }
                }
            }

            // Particules VFX
            for (let i = s.battleVFX.length - 1; i >= 0; i--) {
                const p = s.battleVFX[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                ctx.fillStyle = p.color;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
                if (p.life <= 0) s.battleVFX.splice(i, 1);
            }

            if (s.nukeFlashAlpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.nukeFlashAlpha})`;
                ctx.fillRect(0, 0, w, h);
            }

            if (s.nukeActive && s.nukePhase === 1) {
                const isRedTick = s.walkTick % 16 < 8;
                ctx.fillStyle = isRedTick ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.08)';
                ctx.fillRect(0, 0, w, h);

                ctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
                ctx.fillRect(0, 0, w, 28);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('ALERTE : FRAPPE NUCLEAIRE TACTIQUE IMMINENTE', w / 2, 19);
                ctx.textAlign = 'start';
            }

            ctx.restore();

            // Dialogue
            if (s.speechTimer > 0) {
                s.speechTimer--;
                let speakerX = s.cowboyX + 45;
                if (s.speechSpeaker === 'spidey') speakerX = s.spideyX + 45;
                if (s.speechSpeaker === 'kermit') speakerX = s.kermitX + 45;

                setBubble({
                    text: s.speechText,
                    visible: true,
                    x: Math.min(w - 150, Math.max(150, speakerX)),
                    y: Math.max(14, groundY - 22 * pixelScale - 26),
                });
            } else {
                setBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', updateSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return {
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
    };
}
