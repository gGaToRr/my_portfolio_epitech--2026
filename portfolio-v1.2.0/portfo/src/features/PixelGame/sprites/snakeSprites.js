// ---------------------------------------------------------------------------
// SERPENT PALETTE & ANIMATION FRAMES (Pixel-Art pur)
// ---------------------------------------------------------------------------

export const SNAKE_PALETTE = {
    G: '#10b981',
    g: '#047857',
    Y: '#fbbf24',
    R: '#ef4444',
    E: '#090d16',
};

export const SNAKE_FRAME_0 = [
    '....GGGG............',
    '..GGEYEGGG....GGG...',
    '.GGRRGGGGGG..GGgGG..',
    '.GGGG..GGGGGGGG.GGG.',
    '.gggg...gggggg...gg.',
    '....................',
];

export const SNAKE_FRAME_1 = [
    '...RR...............',
    '..GGGGGG............',
    '..GGEYEGGG...GGgGG..',
    '.GGGG..GGGGGGGG.GGG.',
    '.gggg...gggggg...gg.',
    '....................',
];

export const SNAKE_FRAME_2 = [
    '..RR................',
    '.GGEYEGG............',
    '.GGGGGGG....GGgGG...',
    '..GGGGGGGGGGGG.GGG..',
    '...gggg.ggggg...gg..',
    '....................',
];

export const SNAKE_FRAMES = [SNAKE_FRAME_0, SNAKE_FRAME_1, SNAKE_FRAME_2, SNAKE_FRAME_1];
