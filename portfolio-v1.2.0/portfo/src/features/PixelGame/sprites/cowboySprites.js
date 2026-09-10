// ---------------------------------------------------------------------------
// COWBOY PALETTE & ANIMATION FRAMES (Pixel-Art pur)
// ---------------------------------------------------------------------------

export const COWBOY_PALETTE = {
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

export const COWBOY_WALK_0 = [
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

export const COWBOY_WALK_1 = [
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

export const COWBOY_WALK_2 = [
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

export const COWBOY_WALK_3 = [
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

export const COWBOY_SHOOT = [
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

export const COWBOY_KO = [
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

export const COWBOY_FRAMES = [COWBOY_WALK_0, COWBOY_WALK_1, COWBOY_WALK_2, COWBOY_WALK_3];
