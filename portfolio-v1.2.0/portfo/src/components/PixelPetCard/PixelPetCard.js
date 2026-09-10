import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PixelPetCard.css';

// ---------------------------------------------------------------------------
// PIXEL ART SPRITES - COWBOY, SPIDER-MAN, KERMIT & SERPENT
// (Strictement aucun emoji - Rendu graphique pixel-art pur)
// ---------------------------------------------------------------------------

// 1. COWBOY PALETTE & FRAMES
const COWBOY_PALETTE = {
    H: '#854d0e', // Hat Crown
    h: '#ca8a04', // Hat Brim / Highlight
    b: '#451a03', // Hat Band / Belt
    S: '#fed7aa', // Skin
    D: '#f59e0b', // Stubble
    E: '#090d16', // Eyes
    F: '#ef4444', // Burning Cigarette Ember
    K: '#ffffff', // Cigarette Paper / Web
    R: '#dc2626', // Red Bandana
    r: '#991b1b', // Bandana shadow
    V: '#78350f', // Leather Vest
    T: '#f8fafc', // Shirt
    J: '#1e3a8a', // Denim Jeans
    B: '#451a03', // Boots
    s: '#cbd5e1', // Silver Spur
};

const COWBOY_WALK_0 = [
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SSESSSES.......',
    '..FK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '.....RRRRrRRR.......',
    '....VVTTTTTTTVV.....',
    '...VVVTTTTTTTVVV....',
    '...VVVTTbbTTVVV.....',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '.....JJ....JJ.......',
    '....JJJ....JJJ......',
    '....JJ......JJ......',
    '...JJ........JJ.....',
    '...BB........BB.....',
    '...BBs......BBs.....',
    '....................',
];

const COWBOY_WALK_1 = [
    '....................',
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SSESSSES.......',
    '..FK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '.....RRRRrRRR.......',
    '....VVTTTTTTTVV.....',
    '...VVVTTTTTTTVVV....',
    '...VVVTTbbTTVVV.....',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '......JJJJJJ........',
    '......JJJJJJ........',
    '......JJ..JJ........',
    '......BB..BB........',
    '......BBs.BBs.......',
    '....................',
];

const COWBOY_WALK_2 = [
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SSESSSES.......',
    '..FK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '.....RRRRrRRR.......',
    '....VVTTTTTTTVV.....',
    '...VVVTTTTTTTVVV....',
    '...VVVTTbbTTVVV.....',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '.....JJ....JJ.......',
    '....JJJ....JJJ......',
    '...JJ........JJ.....',
    '..JJ..........JJ....',
    '..BB..........BB....',
    '..BBs........BBs....',
    '....................',
];

const COWBOY_WALK_3 = [
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SSESSSES.......',
    '..FK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '.....RRRRrRRR.......',
    '....VVTTTTTTTVV.....',
    '...VVVTTTTTTTVVV....',
    '...VVVTTbbTTVVV.....',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '......JJJJJJ........',
    '......JJJJJJ........',
    '......JJ..JJ........',
    '......JJ..JJ........',
    '......BB..BB........',
    '......BBs.BBs.......',
    '....................',
];

const COWBOY_SHOOT = [
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SSESSSES.......',
    '..FK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '....RVVTTTTTTV......',
    '.SSVVVVTbbTTVVVVSS..',
    '.SSVVVVTbbTTVVVVSS..',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '....JJJJ..JJJJ......',
    '...JJJ......JJJ.....',
    '...BB........BB.....',
    '..BBs........BBs....',
    '....................',
    '....................',
    '....................',
    '....................',
];

const COWBOY_KO = [
    '....................',
    '......HHHHHH........',
    '.....HHHHHHHH.......',
    '.....bbbbbbbb.......',
    '...hhhhhhhhhhhh.....',
    '.hhhhhhhhhhhhhhhh...',
    '.....SSSSSSSS.......',
    '.....SEESEEES.......',
    '..KK.SSSDDDSS.......',
    '...K.SSDDDDSS.......',
    '.....RRRRRRRR.......',
    '....KVKTTTTTTKV.....',
    '...VKVTKTTTTTVKK....',
    '...VKKTTbbTTVKK.....',
    '....VVTTbbTTVV......',
    '.....JJJJJJJJ.......',
    '......JJJJJJ........',
    '......JJ..JJ........',
    '......JJ..JJ........',
    '......BB..BB........',
    '......BBs.BBs.......',
    '....................',
    '....................',
];

// 2. SPIDER-MAN PALETTE & FRAMES
const SPIDEY_PALETTE = {
    R: '#ef4444',
    r: '#b91c1c',
    U: '#2563eb',
    u: '#1d4ed8',
    W: '#ffffff',
    E: '#090d16',
};

const SPIDEY_WALK_0 = [
    '.....rRRRRr.........',
    '....rRRRRRRr........',
    '...rRRWWRWWRr.......',
    '...rRREEREEEr.......',
    '....rRRRRRRr........',
    '.....rERRERr........',
    '...rRRERRERRr.......',
    '..rRRRERRERRRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '...rRUUUUUURr.......',
    '.....UUUUUU.........',
    '.....UU..UU.........',
    '....UUU..UUU........',
    '....UU....UU........',
    '...rRR....rRR.......',
    '...rRR....rRR.......',
    '...rRR....rRR.......',
    '....................',
    '....................',
    '....................',
    '....................',
];

const SPIDEY_WALK_1 = [
    '....................',
    '.....rRRRRr.........',
    '....rRRRRRRr........',
    '...rRRWWRWWRr.......',
    '...rRREEREEEr.......',
    '....rRRRRRRr........',
    '.....rERRERr........',
    '...rRRERRERRr.......',
    '..rRRRERRERRRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '...rRUUUUUURr.......',
    '.....UUUUUU.........',
    '......UUUU..........',
    '......UUUU..........',
    '.....rRRRRr.........',
    '.....rRRRRr.........',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

const SPIDEY_WALK_2 = [
    '.....rRRRRr.........',
    '....rRRRRRRr........',
    '...rRRWWRWWRr.......',
    '...rRREEREEEr.......',
    '....rRRRRRRr........',
    '.....rERRERr........',
    '...rRRERRERRr.......',
    '..rRRRERRERRRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '...rRUUUUUURr.......',
    '.....UUUUUU.........',
    '.....UU..UU.........',
    '....UU....UU........',
    '...UUU....UUU.......',
    '..rRR......rRR......',
    '..rRR......rRR......',
    '..rRR......rRR......',
    '....................',
    '....................',
    '....................',
    '....................',
];

const SPIDEY_SHOOT = [
    '.....rRRRRr.........',
    '....rRRRRRRr........',
    '...rRRWWRWWRr.......',
    '...rRREEREEEr.......',
    '....rRRRRRRr...rRRW.',
    '.....rERRERr.rRRRRR.',
    '...rRRERRERRRRRRR...',
    '..rRRRERRERRr.......',
    '..rRRUUUUUURr.......',
    '..rRRUUUUUURr.......',
    '...rRUUUUUURr.......',
    '.....UUUUUU.........',
    '....UUUUUUUU........',
    '...UUU....UUU.......',
    '...UU......UU.......',
    '..rRR......rRR......',
    '..rRR......rRR......',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

const SPIDEY_KO = [
    '....................',
    '.....rRRRRr.........',
    '....rRRRRRRr........',
    '...rRREEEEEEr.......',
    '...rRREEREEEr.......',
    '....rRRRRRRr........',
    '.....rERRERr........',
    '...rRRERRERRr.......',
    '..rRRRERRERRRr......',
    '..rRRUUUUUURRr......',
    '..rRRUUUUUURRr......',
    '...rRUUUUUURr.......',
    '.....UUUUUU.........',
    '......UUUU..........',
    '......UUUU..........',
    '.....rRRRRr.........',
    '.....rRRRRr.........',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

// 3. KERMIT THE FROG PALETTE & FRAMES
const KERMIT_PALETTE = {
    K: '#84cc16', // Frog Skin Lime
    k: '#65a30d', // Skin Shadow
    C: '#bef264', // Collar Pale Lime
    W: '#ffffff', // Big Eyes
    E: '#090d16', // Pupil
    X: '#ef4444', // KO eye cross
    M: '#dc2626', // Open Mouth
    Q: '#14532d', // Dark Contour Outline
    q: '#22c55e', // Thick Shaft Body
    v: '#86efac', // Shaft Veins & Texture Highlights
    B: '#15803d', // Testicules / Base
    b: '#052e16', // Testicules Shadow
    P: '#f43f5e', // Gland / Couronne (Glans Crown)
    p: '#fda4af', // Gland Highlight (Glans Tip)
    O: '#be123c', // Méat Urinaire / Slit
};

const KERMIT_WALK_0 = [
    '....WWW..WWW........',
    '....WEW..WEW........',
    '...KKWWKKWWKK.......',
    '..KKKKKKKKKKKK......',
    '..KKKMMMMMMKKK......',
    '..KKKMMMMMMKKK......',
    '...KKKKKKKKKK.......',
    '....CCCCCCCC........',
    '.....KKKKKK.........',
    '....KKKKKKKK........',
    '...KK.KKKK.KK.......',
    '...KK.KKKK.KK.......',
    '......KKKK..........',
    '......KKKK..........',
    '.....KK..KK.........',
    '....KK....KK........',
    '....KK....KK........',
    '...KKK....KKK.......',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

const KERMIT_WALK_1 = [
    '....................',
    '....WWW..WWW........',
    '....WEW..WEW........',
    '...KKWWKKWWKK.......',
    '..KKKKKKKKKKKK......',
    '..KKKMMMMMMKKK......',
    '...KKKKKKKKKK.......',
    '....CCCCCCCC........',
    '.....KKKKKK.........',
    '....KKKKKKKK........',
    '...KK.KKKK.KK.......',
    '...KK.KKKK.KK.......',
    '......KKKK..........',
    '.....KK..KK.........',
    '.....KK..KK.........',
    '....KKK..KKK........',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

// Kermit Attaques au pénis épais & réaliste (Érection massive, testicules sculptés, veines & gland détaillé)
const KERMIT_ATTACK_0 = [
    '....WWW..WWW.........................',
    '....WEW..WEW.........................',
    '...KKWWKKWWKK........................',
    '..KKKKKKKKKKKK.......................',
    '..KKKMMMMMMKKK.......................',
    '..KKKMMMMMMKKK..................PPp..',
    '...KKKKKKKKKK..................PPPp..',
    '....CCCCCCCC..................PPOp...',
    '.....KKKKKK..................QQvQ....',
    '....KKKKKKKK................QQqqQ....',
    '...KK.KKKK.KK..............QQvvQ.....',
    '...KK.KKKK.KK.............QQqqQ......',
    '......KKKK...............QQvvQ.......',
    '......KKBB..............QQqqQ........',
    '.....KKBBBB............QQvvQ.........',
    '....KK.BBBB...........QQqqQ..........',
    '....KK..bb...........QQvvQ............',
    '...KKK....KKK.....QQqqQ..............',
    '................QQQQQ................',
    '.....................................',
    '.....................................',
    '.....................................',
    '.....................................',
    '.....................................',
];

const KERMIT_ATTACK_1 = [
    '....WWW..WWW........................................',
    '....WEW..WEW........................................',
    '...KKWWKKWWKK.......................................',
    '..KKKKKKKKKKKK......................................',
    '..KKKMMMMMMKKK......................................',
    '..KKKMMMMMMKKK......................................',
    '...KKKKKKKKKK.......................................',
    '....CCCCCCCC........................................',
    '.....KKKKKK.........................................',
    '....KKKKKKKK........................................',
    '...KK.KKKK.KK.......................................',
    '...KK.KKKK.KK.......................................',
    '......KKKK.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQPPPPP...',
    '......KKBB....QvvvvvvqqqqqqvvvvvvqqqqqqvvvvvPPPPp...',
    '.....KKBBBB..QqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqPPOPp...',
    '....KK.BBBB...QvvvvvvqqqqqqvvvvvvqqqqqqvvvvvPPPPp...',
    '....KK..bb.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQPPPPP...',
    '...KKK....KKK.......................................',
    '....................................................',
    '....................................................',
    '....................................................',
    '....................................................',
    '....................................................',
    '....................................................',
];

const KERMIT_ATTACK_2 = [
    '....WWW..WWW.........................',
    '....WEW..WEW.........................',
    '...KKWWKKWWKK........................',
    '..KKKKKKKKKKKK.......................',
    '..KKKMMMMMMKKK.......................',
    '..KKKMMMMMMKKK.......................',
    '...KKKKKKKKKK........................',
    '....CCCCCCCC.........................',
    '.....KKKKKK..........................',
    '....KKKKKKKK.........................',
    '...KK.KKKK.KK........................',
    '...KK.KKKK.KK........................',
    '......KKKK...........................',
    '......KKBB..QQQQ.....................',
    '.....KKBBBBQvvvqQ....................',
    '....KK.BBBB.QqqqvQ...QQQQ............',
    '....KK..b....QvvvqQ.QvvvqQ...........',
    '...KKK....KKK.QqqqvQQqqqvQ...PPPPP...',
    '...............QvvvvvvvvvqQ.PPPPp....',
    '................QQQQqqqqqvQQPPOPp....',
    '....................QQQQQQ..PPPPp....',
    '.............................PPPPP...',
    '.....................................',
    '.....................................',
];

const KERMIT_ATTACK_3 = [
    '....WWW..WWW..................................',
    '....WEW..WEW..................................',
    '...KKWWKKWWKK.................................',
    '..KKKKKKKKKKKK................................',
    '..KKKMMMMMMKKK................................',
    '..KKKMMMMMMKKK................................',
    '...KKKKKKKKKK.................................',
    '....CCCCCCCC..................................',
    '.....KKKKKK...................................',
    '....KKKKKKKK...................QQQQPPPPP......',
    '...KK.KKKK.KK.................QvvvvPPPPp......',
    '...KK.KKKK.KK.....QQQQQQQQQQQQqqqqqPPOPp......',
    '......KKKK.......QvvvvvvqqqqqqvvvvvPPPPp......',
    '......KKBB......QqqqqqqqqqqqqqqqqqqPPPPp......',
    '.....KKBBBB.....QvvvvvvqqqqqqvvvvvPPPPP.......',
    '....KK.BBBB......QQQQQQQQQQQQQQQQQ............',
    '....KK..bb....................................',
    '...KKK....KKK.................................',
    '..............................................',
    '..............................................',
    '..............................................',
    '..............................................',
    '..............................................',
    '..............................................',
];

// Kermit Danse de la Victoire (Wild flailing arms)
const KERMIT_DANCE_0 = [
    '..KK..........KK....',
    '...KK.WWW..WWW.KK...',
    '....K.WEW..WEW.K....',
    '....KKWWKKWWKK......',
    '...KKKKKKKKKKKK.....',
    '...KKKMMMMMMKKK.....',
    '...KKKMMMMMMKKK.....',
    '....CCCCCCCC........',
    '.....KKKKKK.........',
    '....KKKKKKKK........',
    '......KKKK..........',
    '.....KK..KK.........',
    '....KK....KK........',
    '...KKK....KKK.......',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

const KERMIT_DANCE_1 = [
    '...KK........KK.....',
    '..KK..WWW..WWW.KK...',
    '...K..WEW..WEW..K...',
    '....KKWWKKWWKK......',
    '...KKKKKKKKKKKK.....',
    '...KKKMMMMMMKKK.....',
    '...KKKMMMMMMKKK.....',
    '....CCCCCCCC........',
    '.....KKKKKK.........',
    '....KKKKKKKK........',
    '......KKKK..........',
    '.....KKKKKK.........',
    '....KKK..KKK........',
    '...KKK....KKK.......',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

const KERMIT_KO = [
    '....................',
    '....WWW..WWW........',
    '....XEX..XEX........',
    '...KKWWKKWWKK.......',
    '..KKKKKKKKKKKK......',
    '...KKKKKKKKKK.......',
    '....CCCCCCCC........',
    '.....KKKKKK.........',
    '....KKKKKKKK........',
    '...KK.KKKK.KK.......',
    '......KKKK..........',
    '.....KK..KK.........',
    '....KKK..KKK........',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
];

// 4. SERPENT PALETTE & FRAMES
const SNAKE_PALETTE = {
    G: '#10b981',
    g: '#047857',
    Y: '#fbbf24',
    R: '#ef4444',
    E: '#090d16',
};

const SNAKE_FRAME_0 = [
    '....GGGG............',
    '..GGEYEGGG....GGG...',
    '.GGRRGGGGGG..GGgGG..',
    '.GGGG..GGGGGGGG.GGG.',
    '.gggg...gggggg...gg.',
    '....................',
];

const SNAKE_FRAME_1 = [
    '...RR...............',
    '..GGGGGG............',
    '..GGEYEGGG...GGgGG..',
    '.GGGG..GGGGGGGG.GGG.',
    '.gggg...gggggg...gg.',
    '....................',
];

const SNAKE_FRAME_2 = [
    '..RR................',
    '.GGEYEGG............',
    '.GGGGGGG....GGgGG...',
    '..GGGGGGGGGGGG.GGG..',
    '...gggg.ggggg...gg..',
    '....................',
];

// 5. MINE / MYSTERY BOX SPRITE & PALETTE
const MINE_PALETTE = {
    R: '#ef4444',
    r: '#991b1b',
    Y: '#f59e0b',
    y: '#78350f',
    G: '#1e293b',
    W: '#ffffff',
};

const MINE_SPRITE = [
    '....RR....',
    '...RRRR...',
    '..GGGGGG..',
    '.GYYYYYYG.',
    '.GYrYYrYG.',
    'GGGGGGGGGG',
    'GyyyyGyyyy',
];

// 6. AK-47 ASSAULT RIFLE SPRITES (Facing Left & Right)
const AK47_PALETTE = {
    G: '#1e293b',
    g: '#475569',
    W: '#92400e',
    w: '#b45309',
    M: '#d97706',
    F: '#f59e0b',
    f: '#ef4444',
};

const AK47_SPRITE_R = [
    '..................GG..',
    'WWWW.GGGGGGGGGGGGGGG.',
    'WWWW.GgggggGgGgGGG.FF',
    '.WWW..G..MM..GGG...ff',
    '......G..MM...........',
    '........MM............',
];

const AK47_SPRITE_L = [
    '..GG..................',
    '.GGGGGGGGGGGGGGG.WWWW.',
    'FF.GGGgGgGgggggG.WWWW.',
    'ff...GGG..MM..G..WWW..',
    '...........MM..G......',
    '............MM........',
];

// 7. BACKGROUND DECOR - CACTUS
const CACTUS_PALETTE = {
    G: '#065f46',
    g: '#047857',
    L: '#10b981',
};

const CACTUS_SPRITE = [
    '....GG....',
    '....GL....',
    '.GG.GL.GG.',
    '.GL.GL.GL.',
    '.GL.GL.GL.',
    '.GLGGLLGL.',
    '..GGGLLG..',
    '....GL....',
    '....GL....',
    '....GL....',
    '....GL....',
    '....GG....',
];

function play8BitRetroSound(freqStart, freqEnd, duration = 0.15) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
    } catch (_) {}
}

function playNukeSirenSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.28);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.56);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.62);
    } catch (_) {}
}

function playNukeExplosionSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        
        // Synthèse bruit blanc pour le souffle de la détonation
        const bufferSize = ctx.sampleRate * 0.9;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.85);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();

        // Sub bass oscillator pour l'impact tellurique
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.85);
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
    } catch (_) {}
}

export default function PixelPetCard() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Compteurs de victoires (Coin supérieur gauche)
    const [cowboyScore, setCowboyScore] = useState(0);
    const [spideyScore, setSpideyScore] = useState(0);
    const [kermitScore, setKermitScore] = useState(0);

    // Compte à rebours du combat auto (60s)
    const [battleCountdown, setBattleCountdown] = useState(60);
    const [isFighting, setIsFighting] = useState(false);
    const [isNukeRunning, setIsNukeRunning] = useState(false);
    const [statusText, setStatusText] = useState('Patrouille active : Cowboy, Spider-Man & Kermit');

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
        clouds: [
            { x: 40, y: 22, w: 65, h: 14, speed: 0.22 },
            { x: 280, y: 42, w: 90, h: 18, speed: 0.16 },
            { x: 560, y: 18, w: 55, h: 12, speed: 0.28 },
        ],
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

    const [bubble, setBubble] = useState({ text: '', visible: false, x: 0, y: 0 });

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

        // Annuler tout combat en cours au profit de la nuke
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

    // Fonction de déclenchement du combat (Choix aléatoire du vainqueur, combat sur place sans téléportation)
    const startBattle = useCallback(() => {
        const s = stateRef.current;
        if (s.fightActive || s.nukeActive) return;

        // Choix aléatoire équitable du gagnant (33% chacun)
        const rand = Math.random();
        const winner = rand < 0.34 ? 'cowboy' : rand < 0.67 ? 'spidey' : 'kermit';

        s.fightActive = true;
        s.fightPhase = 2; // Combat immédiat à distance
        s.fightTimer = 360; // ~6 secondes
        s.chosenWinner = winner;
        s.scoreAlreadyAdded = false;

        setIsFighting(true);
        setBattleCountdown(60);
        setStatusText('Mêlée générale : Combat sur place !');

        play8BitRetroSound(220, 660, 0.22);

        s.speechText = 'Combat général ! Kermit dégaine son concombre !';
        s.speechTimer = 75;
        s.speechSpeaker = 'kermit';
    }, []);

    // Compte à rebours automatique de 60 secondes
    useEffect(() => {
        const timer = setInterval(() => {
            setBattleCountdown((prev) => {
                if (prev <= 1) {
                    startBattle();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [startBattle]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 240;
            if (stateRef.current.cowboyX === 0) {
                stateRef.current.cowboyX = rect.width - 130;
                stateRef.current.spideyX = -60;
                stateRef.current.kermitX = rect.width / 2;
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        const cowboyFrames = [COWBOY_WALK_0, COWBOY_WALK_1, COWBOY_WALK_2, COWBOY_WALK_3];
        const spideyFrames = [SPIDEY_WALK_0, SPIDEY_WALK_1, SPIDEY_WALK_2, SPIDEY_WALK_1];
        const kermitFrames = [KERMIT_WALK_0, KERMIT_WALK_1];
        const kermitAttackFrames = [KERMIT_ATTACK_0, KERMIT_ATTACK_1, KERMIT_ATTACK_2, KERMIT_ATTACK_3];
        const kermitDanceFrames = [KERMIT_DANCE_0, KERMIT_DANCE_1];
        const snakeFrames = [SNAKE_FRAME_0, SNAKE_FRAME_1, SNAKE_FRAME_2, SNAKE_FRAME_1];

        const render = () => {
            const s = stateRef.current;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Alignement parfait sur la ligne du bas (groundY)
            const groundY = h - 14;
            const pixelScale = 4.8;

            s.walkTick++;

            // ----------------------------------------------------------------
            // 0. LOGIQUE DE LA NUKE TACTIQUE
            // ----------------------------------------------------------------
            if (s.nukeActive) {
                s.nukeTimer--;

                // Phase 1 : Alerte Sirène
                if (s.nukePhase === 1) {
                    if (s.nukeTimer % 20 === 0) {
                        playNukeSirenSound();
                    }
                    if (s.nukeTimer <= 0) {
                        s.nukePhase = 2;
                        s.nukeTimer = 220;
                        s.nukeFlashAlpha = 1.0;
                        playNukeExplosionSound();

                        // Remise à 0 des scores des adversaires (Le lanceur garde son score)
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

                        // Génération des ondes de choc
                        s.nukeShockwaves.push({ radius: 10, maxRadius: w * 0.9, speed: 12, alpha: 1 });
                        s.nukeShockwaves.push({ radius: 5, maxRadius: w * 0.7, speed: 8, alpha: 0.85 });

                        // Particules du nuage champignon
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

                        // Braises incandescentes retombant
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
                }
                // Phase 2 : Explosion & Champignon Nucléaire
                else if (s.nukePhase === 2) {
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
                }
                // Phase 3 : Dissipation & Triomphe
                else if (s.nukePhase === 3) {
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
            // Collines lointaines
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

            // Collines rapprochées
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

            // Nuages en mouvement
            for (let i = 0; i < s.clouds.length; i++) {
                const c = s.clouds[i];
                c.x += c.speed;
                if (c.x > w + 80) c.x = -90;
                ctx.fillStyle = 'rgba(226, 232, 240, 0.18)';
                ctx.fillRect(Math.round(c.x), c.y, c.w, c.h);
                ctx.fillRect(Math.round(c.x) + 8, c.y - 5, c.w - 16, c.h + 5);
            }

            // Cactus du décor
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
            // EFFETS VISUELS DU CHAMPIGNON NUCLÉAIRE (NUKE TACTIQUE)
            // ----------------------------------------------------------------
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                const cx = w / 2;
                const progress = Math.min(1, (220 - s.nukeTimer) / 100);

                // 1. Tronc / Colonne de flammes centrale montante
                const columnHeight = Math.min(140, progress * 150);
                const columnWidth = 32 + Math.sin(s.walkTick * 0.2) * 4;
                
                for (let py = groundY; py >= groundY - columnHeight; py -= 8) {
                    const yNorm = (groundY - py) / (columnHeight || 1);
                    const curW = columnWidth * (1 - yNorm * 0.3);
                    const colFlicker = (s.walkTick + py) % 4;
                    ctx.fillStyle = colFlicker === 0 ? '#fef08a' : colFlicker === 1 ? '#f97316' : colFlicker === 2 ? '#ef4444' : '#1e293b';
                    ctx.fillRect(Math.round(cx - curW / 2 + (Math.random() - 0.5) * 4), py, Math.round(curW), 8);
                }

                // 2. Chapeau de champignon (Billowing Mushroom Cap)
                const capY = groundY - columnHeight;
                const capRadiusX = Math.min(85, progress * 95);
                const capRadiusY = Math.min(48, progress * 54);

                // Dôme sombre extérieur (Fumée & Cendres)
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.ellipse(cx, capY, capRadiusX, capRadiusY, 0, 0, Math.PI * 2);
                ctx.fill();

                // Dôme de feu intermédiaire
                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.ellipse(cx, capY + 4, capRadiusX * 0.82, capRadiusY * 0.78, 0, 0, Math.PI * 2);
                ctx.fill();

                // Coeur incandescent nucléaire
                const coreFlicker = s.walkTick % 3 === 0 ? '#fffbeb' : '#fde047';
                ctx.fillStyle = coreFlicker;
                ctx.beginPath();
                ctx.ellipse(cx, capY + 8, capRadiusX * 0.55, capRadiusY * 0.52, 0, 0, Math.PI * 2);
                ctx.fill();

                // Anneau de fumée torique autour du col
                ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
                ctx.beginPath();
                ctx.ellipse(cx, groundY - columnHeight * 0.45, columnWidth * 1.3, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                // 3. Ondes de choc au sol
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

                // 4. Particules du nuage champignon
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

                // 5. Braises incandescentes retombant
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
            // 2. LIGNE DU BAS & SOL (Graviers et herbes)
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
            // 3. MINE ALÉATOIRE FRÉQUENTE & RAMASSAGE (BOUCLIER OU AK-47)
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

                // Détection de collision (désactivée pendant la nuke)
                if (!s.nukeActive) {
                    const chars = [
                        { name: 'cowboy', x: s.cowboyX + 35, powerupKey: 'cowboyPowerup', timerKey: 'cowboyPowerupTimer' },
                        { name: 'spidey', x: s.spideyX + 35, powerupKey: 'spideyPowerup', timerKey: 'spideyPowerupTimer' },
                        { name: 'kermit', x: s.kermitX + 35, powerupKey: 'kermitPowerup', timerKey: 'kermitPowerupTimer' },
                    ];

                    for (const ch of chars) {
                        if (Math.abs(ch.x - s.mine.x) < 32) {
                            s.mine.active = false;
                            s.mine.respawnTimer = 220; // ~4s respawn
                            const powerup = Math.random() < 0.5 ? 'shield' : 'ak47';
                            s[ch.powerupKey] = powerup;
                            s[ch.timerKey] = 600; // ~10s duration

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
            // 4. GESTION DES TIRS D'AK-47 (RATATATA !)
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

                            // Balle tracer rapide
                            s.bulletTracers.push({
                                x: muzzleX,
                                y: muzzleY,
                                vx: user.dir * 9.5,
                                targetX: user.dir === 1 ? w + 40 : -40,
                                life: 60,
                            });

                            // Douille éjectée
                            s.casingParticles.push({
                                x: user.x + 40,
                                y: muzzleY,
                                vx: -user.dir * (1.5 + Math.random() * 2),
                                vy: -2.5 - Math.random() * 2,
                                life: 30,
                            });

                            // Muzzle flash
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

            // Douilles de balles AK-47 au sol
            for (let i = s.casingParticles.length - 1; i >= 0; i--) {
                const cp = s.casingParticles[i];
                cp.x += cp.vx;
                cp.y += cp.vy;
                cp.vy += 0.3; // Gravité
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
                // Les personnages restent sur place pendant la NUKE
                s.snakeX = s.cowboyX + 85;
            } else if (s.fightActive) {
                s.fightTimer--;
                s.snakeX = s.cowboyX + 85;

                // Phase 2: Échange d'attaques à distance depuis leur position
                if (s.fightTimer > 85) {
                    s.fightPhase = 2;

                    // Animation des coups de concombre de Kermit
                    if (s.walkTick % 4 === 0) {
                        s.kermitAttackFrame = (s.kermitAttackFrame + 1) % kermitAttackFrames.length;
                    }

                    // Kermit projette des tranches de concombre depuis son sexe vers ses adversaires
                    if (s.fightTimer % 22 === 0) {
                        play8BitRetroSound(350, 720, 0.16);

                        // Tir vers le Cowboy
                        s.cucumberProjectiles.push({
                            x: s.kermitX + (s.cowboyX > s.kermitX ? 65 : -15),
                            y: groundY - 45,
                            vx: s.cowboyX > s.kermitX ? 7.5 : -7.5,
                            vy: (Math.random() - 0.5) * 1.5,
                            targetX: s.cowboyX,
                            life: 70,
                        });

                        // Tir vers Spider-Man
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

                    // Spider-Man tire des toiles vers ses 2 adversaires
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

                    // Cowboy tire au revolver vers ses adversaires
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

                    // Serpent crache des étincelles de venin
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
                }
                // Phase 4: Victoire & Danse triomphale sur place
                else {
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

                // Fin du combat -> Reprise de patrouille depuis leur position
                if (s.fightTimer <= 0) {
                    s.fightActive = false;
                    s.fightPhase = 0;
                    setIsFighting(false);
                    setStatusText('Patrouille active : Cowboy, Spider-Man & Kermit');
                }
            } else {
                // ----------------------------------------------------------------
                // DÉPLACEMENT NORMAL (PATROUILLE)
                // ----------------------------------------------------------------
                // Cowboy
                s.cowboyX -= 1.3;
                if (s.cowboyX < -130) s.cowboyX = w + 80;

                // Spider-Man
                s.spideyX += 1.15;
                if (s.spideyX > w + 90) s.spideyX = -100;

                // Kermit the frog
                s.kermitX -= 1.0;
                if (s.kermitX < -120) s.kermitX = w + 120;

                // Serpent
                s.snakeX = s.cowboyX + 85;
            }

            // Animation tick cycles
            if (s.walkTick % 6 === 0) {
                s.cowboyFrame = (s.cowboyFrame + 1) % cowboyFrames.length;
                s.spideyFrame = (s.spideyFrame + 1) % spideyFrames.length;
            }
            if (s.walkTick % 8 === 0) {
                s.kermitFrame = (s.kermitFrame + 1) % kermitFrames.length;
                s.kermitDanceFrame = (s.kermitDanceFrame + 1) % kermitDanceFrames.length;
            }
            if (s.walkTick % 7 === 0) {
                s.snakeFrame = (s.snakeFrame + 1) % snakeFrames.length;
            }

            // Fumée de la clope du Cowboy
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

                // Dessin du projectile épais et réaliste (hampe, veines et gland)
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

                // Impact à l'adversaire
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

            // Balles du Cowboy (Tracers)
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

            // Web Lines (Spider-Man)
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

            // Textes flottants d'impacts
            for (let i = s.battleTexts.length - 1; i >= 0; i--) {
                const bt = s.battleTexts[i];
                bt.y -= 0.6;
                bt.life--;
                ctx.fillStyle = bt.color;
                ctx.font = 'bold 16px monospace';
                ctx.fillText(bt.text, bt.x, bt.y);
                if (bt.life <= 0) s.battleTexts.splice(i, 1);
            }

            // Helper: Dessiner le bouclier d'énergie
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
                // Orbes protecteurs en rotation
                for (let a = 0; a < 3; a++) {
                    const angle = (s.walkTick * 0.06) + (a * (Math.PI * 2 / 3));
                    const nx = cx + Math.cos(angle) * radius;
                    const ny = cy + Math.sin(angle) * radius;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(nx - 3, ny - 3, 6, 6);
                }
                ctx.restore();
            };

            // Helper: Dessiner l'AK-47 tenue par le personnage
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
            // 6. RENDU DES PERSONNAGES (Alignés au sol sur groundY)
            // ----------------------------------------------------------------

            // 1. Spider-Man (Row 18 = boots -> groundY - 19 * pixelScale)
            const spideyY = Math.round(groundY - 19 * pixelScale);
            let spideySprite = spideyFrames[s.spideyFrame];
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

            // 2. Kermit the Frog (Row 17 = feet -> groundY - 18 * pixelScale)
            const kermitY = Math.round(groundY - 18 * pixelScale);
            let kermitSprite = kermitFrames[s.kermitFrame];
            if (s.nukeActive && (s.nukePhase === 2 || s.nukePhase === 3)) {
                kermitSprite = s.nukeLauncher === 'kermit' ? kermitDanceFrames[s.kermitDanceFrame] : KERMIT_KO;
            } else if (s.fightPhase === 2) {
                kermitSprite = kermitAttackFrames[s.kermitAttackFrame];
            } else if (s.fightPhase === 4) {
                kermitSprite = s.chosenWinner === 'kermit' ? kermitDanceFrames[s.kermitDanceFrame] : KERMIT_KO;
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

            // 3. Cowboy (Row 21 = boots -> groundY - 22 * pixelScale)
            const cowboyY = Math.round(groundY - 22 * pixelScale);
            let cowboySprite = cowboyFrames[s.cowboyFrame];
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

            // 4. Serpent (Pet) (Row 4 = belly -> groundY - 5 * pixelScale)
            const snakeSprite = snakeFrames[s.snakeFrame];
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

            // 5. Particules VFX
            for (let i = s.battleVFX.length - 1; i >= 0; i--) {
                const p = s.battleVFX[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                ctx.fillStyle = p.color;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
                if (p.life <= 0) s.battleVFX.splice(i, 1);
            }

            // Flash d'explosion nucléaire
            if (s.nukeFlashAlpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.nukeFlashAlpha})`;
                ctx.fillRect(0, 0, w, h);
            }

            // Alerte sirène (Phase 1)
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

            // 6. Bulle de dialogue
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

    return (
        <div className="admin-pixel-pet-card" ref={containerRef}>
            {/* Header avec Compteur de Victoires dans le coin supérieur gauche et boutons à droite */}
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

                {/* Boutons d'actions épurés sans emoji adaptés au thème */}
                <div className="admin-pixel-pet-actions">
                    <button
                        type="button"
                        onClick={startBattle}
                        disabled={isFighting || isNukeRunning}
                        className={`admin-pixel-fight-btn ${isFighting ? 'is-fighting' : ''}`}
                        title="Declencher le combat pixel-art"
                    >
                        {isFighting ? 'Combat en cours...' : `Lancer le combat (Auto : ${battleCountdown}s)`}
                    </button>

                    <button
                        type="button"
                        onClick={() => triggerNuke()}
                        disabled={isFighting || isNukeRunning}
                        className={`admin-pixel-nuke-btn ${isNukeRunning ? 'is-nuke-active' : ''}`}
                        title="Declencher la NUKE Tactique (Remet les scores adverses a 0)"
                    >
                        {isNukeRunning ? 'NUKE en cours...' : 'Lancer la NUKE'}
                    </button>
                </div>
            </div>

            <div className="admin-pixel-pet-canvas-wrap">
                <canvas ref={canvasRef} className="admin-pixel-pet-canvas" />

                {bubble.visible && (
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
                )}
            </div>

            <div className="admin-pixel-pet-footer">
                <span className="admin-pixel-pet-status-msg">{statusText}</span>
                <span className="admin-pixel-pet-timer-tag">Cycle automatique : 60s</span>
            </div>
        </div>
    );
}
