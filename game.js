// Dhaba Tycoon - Core Game Logic & Rendering Engine (Version 4 with Plates Cleaning & Dishwasher Loop)

// ============================================================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ============================================================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn("AudioContext initialization blocked or failed:", e);
            this.ctx = null;
        }
    }

    toggle(forceState) {
        this.enabled = forceState !== undefined ? forceState : !this.enabled;
        return this.enabled;
    }

    playCoin() {
        try {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch (e) {
            console.warn("Sound playCoin failed:", e);
        }
    }

    playServe() {
        try {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.005, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.13);
        } catch (e) {
            console.warn("Sound playServe failed:", e);
        }
    }

    playUnlock() {
        try {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25];

            notes.forEach((freq, idx) => {
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const start = now + idx * 0.08;

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, start);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + 0.25);

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.setValueAtTime(0.06, start);
                    gain.gain.exponentialRampToValueAtTime(0.005, start + 0.3);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start(start);
                    osc.stop(start + 0.35);
                } catch (err) {
                    console.warn("Sound playUnlock note failed:", err);
                }
            });
        } catch (e) {
            console.warn("Sound playUnlock failed:", e);
        }
    }

    playUpgrade() {
        try {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(392.00, now);
            osc.frequency.setValueAtTime(587.33, now + 0.08);
            osc.frequency.setValueAtTime(880.00, now + 0.16);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(196.00, now);
            osc2.frequency.setValueAtTime(293.66, now + 0.08);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.36);
            osc2.start(now);
            osc2.stop(now + 0.36);
        } catch (e) {
            console.warn("Sound playUpgrade failed:", e);
        }
    }

    playStep() {
        try {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(50, now);
            osc.frequency.linearRampToValueAtTime(25, now + 0.05);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            console.warn("Sound playStep failed:", e);
        }
    }
}

const sound = new SoundSynth();

// ============================================================================
// 2. PARTICLE SYSTEM
// ============================================================================
class Particle {
    constructor(x, y, color, type = 'dust') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        if (type === 'steam') {
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = -Math.random() * 0.6 - 0.3;
        } else if (type === 'sparkle') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 - 1;
        }
        this.alpha = 1.0;
        this.life = type === 'steam' ? 50 + Math.random() * 20 : 25 + Math.random() * 15;
        this.maxLife = this.life;
        this.size = type === 'steam' ? 4 + Math.random() * 6 : 2 + Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / this.maxLife;
        if (this.type === 'steam') {
            this.size += 0.04;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color = '#4cd964') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.vy = -1.0;
        this.alpha = 1.0;
        this.life = 45;
    }

    update() {
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / 45;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = "bold 16px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// ============================================================================
// 3. RECIPES CONFIGURATION & VECTOR DRAW UTILS
// ============================================================================
const RECIPES = {
    idli: {
        id: 'idli',
        name: 'Idli',
        basePrice: 10,
        prepTime: 120, // frames
        color: '#f8f9fa',
        xp: 10,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#4c9930';
            ctx.beginPath();
            ctx.ellipse(x, y + 4, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#bfa58a';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ebd5c0';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fdfdfd';
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;
            ctx.beginPath();
            ctx.ellipse(x - size * 0.2, y - size * 0.03, size * 0.35, size * 0.28, -Math.PI / 12, 0, Math.PI * 2);
            ctx.ellipse(x + size * 0.2, y + size * 0.03, size * 0.35, size * 0.28, Math.PI / 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            ctx.fillStyle = '#d2691e';
            ctx.beginPath();
            ctx.arc(x - size * 0.32, y + size * 0.22, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fffdf0';
            ctx.beginPath();
            ctx.arc(x + size * 0.32, y - size * 0.22, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    dosa: {
        id: 'dosa',
        name: 'Dosa',
        basePrice: 22,
        prepTime: 180,
        color: '#e5b060',
        xp: 25,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#4c9930';
            ctx.beginPath();
            ctx.ellipse(x, y + 3, size * 0.95, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#6c757d';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#adb5bd';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 8);

            ctx.fillStyle = '#a06e25';
            ctx.beginPath();
            ctx.roundRect(-size * 0.72, -size * 0.16, size * 1.44, size * 0.32, size * 0.1);
            ctx.fill();

            ctx.fillStyle = '#e8ac41';
            ctx.beginPath();
            ctx.roundRect(-size * 0.68, -size * 0.13, size * 1.36, size * 0.26, size * 0.08);
            ctx.fill();

            ctx.fillStyle = '#ab731a';
            ctx.beginPath();
            ctx.ellipse(-size * 0.3, -size * 0.02, size * 0.15, size * 0.06, Math.PI/4, 0, Math.PI * 2);
            ctx.ellipse(size * 0.25, size * 0.03, size * 0.18, size * 0.05, -Math.PI/6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },
    chappathi: {
        id: 'chappathi',
        name: 'Chappathi',
        basePrice: 35,
        prepTime: 220,
        color: '#dfbd8c',
        xp: 40,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#bda080';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fffdfa';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d3ab75';
            ctx.beginPath();
            ctx.ellipse(x - size * 0.05, y + size * 0.05, size * 0.58, size * 0.52, Math.PI / 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e4c494';
            ctx.beginPath();
            ctx.ellipse(x + size * 0.08, y - size * 0.05, size * 0.55, size * 0.48, -Math.PI / 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#9e7a4f';
            ctx.beginPath();
            ctx.arc(x + size * 0.2, y - size * 0.1, 1.5, 0, Math.PI * 2);
            ctx.arc(x - size * 0.15, y + size * 0.1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    parotta: {
        id: 'parotta',
        name: 'Parotta',
        basePrice: 50,
        prepTime: 260,
        color: '#e9cb9e',
        xp: 60,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#4c9930';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.76, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#9e7543';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#edd1a6';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.62, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#c4915a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.4, 0, Math.PI * 1.5);
            ctx.stroke();

            ctx.fillStyle = '#8c5922';
            ctx.beginPath();
            ctx.arc(x - size * 0.2, y + size * 0.25, 2.5, 0, Math.PI * 2);
            ctx.arc(x + size * 0.3, y - size * 0.15, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    noodles: {
        id: 'noodles',
        name: 'Noodles',
        basePrice: 70,
        prepTime: 300,
        color: '#fadc5c',
        xp: 90,
        draw: (ctx, x, y, size) => {
            // Draw plate
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.arc(x, y + 2, size * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // Draw bowl (red)
            ctx.fillStyle = '#d93838';
            ctx.beginPath();
            ctx.arc(x, y + 1, size * 0.72, 0, Math.PI * 2);
            ctx.fill();

            // Inside bowl (black background for depth)
            ctx.fillStyle = '#3c0000';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Draw fixed noodles (static, no Math.random!)
            ctx.strokeStyle = '#fdd943';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            
            // Loop with fixed coordinates to draw overlapping noodle curves
            const offsets = [
                [-0.3, -0.2, -0.1, 0.2, 0.3, 0.1],
                [-0.2, 0.3, 0.2, -0.2, 0.1, -0.3],
                [0.1, -0.3, -0.2, 0.3, -0.1, 0.2],
                [0.3, 0.1, -0.3, -0.1, 0.2, -0.2],
                [-0.1, 0.2, 0.3, -0.3, -0.2, 0.1]
            ];
            
            for (let i = 0; i < offsets.length; i++) {
                const off = offsets[i];
                const x1 = x + off[0] * size;
                const y1 = y + off[1] * size;
                const cp1x = x + off[2] * size;
                const cp1y = y + off[3] * size;
                const x2 = x + off[4] * size;
                const y2 = y + off[5] * size;
                
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
            }
            ctx.stroke();

            // Draw spring onions / green peas (veggies)
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.arc(x - size * 0.2, y - size * 0.15, 1.8, 0, Math.PI * 2);
            ctx.arc(x + size * 0.25, y + size * 0.05, 1.8, 0, Math.PI * 2);
            ctx.arc(x - size * 0.05, y + size * 0.2, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Draw carrot pieces (orange rectangles)
            ctx.fillStyle = '#ff7f50';
            ctx.fillRect(x - size * 0.15, y + size * 0.05, 3, 1.5);
            ctx.fillRect(x + size * 0.1, y - size * 0.2, 3, 1.5);
        }
    },
    friedrice: {
        id: 'friedrice',
        name: 'Fried Rice',
        basePrice: 90,
        prepTime: 360,
        color: '#e59e50',
        xp: 120,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#2962ff';
            ctx.beginPath();
            ctx.arc(x, y + 2, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0d1b2a';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.64, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d4883f';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.52, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f5b578';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const rx = x + (Math.random() - 0.5) * size * 0.6;
                const ry = y + (Math.random() - 0.5) * size * 0.6;
                if (Math.hypot(rx - x, ry - y) < size * 0.45) {
                    ctx.ellipse(rx, ry, 2, 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
                }
            }
            ctx.fill();
        }
    }
};

// Dirty Plate Vector Draw
const DRAW_DIRTY_PLATE = (ctx, x, y, size) => {
    ctx.save();
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Leftovers smear
    ctx.fillStyle = '#d2691e';
    ctx.beginPath();
    ctx.arc(x + 2, y - 1, 3, 0, Math.PI * 2);
    ctx.arc(x - 3, y + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

// Detailed Character Drawing Helper
const DRAW_DETAILED_CHARACTER = (ctx, x, y, w, h, shirtColor, skinColor, bounce, isMoving, type) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 16, w * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bobbing offset
    const bob = isMoving ? Math.abs(Math.sin(bounce)) * 3 : 0;
    ctx.translate(0, -bob);
    
    // 1. Draw Legs (Walking Animation)
    const legSwing = isMoving ? Math.sin(bounce * 1.8) * 8 : 0;
    ctx.fillStyle = '#2f3542'; // Pants/Shoes color
    
    // Left leg
    ctx.beginPath();
    ctx.roundRect(-6, 8 + legSwing, 4.5, 9, 2);
    ctx.fill();
    
    // Right leg
    ctx.beginPath();
    ctx.roundRect(1.5, 8 - legSwing, 4.5, 9, 2);
    ctx.fill();
    
    // 2. Draw Body (Shirt)
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -h * 0.4, w, h * 0.8, 10);
    ctx.fill();
    
    // Draw Apron if Chef or Cashier
    if (type === 'chef') {
        ctx.fillStyle = '#ffffff'; // White apron
        ctx.fillRect(-w * 0.35, -h * 0.2, w * 0.7, h * 0.5);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(-w * 0.35, -h * 0.2, w * 0.7, h * 0.5);
    } else if (type === 'cashier') {
        ctx.fillStyle = '#f1c40f'; // Yellow tie
        ctx.fillRect(-2, -h * 0.2, 4, h * 0.35);
    }
    
    // 3. Draw Head (Skin)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -h * 0.55, 11, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. Draw Hair
    ctx.fillStyle = (type === 'vending_customer' || type === 'customer') ? '#303036' : '#2d3436';
    ctx.beginPath();
    ctx.arc(0, -h * 0.62, 12, Math.PI, 0);
    ctx.fill();
    
    // 5. Draw Eyes (Detailed pupils & twinking spots)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -h * 0.56, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -h * 0.56, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000'; // Pupil
    ctx.beginPath();
    ctx.arc(-4, -h * 0.56, 1.2, 0, Math.PI * 2);
    ctx.arc(4, -h * 0.56, 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff'; // Highlight reflection dot
    ctx.beginPath();
    ctx.arc(-4.5, -h * 0.58, 0.6, 0, Math.PI * 2);
    ctx.arc(3.5, -h * 0.58, 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 6. Draw Mouth (Smiling)
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -h * 0.49, 2.5, 0, Math.PI);
    ctx.stroke();
    
    // 7. Draw Special Hats
    if (type === 'chef' || type === 'player_chef') {
        // Chef Hat
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-8, -h * 0.9, 16, 8, 3);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-8, -h * 0.9, 16, 8);
        
        ctx.beginPath();
        ctx.arc(-5, -h * 0.91, 5, 0, Math.PI * 2);
        ctx.arc(5, -h * 0.91, 5, 0, Math.PI * 2);
        ctx.arc(0, -h * 0.96, 6.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

const GRID_SIZE = 50;
const COLS = 28;
const ROWS = 24;

// ============================================================================
// 4. PATHFINDING
// ============================================================================
class NavGrid {
    constructor() {
        this.grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        this.rebuildStaticMap();
    }

    rebuildStaticMap() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                this.grid[r][c] = 0;
            }
        }

        for (let r = 0; r < ROWS; r++) {
            this.grid[r][0] = 1;
            this.grid[r][1] = 1;
            this.grid[r][2] = 1;
            this.grid[r][3] = 1; // Left wall (except drive-thru window)
        }
        
        for (let r = 0; r < ROWS; r++) {
            this.grid[r][27] = 1; // Right wall
        }

        for (let c = 3; c < COLS; c++) {
            this.grid[2][c] = 1;
        }

        for (let c = 3; c < COLS; c++) {
            if (c !== 14 && c !== 15) {
                this.grid[22][c] = 1;
            }
        }
    }

    blockArea(x, y, w, h) {
        const startC = Math.max(0, Math.floor((x - w/2) / GRID_SIZE));
        const endC = Math.min(COLS - 1, Math.floor((x + w/2) / GRID_SIZE));
        const startR = Math.max(0, Math.floor((y - h/2) / GRID_SIZE));
        const endR = Math.min(ROWS - 1, Math.floor((y + h/2) / GRID_SIZE));

        for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
                this.grid[r][c] = 1;
            }
        }
    }

    updateObstacles(tables, stations, cashier1Unlocked, cashier2Unlocked, dishwasher, vending1Unlocked, vending2Unlocked) {
        this.rebuildStaticMap();

        stations.forEach(s => {
            if (s.unlocked) {
                this.blockArea(s.x, s.y, 65, 65);
            }
        });

        // Block cashier counter
        this.blockArea(750, 500, 160, 50);

        // Block Dishwasher cabinet
        if (dishwasher) {
            this.blockArea(dishwasher.x, dishwasher.y, 60, 60);
        } else {
            this.blockArea(180, 240, 60, 60);
        }

        // Block tables
        tables.forEach(t => {
            if (t.unlocked) {
                this.blockArea(t.x, t.y, 80, 80);
            }
        });

        if (this.driveThruUnlocked) {
            this.blockArea(180, 650, 40, 80);
        }

        // Block Vending Machines
        if (vending1Unlocked) {
            this.blockArea(640, 1070, 50, 50);
        }
        if (vending2Unlocked) {
            this.blockArea(860, 1070, 50, 50);
        }
    }

    findPath(startX, startY, endX, endY) {
        const sc = Math.max(0, Math.min(COLS - 1, Math.floor(startX / GRID_SIZE)));
        const sr = Math.max(0, Math.min(ROWS - 1, Math.floor(startY / GRID_SIZE)));
        const tc = Math.max(0, Math.min(COLS - 1, Math.floor(endX / GRID_SIZE)));
        const tr = Math.max(0, Math.min(ROWS - 1, Math.floor(endY / GRID_SIZE)));

        let targetC = tc;
        let targetR = tr;
        if (this.grid[tr][tc] === 1) {
            const dirs = [
                [0, 1], [0, -1], [1, 0], [-1, 0],
                [1, 1], [-1, -1], [1, -1], [-1, 1]
            ];
            let found = false;
            for (let d = 1; d < 3; d++) {
                for (const [dc, dr] of dirs) {
                    const nc = tc + dc * d;
                    const nr = tr + dr * d;
                    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && this.grid[nr][nc] === 0) {
                        targetC = nc;
                        targetR = nr;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }

        if (sc === targetC && sr === targetR) {
            return [[endX, endY]];
        }

        const queue = [[sc, sr]];
        const visited = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
        const parent = {};
        visited[sr][sc] = true;

        const key = (c, r) => `${c},${r}`;
        let found = false;

        while (queue.length > 0) {
            const [c, r] = queue.shift();

            if (c === targetC && r === targetR) {
                found = true;
                break;
            }

            const neighbors = [
                [c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]
            ];

            for (const [nc, nr] of neighbors) {
                if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
                    if (!visited[nr][nc] && this.grid[nr][nc] === 0) {
                        visited[nr][nc] = true;
                        parent[key(nc, nr)] = [c, r];
                        queue.push([nc, nr]);
                    }
                }
            }
        }

        if (!found) {
            return [[endX, endY]];
        }

        const pathCells = [];
        let curr = [targetC, targetR];
        while (curr[0] !== sc || curr[1] !== sr) {
            pathCells.push(curr);
            curr = parent[key(curr[0], curr[1])];
        }
        pathCells.reverse();

        const waypoints = pathCells.map(([c, r]) => [c * GRID_SIZE + GRID_SIZE / 2, r * GRID_SIZE + GRID_SIZE / 2]);
        waypoints.push([endX, endY]);

        return waypoints;
    }
}

const nav = new NavGrid();

// ============================================================================
// 5. VEHICLE / CAR PARCEL CLASS
// ============================================================================
class DriveThruCar {
    constructor(game) {
        this.game = game;
        this.x = 50;
        this.y = -100;
        this.targetY = 650;
        this.speed = 4;
        this.state = 'entering';
        this.order = null;
        this.foodDeliveredCount = 0;
        this.timer = 0;
        this.waitTimer = 0;
        this.w = 70;
        this.h = 100;
        this.color = ['#ff4757', '#2e86de', '#2ed573', '#ffa502', '#1e272e'][Math.floor(Math.random() * 5)];
        this.bounce = 0;
        this.bounceSpeed = 0.1;
        this.bounceHeight = 1.5;
    }

    update() {
        this.bounce += this.bounceSpeed;

        const activeCars = this.game.cars.filter(c => c.state !== 'leaving');
        const queueIndex = activeCars.indexOf(this);
        const myTargetY = 650 - (queueIndex >= 0 ? queueIndex * 120 : 0);

        if (this.state === 'entering') {
            if (this.y < myTargetY) {
                this.y += this.speed;
                if (this.y > myTargetY) this.y = myTargetY;
            } else if (this.y > myTargetY) {
                this.y -= this.speed;
                if (this.y < myTargetY) this.y = myTargetY;
            } else {
                if (queueIndex === 0) {
                    this.state = 'waiting';
                    this.generateOrder();
                    this.waitTimer = 0;
                }
            }
        } else if (this.state === 'waiting') {
            this.y = 650;
            this.waitTimer++;
            if (this.waitTimer >= 1800) {
                this.game.particles.push(new FloatingText(this.x + 50, this.y - 20, "Too slow! 😡", '#ff3300'));
                this.state = 'leaving';
                return;
            }
            this.timer++;
            if (this.foodDeliveredCount >= this.order.qty) {
                this.state = 'leaving';
                const baseVal = this.game.prices[this.order.recipe.id];
                const cashToSpawn = baseVal * this.order.qty;
                this.game.spawnCash(175, 650, cashToSpawn);
                this.game.stats.customersServed++;
                this.game.addXP(this.order.recipe.xp * this.order.qty);
            }
        } else if (this.state === 'leaving') {
            this.y += this.speed;
            if (this.y > 1300) {
                const idx = this.game.cars.indexOf(this);
                if (idx > -1) this.game.cars.splice(idx, 1);
            }
        }
    }

    generateOrder() {
        let recipes = this.game.getUnlockedRecipes();
        if (recipes.length === 0) {
            recipes = [RECIPES.idli];
        }
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        this.order = {
            recipe: randomRecipe,
            qty: qty
        };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const bob = Math.sin(this.bounce) * this.bounceHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w * 0.5, this.h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, bob);

        ctx.fillStyle = '#1e272e';
        ctx.fillRect(-this.w * 0.55, -this.h * 0.35, 12, 20);
        ctx.fillRect(this.w * 0.4, -this.h * 0.35, 12, 20);
        ctx.fillRect(-this.w * 0.55, this.h * 0.2, 12, 20);
        ctx.fillRect(this.w * 0.4, this.h * 0.2, 12, 20);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(-this.w * 0.48, -this.h * 0.45, this.w * 0.96, this.h * 0.9, 16);
        ctx.fill();

        // Glass canopy (linear gradient blue-to-dark glass with reflection)
        const glassGrad = ctx.createLinearGradient(0, -this.h * 0.15, 0, this.h * 0.3);
        glassGrad.addColorStop(0, '#54a0ff');
        glassGrad.addColorStop(1, '#2e86de');
        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.roundRect(-this.w * 0.38, -this.h * 0.15, this.w * 0.76, this.h * 0.45, 10);
        ctx.fill();

        // White diagonal reflection stripe on glass
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(-this.w * 0.25, -this.h * 0.1);
        ctx.lineTo(-this.w * 0.05, -this.h * 0.1);
        ctx.lineTo(-this.w * 0.2, this.h * 0.25);
        ctx.lineTo(-this.w * 0.35, this.h * 0.25);
        ctx.closePath();
        ctx.fill();

        // Roof shadow/top cover
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.moveTo(-this.w * 0.3, -this.h * 0.1);
        ctx.lineTo(this.w * 0.3, -this.h * 0.1);
        ctx.lineTo(this.w * 0.25, -this.h * 0.02);
        ctx.lineTo(-this.w * 0.25, -this.h * 0.02);
        ctx.closePath();
        ctx.fill();

        // Headlights (glowing yellow)
        ctx.fillStyle = '#fffa65';
        ctx.shadowColor = '#fffa65';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(-this.w * 0.25, -this.h * 0.45, 5.5, 0, Math.PI * 2);
        ctx.arc(this.w * 0.25, -this.h * 0.45, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Tail lights (red)
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(-this.w * 0.3, this.h * 0.42, 4, 0, Math.PI * 2);
        ctx.arc(this.w * 0.3, this.h * 0.42, 4, 0, Math.PI * 2);
        ctx.fill();

        // Chrome front grill
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(-this.w * 0.15, -this.h * 0.45, this.w * 0.3, 4);

        ctx.restore();

        if (this.state === 'waiting' && this.order) {
            this.drawOrderBubble(ctx);
        }
    }

    drawOrderBubble(ctx) {
        const bx = this.x + 60;
        const by = this.y - 30;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(bx - 30, by - 30, 80, 44, 8);
        ctx.fill();

        if (this.waitTimer > 900) {
            ctx.strokeStyle = this.waitTimer > 1350 ? '#ff3300' : '#ff9900';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx - 30, by - 30, 80, 44);
        }

        ctx.beginPath();
        ctx.moveTo(bx - 12, by + 14);
        ctx.lineTo(bx - 20, by + 22);
        ctx.lineTo(bx - 4, by + 14);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        this.order.recipe.draw(ctx, bx - 10, by - 8, 18);

        ctx.fillStyle = '#1e272e';
        ctx.font = "bold 15px 'Outfit', sans-serif";
        ctx.fillText(`x${this.order.qty - this.foodDeliveredCount}`, bx + 22, by - 3);

        ctx.restore();
    }
}

// ============================================================================
// 6. CUSTOMER CLASS (Walking diners)
// ============================================================================
class Customer {
    constructor(game) {
        this.game = game;
        this.x = 750 + (Math.random() - 0.5) * 60;
        this.y = 1150;
        this.speed = 2.1;
        this.w = 26;
        this.h = 45;
        this.bounce = Math.random() * Math.PI;
        this.bounceSpeed = 0.15;
        this.state = 'entering';
        this.order = null;
        this.foodDeliveredCount = 0;
        this.table = null;
        this.seatIndex = -1;
        this.color = `hsl(${Math.random() * 360}, 60%, 55%)`;
        this.skinColor = '#fddfb5';
        this.eatingTimer = 0;
        this.waitTimer = 0;
        this.path = [];
        
        this.pissedAboutPrice = false;
        this.pissedTimer = 0;
    }

    update() {
        this.bounce += this.bounceSpeed;

        if (this.state === 'entering') {
            const match = this.game.findEmptySeat();
            if (match) {
                this.table = match.table;
                this.seatIndex = match.seatIndex;
                this.table.seats[this.seatIndex].occupant = this;
                this.state = 'walkingToTable';

                const seatX = this.table.x + this.table.seats[this.seatIndex].xOffset;
                const seatY = this.table.y + this.table.seats[this.seatIndex].yOffset + 25;
                this.path = nav.findPath(this.x, this.y, seatX, seatY);
            } else {
                this.state = 'queueing';
                this.game.joinCounterQueue(this);
            }
        }

        if (this.state === 'walkingToTable') {
            this.navigateAlongPath();
            const seatX = this.table.x + this.table.seats[this.seatIndex].xOffset;
            const seatY = this.table.y + this.table.seats[this.seatIndex].yOffset + 25;
            if (this.path.length === 0 && Math.hypot(this.x - seatX, this.y - seatY) < 15) {
                this.x = seatX;
                this.y = seatY;
                this.state = 'waitingAtTable';
                this.generateOrder();
                this.waitTimer = 0;
            }
        } else if (this.state === 'waitingAtTable') {
            this.waitTimer++;
            if (this.waitTimer >= 1800) {
                this.game.particles.push(new FloatingText(this.x, this.y - 20, "Too slow! 😡", '#ff3300'));
                const currentTable = this.table;
                this.table.seats[this.seatIndex].occupant = null;
                const anyOccupant = currentTable.seats.some(seat => seat.occupant !== null);
                if (!anyOccupant) {
                    currentTable.foodStack = [];
                }
                this.table = null;
                this.seatIndex = -1;
                this.state = 'leaving';
                this.path = nav.findPath(this.x, this.y, 750, 1150);
                return;
            }
            // Customers consume matching food items placed on the table
            if (this.table && this.table.foodStack && this.table.foodStack.length > 0) {
                const neededFood = this.order.recipe.id;
                const idx = this.table.foodStack.indexOf(neededFood);
                if (idx > -1 && this.foodDeliveredCount < this.order.qty) {
                    this.table.foodStack.splice(idx, 1);
                    this.foodDeliveredCount++;
                    sound.playServe();
                }
            }
            if (this.foodDeliveredCount >= this.order.qty) {
                this.state = 'eating';
                this.eatingTimer = 200;
            }
        } else if (this.state === 'eating') {
            this.eatingTimer--;
            if (this.eatingTimer <= 0) {
                this.state = 'leaving';
                
                const baseVal = this.game.prices[this.order.recipe.id];
                let pricePaid = baseVal * this.order.qty;
                if (this.table.isSofa) {
                    pricePaid = Math.round(pricePaid * 1.25);
                }
                
                // Pay immediately by spawning cash on the floor next to the table
                this.game.spawnCash(this.table.x, this.table.y + 40, pricePaid);
                this.game.stats.customersServed++;
                this.game.addXP(this.order.recipe.xp * this.order.qty);
                
                // Leave empty dirty plates (no cash value on them)
                this.table.dirtyPlatesCount += this.order.qty;
                this.table.dirtyPlatesValue = 0;
                this.table.dirty = true;
 
                const currentTable = this.table;
                this.table.seats[this.seatIndex].occupant = null;
                const anyOccupant = currentTable.seats.some(seat => seat.occupant !== null);
                if (!anyOccupant) {
                    currentTable.foodStack = [];
                }
                this.table = null;
                this.seatIndex = -1;
 
                this.path = nav.findPath(this.x, this.y, 750, 1150);
            }
        } else if (this.state === 'queueing') {
            this.waitTimer++;
            if (this.waitTimer >= 1800) {
                this.game.particles.push(new FloatingText(this.x, this.y - 20, "Too slow! 😡", '#ff3300'));
                const posInQ = this.game.counterQueue.indexOf(this);
                if (posInQ > -1) {
                    this.game.counterQueue.splice(posInQ, 1);
                }
                this.state = 'leaving';
                this.path = nav.findPath(this.x, this.y, 750, 1150);
                return;
            }
            const posInQ = this.game.counterQueue.indexOf(this);
            if (posInQ > -1) {
                const qy = 550 + posInQ * 50;
                const qx = 750;
                
                const dx = qx - this.x;
                const dy = qy - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 5) {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                } else {
                    this.x = qx;
                    this.y = qy;
                    
                    if (posInQ === 0) {
                        if (!this.order) {
                            this.generateOrder();
                            this.waitTimer = 0;
                        }
                        if (this.foodDeliveredCount >= this.order.qty) {
                            this.state = 'leaving';
                            const baseVal = this.game.prices[this.order.recipe.id];
                            const pricePaid = baseVal * this.order.qty;
                            // Cash paid straight to counter cash shelf
                            this.game.spawnCash(750, 480, pricePaid);
                            this.game.stats.customersServed++;
                            this.game.addXP(this.order.recipe.xp * this.order.qty);
                            this.game.counterQueue.shift();
                            this.path = nav.findPath(this.x, this.y, 750, 1150);
                        }
                    }
                }
            } else {
                this.state = 'leaving';
                this.path = nav.findPath(this.x, this.y, 750, 1150);
            }
        } else if (this.state === 'leaving') {
            this.navigateAlongPath();
            if (this.y > 1130) {
                const idx = this.game.customers.indexOf(this);
                if (idx > -1) this.game.customers.splice(idx, 1);
            }
        }

        if (this.pissedAboutPrice) {
            this.pissedTimer--;
            if (this.pissedTimer <= 0) this.pissedAboutPrice = false;
        }
    }

    generateOrder() {
        let recipes = this.game.getUnlockedRecipes();
        if (recipes.length === 0) {
            recipes = [RECIPES.idli];
        }
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        this.order = {
            recipe: randomRecipe,
            qty: qty
        };

        const maxPrice = this.game.getMaxPrice(randomRecipe.id);
        const curPrice = this.game.prices[randomRecipe.id];
        if (curPrice >= maxPrice * 0.95 && Math.random() < 0.35) {
            this.pissedAboutPrice = true;
            this.pissedTimer = 180;
        }
    }

    navigateAlongPath() {
        if (this.path.length === 0) return;
        const [tx, ty] = this.path[0];
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            if (Math.random() < 0.08) {
                this.game.particles.push(new Particle(this.x, this.y + 15, 'rgba(255,255,255,0.15)', 'dust'));
            }
        } else {
            this.path.shift();
        }
    }

    draw(ctx) {
        const isWalking = (this.state === 'walkingToTable' || this.state === 'leaving' || this.state === 'queueing');
        DRAW_DETAILED_CHARACTER(ctx, this.x, this.y, this.w, this.h, this.color, this.skinColor, this.bounce, isWalking, 'customer');

        if ((this.state === 'waitingAtTable' || (this.state === 'queueing' && this.game.counterQueue.indexOf(this) === 0)) && this.order) {
            this.drawOrderBubble(ctx);
        }

        if (this.pissedAboutPrice) {
            this.drawPriceBubble(ctx);
        }
    }

    drawOrderBubble(ctx) {
        const bx = this.x;
        const by = this.y - 65;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(bx - 35, by - 25, 70, 38, 8);
        ctx.fill();

        if (this.waitTimer > 900) {
            ctx.strokeStyle = this.waitTimer > 1350 ? '#ff3300' : '#ff9900';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx - 35, by - 25, 70, 38);
        }

        ctx.beginPath();
        ctx.moveTo(bx - 6, by + 13);
        ctx.lineTo(bx, by + 19);
        ctx.lineTo(bx + 6, by + 13);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        this.order.recipe.draw(ctx, bx - 14, by - 6, 14);

        ctx.fillStyle = '#1e272e';
        ctx.font = "bold 13px 'Outfit', sans-serif";
        ctx.fillText(`x${this.order.qty - this.foodDeliveredCount}`, bx + 15, by - 2);

        ctx.restore();
    }

    drawPriceBubble(ctx) {
        const bx = this.x - 45;
        const by = this.y - 35;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.roundRect(bx - 20, by - 14, 55, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = "bold 9px 'Outfit', sans-serif";
        ctx.fillText("💸 Pricey!", bx - 14, by - 1);
        ctx.restore();
    }
}

class VendingCustomer {
    constructor(game, targetMachineId) {
        this.game = game;
        this.targetMachineId = targetMachineId; // 'vending_1' or 'vending_2'
        this.x = 750 + (Math.random() - 0.5) * 40;
        this.y = 1150;
        this.speed = 2.0;
        this.w = 26;
        this.h = 45;
        this.color = `hsl(${Math.random() * 360}, 50%, 60%)`;
        this.skinColor = '#fddfb5';
        this.state = 'walkingToMachine';
        this.timer = 0;
        this.bounce = Math.random() * Math.PI;
        this.bounceSpeed = 0.15;
        
        const targetX = targetMachineId === 'vending_1' ? 640 : 860;
        const targetY = 1070 - 45;
        this.path = nav.findPath(this.x, this.y, targetX, targetY);
    }

    update() {
        this.bounce += this.bounceSpeed;

        if (this.state === 'walkingToMachine') {
            this.navigateAlongPath();
            const targetX = this.targetMachineId === 'vending_1' ? 640 : 860;
            const targetY = 1070 - 45;
            if (this.path.length === 0 && Math.hypot(this.x - targetX, this.y - targetY) < 15) {
                this.x = targetX;
                this.y = targetY;
                this.state = 'buying';
                this.timer = 60;
            }
        } else if (this.state === 'buying') {
            this.timer--;
            if (this.timer <= 0) {
                const targetX = this.targetMachineId === 'vending_1' ? 640 : 860;
                this.game.spawnCash(targetX, 1070 + 20, 20);
                this.state = 'drinking';
                this.timer = 120;
            }
        } else if (this.state === 'drinking') {
            this.timer--;
            if (this.timer <= 0) {
                this.state = 'leaving';
                this.path = nav.findPath(this.x, this.y, 750, 1150);
            }
        } else if (this.state === 'leaving') {
            this.navigateAlongPath();
            if (this.y > 1130) {
                const idx = this.game.vendingCustomers.indexOf(this);
                if (idx > -1) this.game.vendingCustomers.splice(idx, 1);
            }
        }
    }

    navigateAlongPath() {
        if (this.path.length === 0) return;
        const [tx, ty] = this.path[0];
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        } else {
            this.path.shift();
        }
    }

    draw(ctx) {
        const isWalking = (this.state === 'walkingToMachine' || this.state === 'leaving');
        DRAW_DETAILED_CHARACTER(ctx, this.x, this.y, this.w, this.h, this.color, this.skinColor, this.bounce, isWalking, 'vending_customer');
        const bob = isWalking ? Math.abs(Math.sin(this.bounce)) * 3 : 0;

        if (this.state === 'drinking' || this.state === 'buying') {
            ctx.save();
            ctx.translate(this.x + 8, this.y - bob - 15);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(-4, -6, 8, 12);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(-4, -2, 8, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -5, 4, 1);
            ctx.restore();
        }
    }
}

// ============================================================================
// 7. STAFF CLASS: CHEF, CASHIER, & WORKERS
// ============================================================================
class Staff {
    constructor(game, type, id, stationRef = null) {
        this.game = game;
        this.type = type;
        this.id = id;
        this.station = stationRef;
        this.x = 400;
        this.y = 600;
        this.targetX = this.x;
        this.targetY = this.y;
        this.speed = 2.0;
        this.carryCapacity = 2;
        this.w = 26;
        this.h = 45;
        this.color = type === 'chef' ? '#27ae60' : type.startsWith('cashier') ? '#2e86de' : '#ff9f43';
        this.skinColor = '#fcd0a1';
        this.carryStack = []; // Holds items like 'idli', 'dosa', or objects {type: 'dirty_plate', priceValue: 15}
        this.state = 'idle'; // idle, movingToStation, delivering, cleaningTable, deliveringPlates, clearingCash
        this.path = [];
        this.targetEntity = null;
        this.bounce = Math.random() * Math.PI;
        this.bounceSpeed = 0.15;
        
        this.stackAngle = 0;
        this.stackAngleVel = 0;
        this.lastX = this.x;

        this.initPosition();
    }

    initPosition() {
        if (this.type === 'chef' && this.station) {
            this.x = this.station.x;
            this.y = this.station.y - 12;
        } else if (this.type === 'cashier_1') {
            this.x = 750;
            this.y = 460;
        } else if (this.type === 'cashier_2') {
            this.x = 160;
            this.y = 650;
        } else {
            this.x = 750 + (Math.random() - 0.5) * 80;
            this.y = 600 + (Math.random() - 0.5) * 80;
        }
    }

    update() {
        this.bounce += this.bounceSpeed;

        if (this.type === 'chef') {
            if (this.station && this.station.preparedStack.length < 10) {
                this.station.timer += 1.0;
                if (this.station.timer >= RECIPES[this.station.id].prepTime) {
                    this.station.timer = 0;
                    this.station.preparedStack.push(this.station.id);
                    for (let i = 0; i < 4; i++) {
                        this.game.particles.push(new Particle(this.station.x, this.station.y - 8, '#f8f9fa', 'steam'));
                    }
                }
            }
            return;
        }

        this.speed = this.type === 'worker' ? 1.8 + this.game.upgrades.workerSpeed * 0.85 : 2.0;
        this.carryCapacity = this.type === 'worker' ? 1 + this.game.upgrades.workerCapacity : 1;

        if (this.type.startsWith('cashier')) {
            this.updateCashier();
        } else {
            this.updateWorker();
        }

        const vx = this.x - this.lastX;
        this.lastX = this.x;
        const targetAngle = -vx * 0.08;
        const accel = (targetAngle - this.stackAngle) * 0.25 - this.stackAngleVel * 0.2;
        this.stackAngleVel += accel;
        this.stackAngle += this.stackAngleVel;
    }

    updateCashier() {
        if (this.type === 'cashier_1') {
            if (this.game.counterQueue.length > 0) {
                const customer = this.game.counterQueue[0];
                if (customer && customer.order) {
                    const neededItem = customer.order.recipe.id;
                    const idx = this.game.counterBuffer.indexOf(neededItem);
                    if (idx !== -1) {
                        this.game.counterBuffer.splice(idx, 1);
                        customer.foodDeliveredCount++;
                        sound.playServe();
                    }
                }
            }
        } else if (this.type === 'cashier_2') {
            if (this.game.cars.length > 0) {
                const car = this.game.cars.find(c => c.state === 'waiting');
                if (car && car.order) {
                    const neededItem = car.order.recipe.id;
                    const idx = this.game.driveThruBuffer.indexOf(neededItem);
                    if (idx !== -1) {
                        this.game.driveThruBuffer.splice(idx, 1);
                        car.foodDeliveredCount++;
                        sound.playServe();
                    }
                }
            }
        }
    }

    updateWorker() {
        // Carry dirty plates? Deliver to dishwasher
        if (this.carryStack.length > 0 && typeof this.carryStack[this.carryStack.length - 1] === 'object') {
            this.state = 'deliveringPlates';
        }

        if (this.state === 'idle') {
            this.targetEntity = null;

            // 1. If has food, deliver
            if (this.carryStack.length > 0 && typeof this.carryStack[this.carryStack.length - 1] === 'string') {
                this.state = 'delivering';
                return;
            }

            // 2. Check Seating tables needing food
            const needyCust = this.findCustomerNeedingFood();
            if (needyCust && this.carryStack.length < this.carryCapacity) {
                const foodNeeded = needyCust.order.recipe.id;
                const station = this.game.stations.find(s => s.id === foodNeeded && s.unlocked);
                if (station && station.preparedStack.length > 0) {
                    this.state = 'movingToStation';
                    this.targetEntity = station;
                    this.path = nav.findPath(this.x, this.y, station.x, station.y + 40);
                    return;
                }
            }

            // 3. Check cashier 1 queue need (only if counterBuffer is not full)
            const c1Need = (this.game.counterBuffer.length < 40) ? this.findCashierQueueNeededFood() : null;
            if (c1Need && this.carryStack.length < this.carryCapacity) {
                const station = this.game.stations.find(s => s.id === c1Need && s.unlocked);
                if (station && station.preparedStack.length > 0) {
                    this.state = 'movingToStation';
                    this.targetEntity = station;
                    this.path = nav.findPath(this.x, this.y, station.x, station.y + 40);
                    return;
                }
            }

            // 4. Check drive thru need (only if driveThruBuffer is not full)
            const dtNeed = (this.game.driveThruBuffer.length < 48) ? this.findDriveThruNeededFood() : null;
            if (dtNeed && this.carryStack.length < this.carryCapacity) {
                const station = this.game.stations.find(s => s.id === dtNeed && s.unlocked);
                if (station && station.preparedStack.length > 0) {
                    this.state = 'movingToStation';
                    this.targetEntity = station;
                    this.path = nav.findPath(this.x, this.y, station.x, station.y + 40);
                    return;
                }
            }

            // 5. Check if any tables have empty plates to clean
            const dirtyTable = this.findDirtyTable();
            if (dirtyTable && this.carryStack.length < this.carryCapacity) {
                this.state = 'cleaningTable';
                this.targetEntity = dirtyTable;
                this.path = nav.findPath(this.x, this.y, dirtyTable.x, dirtyTable.y + 45); // walk to table front
                return;
            }

            // 6. Check money (DISABLED - only player can collect money)
            /*
            const needyCoin = this.findNearestCash();
            if (needyCoin) {
                this.state = 'clearingCash';
                this.targetEntity = needyCoin;
                this.path = nav.findPath(this.x, this.y, needyCoin.x, needyCoin.y);
                return;
            }
            */

            // Wander
            if (Math.random() < 0.01 && this.path.length === 0) {
                const wanderX = 750 + (Math.random() - 0.5) * 80;
                const wanderY = 600 + (Math.random() - 0.5) * 80;
                this.path = nav.findPath(this.x, this.y, wanderX, wanderY);
            }
            this.navigateAlongPath();
        } else if (this.state === 'movingToStation') {
            if (!this.targetEntity || !this.targetEntity.unlocked || this.targetEntity.preparedStack.length === 0) {
                this.state = 'idle';
                return;
            }

            this.navigateAlongPath();
            if (this.path.length === 0 && Math.hypot(this.x - this.targetEntity.x, this.y - (this.targetEntity.y + 40)) < 25) {
                let pickedAny = false;
                while (this.targetEntity.preparedStack.length > 0 && this.carryStack.length < this.carryCapacity) {
                    const picked = this.targetEntity.preparedStack.pop();
                    if (picked) {
                        this.carryStack.push(picked);
                        pickedAny = true;
                    }
                }
                
                if (pickedAny) {
                    sound.playServe();
                    this.game.particles.push(new Particle(this.x, this.y, '#ffffff', 'sparkle'));
                }
                this.state = 'delivering';
            }
        } else if (this.state === 'delivering') {
            if (this.carryStack.length === 0) {
                this.state = 'idle';
                return;
            }

            const currentFoodItem = this.carryStack[this.carryStack.length - 1];

            // A. Cashier 1 line needs it (Radius: 60px from cashier center)
            const c1Need = (this.game.counterBuffer.length < 40) ? this.findCashierQueueNeededFood() : null;
            if (c1Need === currentFoodItem) {
                const tx = 750;
                const ty = 535;
                if (this.path.length === 0 || this.targetX !== tx || this.targetY !== ty) {
                    this.targetX = tx;
                    this.targetY = ty;
                    this.path = nav.findPath(this.x, this.y, tx, ty);
                }
                this.navigateAlongPath();
                if (this.path.length === 0 && Math.hypot(this.x - 750, this.y - 500) < 60) {
                    let placedAny = false;
                    while (this.carryStack.length > 0 && this.game.counterBuffer.length < 40) {
                        const topItem = this.carryStack[this.carryStack.length - 1];
                        if (typeof topItem === 'string') {
                            this.game.counterBuffer.push(this.carryStack.pop());
                            placedAny = true;
                        } else {
                            break;
                        }
                    }
                    if (placedAny) {
                        sound.playServe();
                    }
                    this.state = 'idle';
                }
                return;
            }

            // B. Drive Thru needs it
            const dtNeed = (this.game.driveThruBuffer.length < 48) ? this.findDriveThruNeededFood() : null;
            if (dtNeed === currentFoodItem) {
                const tx = 210;
                const ty = 650;
                if (this.path.length === 0 || this.targetX !== tx || this.targetY !== ty) {
                    this.targetX = tx;
                    this.targetY = ty;
                    this.path = nav.findPath(this.x, this.y, tx, ty);
                }
                this.navigateAlongPath();
                if (this.path.length === 0 && Math.hypot(this.x - 210, this.y - 650) < 60) {
                    if (this.game.driveThruBuffer.length < 48) {
                        this.game.driveThruBuffer.push(this.carryStack.pop());
                        sound.playServe();
                    }
                    this.state = 'idle';
                }
                return;
            }

            // C. Customer at table needs it (Radius: 85px from table center)
            const needyCust = this.findCustomerNeedingThisFood(currentFoodItem);
            if (needyCust) {
                const tx = needyCust.table.x;
                const ty = needyCust.table.y + 45;
                if (this.path.length === 0 || this.targetX !== tx || this.targetY !== ty) {
                    this.targetX = tx;
                    this.targetY = ty;
                    this.path = nav.findPath(this.x, this.y, tx, ty);
                }
                this.navigateAlongPath();
                if (this.path.length === 0 && Math.hypot(this.x - needyCust.table.x, this.y - needyCust.table.y) < 85) {
                    if (needyCust.table.foodStack.length < 6) {
                        needyCust.table.foodStack.push(this.carryStack.pop());
                        sound.playServe();
                    }
                    this.state = 'idle';
                }
                return;
            }

            // D. If we cannot deliver anywhere, return food to the kitchen station to free hands
            const station = this.game.stations.find(s => s.id === currentFoodItem && s.unlocked && s.preparedStack.length < 10);
            if (station) {
                this.state = 'returningFood';
                this.targetEntity = station;
                this.path = nav.findPath(this.x, this.y, station.x, station.y + 40);
                return;
            }

            this.state = 'idle';
        } else if (this.state === 'cleaningTable') {
            if (!this.targetEntity || !this.targetEntity.dirty) {
                this.state = 'idle';
                return;
            }

            this.navigateAlongPath();
            // Reached table?
            if (this.path.length === 0 && Math.hypot(this.x - this.targetEntity.x, this.y - this.targetEntity.y) < 85) {
                let pickedAny = false;
                while (this.targetEntity.dirtyPlatesCount > 0 && this.carryStack.length < this.carryCapacity) {
                    const plateVal = this.targetEntity.dirtyPlatesCount > 0 ? Math.round(this.targetEntity.dirtyPlatesValue / this.targetEntity.dirtyPlatesCount) : 0;
                    this.carryStack.push({ type: 'dirty_plate', priceValue: plateVal });
                    this.targetEntity.dirtyPlatesCount--;
                    pickedAny = true;
                }

                if (this.targetEntity.dirtyPlatesCount <= 0) {
                    this.targetEntity.dirty = false;
                    this.targetEntity.dirtyPlatesCount = 0;
                    this.targetEntity.dirtyPlatesValue = 0;
                }
                if (pickedAny) {
                    sound.playServe();
                }
                this.state = 'deliveringPlates';
            }
        } else if (this.state === 'deliveringPlates') {
            const tx = this.game.dishwasher.x + 45;
            const ty = this.game.dishwasher.y;
            if (this.path.length === 0 || this.targetX !== tx || this.targetY !== ty) {
                this.targetX = tx;
                this.targetY = ty;
                this.path = nav.findPath(this.x, this.y, tx, ty);
            }
            this.navigateAlongPath();
            if (this.path.length === 0 && Math.hypot(this.x - this.game.dishwasher.x, this.y - this.game.dishwasher.y) < 85) {
                // Drop all dirty plates in dishwasher at once
                let placedAny = false;
                while (this.carryStack.length > 0) {
                    const topItem = this.carryStack[this.carryStack.length - 1];
                    if (topItem && typeof topItem === 'object' && topItem.type === 'dirty_plate') {
                        this.game.dishwasher.dirtyStack.push(this.carryStack.pop());
                        placedAny = true;
                    } else {
                        break;
                    }
                }
                if (placedAny) {
                    sound.playServe();
                }
                this.state = 'idle';
            }
        } else if (this.state === 'clearingCash') {
            if (!this.targetEntity || !this.game.cashList.includes(this.targetEntity)) {
                this.state = 'idle';
                return;
            }

            this.navigateAlongPath();
            if (this.path.length === 0 && Math.hypot(this.x - this.targetEntity.x, this.y - this.targetEntity.y) < 20) {
                this.game.collectCash(this.targetEntity);
                this.state = 'idle';
            }
        } else if (this.state === 'returningFood') {
            if (!this.targetEntity || !this.targetEntity.unlocked || this.targetEntity.preparedStack.length >= 10) {
                this.state = 'idle';
                return;
            }

            this.navigateAlongPath();
            if (this.path.length === 0 && Math.hypot(this.x - this.targetEntity.x, this.y - (this.targetEntity.y + 40)) < 25) {
                if (this.targetEntity.preparedStack.length < 10) {
                    this.targetEntity.preparedStack.push(this.carryStack.pop());
                    sound.playServe();
                }
                this.state = 'idle';
            }
        }
    }

    navigateAlongPath() {
        if (this.path.length === 0) return;
        const [tx, ty] = this.path[0];
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            if (Math.random() < 0.05) {
                this.game.particles.push(new Particle(this.x, this.y + 15, 'rgba(255,165,0,0.12)', 'dust'));
            }
        } else {
            this.path.shift();
        }
    }

    findCustomerNeedingFood() {
        return this.game.customers.find(c => 
            c.state === 'waitingAtTable' && 
            c.foodDeliveredCount < c.order.qty &&
            (!c.table || !c.table.foodStack || c.table.foodStack.length < 6)
        ) || null;
    }

    findCustomerNeedingThisFood(foodId) {
        return this.game.customers.find(c => 
            c.state === 'waitingAtTable' && 
            c.order.recipe.id === foodId && 
            c.foodDeliveredCount < c.order.qty &&
            (!c.table || !c.table.foodStack || c.table.foodStack.length < 6)
        ) || null;
    }

    findDirtyTable() {
        return this.game.tables.find(t => t.unlocked && t.dirty && t.dirtyPlatesCount > 0) || null;
    }

    findCashierQueueNeededFood() {
        if (this.game.counterQueue.length > 0) {
            const customer = this.game.counterQueue[0];
            if (customer.order && customer.foodDeliveredCount < customer.order.qty) {
                return customer.order.recipe.id;
            }
        }
        return null;
    }

    findDriveThruNeededFood() {
        if (this.game.cars.length > 0) {
            const car = this.game.cars.find(c => c.state === 'waiting');
            if (car && car.order && car.foodDeliveredCount < car.order.qty) {
                return car.order.recipe.id;
            }
        }
        return null;
    }

    findNearestCash() {
        if (this.game.cashList.length === 0) return null;
        let best = null;
        let minDist = Infinity;
        this.game.cashList.forEach(c => {
            const d = Math.hypot(c.x - this.x, c.y - this.y);
            if (d < minDist) {
                minDist = d;
                best = c;
            }
        });
        return best;
    }

    draw(ctx) {
        const isMoving = this.path.length > 0;
        const bob = isMoving ? Math.abs(Math.sin(this.bounce)) * 3 : 0;
        DRAW_DETAILED_CHARACTER(ctx, this.x, this.y, this.w, this.h, this.color, this.skinColor, this.bounce, isMoving, this.type);

        if (this.carryStack.length > 0) {
            ctx.save();
            ctx.translate(this.x, this.y - bob - 10);
            ctx.rotate(this.stackAngle);
            for (let i = 0; i < this.carryStack.length; i++) {
                const item = this.carryStack[i];
                if (typeof item === 'string') {
                    const recipe = RECIPES[item];
                    if (recipe) recipe.draw(ctx, 0, -i * 12, 18);
                } else if (item && item.type === 'dirty_plate') {
                    DRAW_DIRTY_PLATE(ctx, 0, -i * 7, 16);
                }
            }
            ctx.restore();
        }
    }
}

// ============================================================================
// 8. CORE GAME MANAGER
// ============================================================================
class Game {
    constructor() {
        console.log("Dhaba Tycoon: Game constructor initialized.");
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 1400;
        this.height = 1200;
        
        this.running = false;
        this.isResetting = false;
        this.restaurantName = "Bharat Dhaba";
        this.tutorialSkipped = false;
        this.controlsOverlayVisible = true;
        this.enableAds = false; // Set to true for Full Launch (monetized), false for Basic Launch (no ads)
        
        this.cash = 0;
        this.startingCashGranted = false;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;
        // Independent Hosting Mode

        
        this.upgrades = {
            playerSpeed: 1,
            playerCapacity: 1,
            workerSpeed: 1,
            workerCapacity: 1
        };

        this.prices = {
            idli: 10,
            dosa: 22,
            chappathi: 35,
            parotta: 50,
            noodles: 70,
            friedrice: 90
        };

        this.stats = {
            totalRevenue: 0,
            customersServed: 0
        };

        this.keys = {};
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            vx: 0,
            vy: 0
        };

        // Camera drag/pan state (right-click desktop, two-finger mobile)
        this.camDrag = {
            active: false,
            lastX: 0,
            lastY: 0,
            offsetX: 0,
            offsetY: 0
        };

        this.player = {
            x: 750,
            y: 700,
            speed: 3.5,
            carryCapacity: 3,
            carryStack: [],
            w: 30,
            h: 50,
            bounce: 0,
            stackAngle: 0,
            stackAngleVel: 0,
            lastX: 750
        };

        this.manualCookStation = null;
        this.manualCookProgress = 0;
        
        this.customers = [];
        this.staffList = [];
        this.cars = [];
        this.cashList = [];
        this.particles = [];
        
        this.counterQueue = [];
        this.counterBuffer = [];
        this.driveThruBuffer = [];

        this.vending1Unlocked = false;
        this.vending2Unlocked = false;
        this.vendingCustomers = [];
        this.vendingSpawnTimer = 0;

        // Dining Tables (All start locked for a true 0% progress start)
        this.tables = [
            // Single seaters (6 tables on the right side)
            { id: 'single_1', x: 1050, y: 550, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },
            { id: 'single_2', x: 1250, y: 550, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },
            { id: 'single_3', x: 1050, y: 750, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },
            { id: 'single_4', x: 1250, y: 750, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },
            { id: 'single_5', x: 1050, y: 950, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },
            { id: 'single_6', x: 1250, y: 950, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: 0, yOffset: 0 } ], isSingleSeater: true },

            // Double seaters (4 tables on the left side)
            { id: 'double_1', x: 350, y: 750, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: -22, yOffset: 0 }, { occupant: null, xOffset: 22, yOffset: 0 } ] },
            { id: 'double_2', x: 550, y: 750, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: -22, yOffset: 0 }, { occupant: null, xOffset: 22, yOffset: 0 } ] },
            { id: 'double_3', x: 350, y: 950, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: -22, yOffset: 0 }, { occupant: null, xOffset: 22, yOffset: 0 } ] },
            { id: 'double_4', x: 550, y: 950, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [ { occupant: null, xOffset: -22, yOffset: 0 }, { occupant: null, xOffset: 22, yOffset: 0 } ] },

            // Four seaters (2 tables on the left side)
            { id: 'four_1', x: 350, y: 550, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [
                { occupant: null, xOffset: -30, yOffset: 0 },
                { occupant: null, xOffset: 30, yOffset: 0 },
                { occupant: null, xOffset: 0, yOffset: -30 },
                { occupant: null, xOffset: 0, yOffset: 30 }
            ], isRound4Seater: true },
            { id: 'four_2', x: 550, y: 550, unlocked: false, isSofa: false, dirty: false, dirtyPlatesCount: 0, dirtyPlatesValue: 0, foodStack: [], seats: [
                { occupant: null, xOffset: -30, yOffset: 0 },
                { occupant: null, xOffset: 30, yOffset: 0 },
                { occupant: null, xOffset: 0, yOffset: -30 },
                { occupant: null, xOffset: 0, yOffset: 30 }
            ], isRound4Seater: true }
        ];

        // Dishwasher machine counter setup (placed flush against left wall)
        this.dishwasher = {
            x: 180,
            y: 240,
            dirtyStack: [],
            washTimer: 0
        };

        this.stations = [
            { id: 'idli', name: 'Idli', x: 300, y: 240, color: '#e5c290', unlocked: false, preparedStack: [], timer: 0, hasChef: false },
            { id: 'dosa', name: 'Dosa', x: 480, y: 240, color: '#8d6e63', unlocked: false, preparedStack: [], timer: 0, hasChef: false },
            { id: 'chappathi', name: 'Chappathi', x: 660, y: 240, color: '#a1887f', unlocked: false, preparedStack: [], timer: 0, hasChef: false },
            { id: 'parotta', name: 'Parotta', x: 840, y: 240, color: '#bcaaa4', unlocked: false, preparedStack: [], timer: 0, hasChef: false },
            { id: 'noodles', name: 'Noodles', x: 1020, y: 240, color: '#455a64', unlocked: false, preparedStack: [], timer: 0, hasChef: false },
            { id: 'friedrice', name: 'Fried Rice', x: 1200, y: 240, color: '#37474f', unlocked: false, preparedStack: [], timer: 0, hasChef: false }
        ];

        // Sequenced Unlock circles
        this.unlockTiles = [
            // Single Dining Tables (6 tables)
            { id: 'single_1', targetId: 'single_1', type: 'table', x: 1050, y: 610, cost: 50, currentInvested: 0, label: 'Unlock Single 1' },
            { id: 'single_2', targetId: 'single_2', type: 'table', x: 1250, y: 610, cost: 50, currentInvested: 0, label: 'Unlock Single 2', dependency: 'single_1' },
            { id: 'single_3', targetId: 'single_3', type: 'table', x: 1050, y: 810, cost: 50, currentInvested: 0, label: 'Unlock Single 3', dependency: 'single_2' },
            { id: 'single_4', targetId: 'single_4', type: 'table', x: 1250, y: 810, cost: 50, currentInvested: 0, label: 'Unlock Single 4', dependency: 'single_3' },
            { id: 'single_5', targetId: 'single_5', type: 'table', x: 1050, y: 1010, cost: 50, currentInvested: 0, label: 'Unlock Single 5', dependency: 'single_4' },
            { id: 'single_6', targetId: 'single_6', type: 'table', x: 1250, y: 1010, cost: 50, currentInvested: 0, label: 'Unlock Single 6', dependency: 'single_5' },

            // Single Table Sofas Upgrades (one-by-one)
            { id: 'single_1_sofa', targetId: 'single_1_sofa', type: 'sofa', x: 1050, y: 610, cost: 50, currentInvested: 0, label: 'Single 1 Sofa', dependency: 'single_1' },
            { id: 'single_2_sofa', targetId: 'single_2_sofa', type: 'sofa', x: 1250, y: 610, cost: 50, currentInvested: 0, label: 'Single 2 Sofa', dependency: 'single_2' },
            { id: 'single_3_sofa', targetId: 'single_3_sofa', type: 'sofa', x: 1050, y: 810, cost: 50, currentInvested: 0, label: 'Single 3 Sofa', dependency: 'single_3' },
            { id: 'single_4_sofa', targetId: 'single_4_sofa', type: 'sofa', x: 1250, y: 810, cost: 50, currentInvested: 0, label: 'Single 4 Sofa', dependency: 'single_4' },
            { id: 'single_5_sofa', targetId: 'single_5_sofa', type: 'sofa', x: 1050, y: 1010, cost: 50, currentInvested: 0, label: 'Single 5 Sofa', dependency: 'single_5' },
            { id: 'single_6_sofa', targetId: 'single_6_sofa', type: 'sofa', x: 1250, y: 1010, cost: 50, currentInvested: 0, label: 'Single 6 Sofa', dependency: 'single_6' },

            // Double Dining Tables (4 tables, unlocked after ALL single sofas are completed)
            { id: 'double_1', targetId: 'double_1', type: 'table', x: 350, y: 810, cost: 200, currentInvested: 0, label: 'Unlock Double 1', dependency: 'all_single_sofas' },
            { id: 'double_2', targetId: 'double_2', type: 'table', x: 550, y: 810, cost: 200, currentInvested: 0, label: 'Unlock Double 2', dependency: 'double_1' },
            { id: 'double_3', targetId: 'double_3', type: 'table', x: 350, y: 1010, cost: 200, currentInvested: 0, label: 'Unlock Double 3', dependency: 'double_2' },
            { id: 'double_4', targetId: 'double_4', type: 'table', x: 550, y: 1010, cost: 200, currentInvested: 0, label: 'Unlock Double 4', dependency: 'double_3' },

            // Double Table Sofas Upgrades (one-by-one)
            { id: 'double_1_sofa', targetId: 'double_1_sofa', type: 'sofa', x: 350, y: 810, cost: 200, currentInvested: 0, label: 'Double 1 Sofa', dependency: 'double_1' },
            { id: 'double_2_sofa', targetId: 'double_2_sofa', type: 'sofa', x: 550, y: 810, cost: 200, currentInvested: 0, label: 'Double 2 Sofa', dependency: 'double_2' },
            { id: 'double_3_sofa', targetId: 'double_3_sofa', type: 'sofa', x: 350, y: 1010, cost: 200, currentInvested: 0, label: 'Double 3 Sofa', dependency: 'double_3' },
            { id: 'double_4_sofa', targetId: 'double_4_sofa', type: 'sofa', x: 550, y: 1010, cost: 200, currentInvested: 0, label: 'Double 4 Sofa', dependency: 'double_4' },

            // Four-Seater Dining Tables (2 tables, unlocked after ALL double sofas are completed)
            { id: 'four_1', targetId: 'four_1', type: 'table', x: 350, y: 610, cost: 500, currentInvested: 0, label: 'Unlock 4-Seater 1', dependency: 'all_double_sofas' },
            { id: 'four_2', targetId: 'four_2', type: 'table', x: 550, y: 610, cost: 500, currentInvested: 0, label: 'Unlock 4-Seater 2', dependency: 'four_1' },

            // Four-Seater Table Sofas Upgrades (one-by-one)
            { id: 'four_1_sofa', targetId: 'four_1_sofa', type: 'sofa', x: 350, y: 610, cost: 500, currentInvested: 0, label: '4-Seater 1 Sofa', dependency: 'four_1' },
            { id: 'four_2_sofa', targetId: 'four_2_sofa', type: 'sofa', x: 550, y: 610, cost: 500, currentInvested: 0, label: '4-Seater 2 Sofa', dependency: 'four_2' },

            // Stations
            { id: 'station_idli', targetId: 'idli', type: 'station', x: 300, y: 310, cost: 50, currentInvested: 0, label: 'Unlock Idli', dependency: 'single_1' },
            { id: 'station_dosa', targetId: 'dosa', type: 'station', x: 480, y: 310, cost: 150, currentInvested: 0, label: 'Unlock Dosa', dependency: 'single_2' },
            { id: 'station_chappathi', targetId: 'chappathi', type: 'station', x: 660, y: 310, cost: 400, currentInvested: 0, label: 'Unlock Chappathi', dependency: 'single_4' },
            { id: 'station_parotta', targetId: 'parotta', type: 'station', x: 840, y: 310, cost: 800, currentInvested: 0, label: 'Unlock Parotta', dependency: 'drive_thru' },
            { id: 'station_noodles', targetId: 'noodles', type: 'station', x: 1020, y: 310, cost: 1500, currentInvested: 0, label: 'Unlock Noodles', dependency: 'chef_parotta' },
            { id: 'station_friedrice', targetId: 'friedrice', type: 'station', x: 1200, y: 310, cost: 3000, currentInvested: 0, label: 'Unlock Fried Rice', dependency: 'chef_noodles' },

            // Chefs
            { id: 'chef_idli', targetId: 'idli', type: 'chef', x: 300, y: 180, cost: 80, currentInvested: 0, label: 'Hire Idli Chef', dependency: 'station_idli' },
            { id: 'chef_dosa', targetId: 'dosa', type: 'chef', x: 480, y: 180, cost: 150, currentInvested: 0, label: 'Hire Dosa Chef', dependency: 'station_dosa' },
            { id: 'chef_chappathi', targetId: 'chappathi', type: 'chef', x: 660, y: 180, cost: 300, currentInvested: 0, label: 'Hire Chappathi Chef', dependency: 'station_chappathi' },
            { id: 'chef_parotta', targetId: 'parotta', type: 'chef', x: 840, y: 180, cost: 500, currentInvested: 0, label: 'Hire Parotta Chef', dependency: 'station_parotta' },
            { id: 'chef_noodles', targetId: 'noodles', type: 'chef', x: 1020, y: 180, cost: 800, currentInvested: 0, label: 'Hire Noodles Chef', dependency: 'station_noodles' },
            { id: 'chef_friedrice', targetId: 'friedrice', type: 'chef', x: 1200, y: 180, cost: 1200, currentInvested: 0, label: 'Hire Rice Chef', dependency: 'station_friedrice' },

            // Cashiers
            { id: 'cashier_1', targetId: 'cashier_1', type: 'cashier', x: 750, y: 410, cost: 200, currentInvested: 0, label: 'Hire Cashier', dependency: 'chef_dosa' },
            { id: 'cashier_2', targetId: 'cashier_2', type: 'cashier', x: 180, y: 720, cost: 500, currentInvested: 0, label: 'Drive Cashier', dependency: 'drive_thru' },

            // Drive Thru Counter
            { id: 'drive_thru', targetId: 'drive_thru', type: 'drive_thru', x: 180, y: 650, cost: 1000, currentInvested: 0, label: 'Drive-Thru', dependency: 'chef_chappathi' },

            // Vending Machines
            { id: 'vending_1', targetId: 'vending_1', type: 'vending', x: 640, y: 1010, cost: 400, currentInvested: 0, label: 'Unlock Vending 1', dependency: 'single_3' },
            { id: 'vending_2', targetId: 'vending_2', type: 'vending', x: 860, y: 1010, cost: 800, currentInvested: 0, label: 'Unlock Vending 2', dependency: 'vending_1' },
        ];

        this.counter1Unlocked = false;
        this.counter2Unlocked = false;
        this.driveThruUnlocked = false;
        this.victoryTriggered = false;

        this.customerSpawnTimer = 0;
        this.carSpawnTimer = 0;
        this.saveTimer = 0;

        this.initUI();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.loadGame();
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        this.canvas.width = winW * dpr;
        this.canvas.height = winH * dpr;
        this.canvas.style.width = `${winW}px`;
        this.canvas.style.height = `${winH}px`;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    initUI() {
        console.log("Dhaba Tycoon: initUI called.");
        
        const skipBtn = document.getElementById('btn-skip-tutorial');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.skipTutorial();
            });
        }

        document.getElementById('btn-start').addEventListener('click', () => {
            console.log("Dhaba Tycoon: Start button clicked.");
            sound.init();
            
            // Read name from input field
            const nameInput = document.getElementById('restaurant-name-input');
            if (nameInput && nameInput.value.trim() !== '') {
                this.restaurantName = nameInput.value.trim();
            }
            
            // Save immediately so name is persisted
            this.saveGame();
            
            // Show the banners
            const banner = document.getElementById('restaurant-name-banner');
            const bannerText = document.getElementById('restaurant-name-text');
            if (bannerText) {
                bannerText.textContent = this.restaurantName;
            }
            if (banner) {
                banner.classList.remove('hidden');
            }
            
            document.getElementById('splash-screen').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            this.running = true;
            
            // Update HUD immediately to reflect loaded values
            this.updateHUD();

            // Report gameplay start to CrazyGames SDK
            if (this.crazySDK && this.crazySDK.game) {
                try {
                    this.crazySDK.game.gameplayStart();
                    console.log("Dhaba Tycoon: Reported gameplayStart to SDK.");
                } catch (e) {
                    console.warn("Dhaba Tycoon: Failed to call gameplayStart:", e);
                }
            }

            // Grant starting cash of ₹250 after 1 second if not already granted
            if (!this.startingCashGranted) {
                setTimeout(() => {
                    this.cash = 450;
                    this.startingCashGranted = true;
                    this.updateHUD();
                    this.saveGame();
                    sound.playCoin();
                    this.particles.push(new FloatingText(this.player.x, this.player.y - 30, "+₹450 Starting Cash! 💵", "#4cd964"));
                    for (let i = 0; i < 15; i++) {
                        this.particles.push(new Particle(this.player.x, this.player.y, '#4cd964', 'sparkle'));
                    }
                }, 1000);
            }

            this.loop();
        });

        const shopModal = document.getElementById('shop-overlay');
        document.getElementById('btn-upgrades').addEventListener('click', () => {
            shopModal.classList.remove('hidden');
            this.updateShopUI();
            this.renderPricingMenu();
        });
        document.getElementById('btn-close-shop').addEventListener('click', () => {
            shopModal.classList.add('hidden');
        });

        document.getElementById('btn-tab-player').addEventListener('click', () => {
            this.toggleModalTab('btn-tab-player', 'tab-pane-player');
        });
        document.getElementById('btn-tab-staff').addEventListener('click', () => {
            this.toggleModalTab('btn-tab-staff', 'tab-pane-staff');
        });

        document.getElementById('buy-player-speed').addEventListener('click', () => this.purchaseUpgrade('playerSpeed'));
        document.getElementById('buy-player-capacity').addEventListener('click', () => this.purchaseUpgrade('playerCapacity'));
        document.getElementById('buy-worker-speed').addEventListener('click', () => this.purchaseUpgrade('workerSpeed'));
        document.getElementById('buy-worker-capacity').addEventListener('click', () => this.purchaseUpgrade('workerCapacity'));

        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-overlay').classList.remove('hidden');
        });
        document.getElementById('btn-close-settings').addEventListener('click', () => {
            document.getElementById('settings-overlay').classList.add('hidden');
        });

        const sndBtn = document.getElementById('btn-toggle-sound');
        sndBtn.addEventListener('click', () => {
            const current = sound.toggle();
            sndBtn.textContent = current ? "ON" : "OFF";
            sndBtn.className = current ? "toggle-btn on" : "toggle-btn";
        });

        document.getElementById('btn-reset-game').addEventListener('click', () => {
            if (confirm("Reset game?")) {
                this.isResetting = true;
                localStorage.removeItem('dhaba_tycoon_save');
                location.reload();
            }
        });

        document.getElementById('btn-victory-continue').addEventListener('click', () => {
            document.getElementById('victory-overlay').classList.add('hidden');
            this.victoryTriggered = true;
            this.saveGame();
        });

        document.getElementById('btn-victory-reset').addEventListener('click', () => {
            if (confirm("Are you sure you want to reset your progress? This starts the game over from 0%.")) {
                this.isResetting = true;
                localStorage.removeItem('dhaba_tycoon_save');
                location.reload();
            }
        });

        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        const jZone = document.getElementById('joystick-zone');
        const jHandle = document.getElementById('joystick-handle');
        
        const handleStart = (e) => {
            if (e.target.closest('button') || e.target.closest('.modal') || !this.running) {
                return;
            }
            const touch = e.touches ? e.touches[0] : e;
            
            const containerRect = document.getElementById('game-container').getBoundingClientRect();
            const clientX = touch.clientX - containerRect.left;
            const clientY = touch.clientY - containerRect.top;
            
            this.joystick.active = true;
            this.joystick.startX = touch.clientX;
            this.joystick.startY = touch.clientY;
            this.joystick.currentX = touch.clientX;
            this.joystick.currentY = touch.clientY;
            
            jZone.style.left = `${clientX - 55}px`;
            jZone.style.top = `${clientY - 55}px`;
            jZone.style.display = 'block';
            
            if (e.touches && e.cancelable) e.preventDefault();
        };

        const handleMove = (e) => {
            if (!this.joystick.active) return;
            const touch = e.touches ? e.touches[0] : e;
            this.joystick.currentX = touch.clientX;
            this.joystick.currentY = touch.clientY;

            const dx = this.joystick.currentX - this.joystick.startX;
            const dy = this.joystick.currentY - this.joystick.startY;
            const dist = Math.hypot(dx, dy);
            const maxD = 40;

            if (dist === 0) {
                this.joystick.vx = 0;
                this.joystick.vy = 0;
            } else {
                const angle = Math.atan2(dy, dx);
                const limitD = Math.min(dist, maxD);
                jHandle.style.transform = `translate(${Math.cos(angle) * limitD}px, ${Math.sin(angle) * limitD}px)`;
                this.joystick.vx = Math.cos(angle) * (limitD / maxD);
                this.joystick.vy = Math.sin(angle) * (limitD / maxD);
            }
            if (e.touches && e.cancelable) e.preventDefault();
        };

        const handleEnd = () => {
            if (!this.joystick.active) return;
            this.joystick.active = false;
            jHandle.style.transform = 'translate(0px, 0px)';
            this.joystick.vx = 0;
            this.joystick.vy = 0;
            jZone.style.display = 'none';
        };

        this.canvas.addEventListener('touchstart', handleStart, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        this.canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        // ── Camera Pan: Right-click drag (Desktop) ──────────────────────────
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2 && this.running) {
                this.camDrag.active = true;
                this.camDrag.lastX = e.clientX;
                this.camDrag.lastY = e.clientY;
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.camDrag.active) return;
            const dx = this.camDrag.lastX - e.clientX;
            const dy = this.camDrag.lastY - e.clientY;
            this.camDrag.offsetX += dx;
            this.camDrag.offsetY += dy;
            this.camDrag.lastX = e.clientX;
            this.camDrag.lastY = e.clientY;
            // Clamp to reasonable range
            const maxOff = 900;
            this.camDrag.offsetX = Math.max(-maxOff, Math.min(maxOff, this.camDrag.offsetX));
            this.camDrag.offsetY = Math.max(-maxOff, Math.min(maxOff, this.camDrag.offsetY));
            this.updateCamDragButton();
        });
        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) this.camDrag.active = false;
        });

        // ── Camera Pan: Two-finger drag (Mobile) ────────────────────────────
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2 && this.running) {
                this.camDrag.active = true;
                this.camDrag.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                this.camDrag.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });
        window.addEventListener('touchmove', (e) => {
            if (!this.camDrag.active || e.touches.length < 2) return;
            const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this.camDrag.offsetX += (this.camDrag.lastX - mx);
            this.camDrag.offsetY += (this.camDrag.lastY - my);
            this.camDrag.lastX = mx;
            this.camDrag.lastY = my;
            const maxOff = 900;
            this.camDrag.offsetX = Math.max(-maxOff, Math.min(maxOff, this.camDrag.offsetX));
            this.camDrag.offsetY = Math.max(-maxOff, Math.min(maxOff, this.camDrag.offsetY));
            this.updateCamDragButton();
            if (e.cancelable) e.preventDefault();
        }, { passive: false });
        window.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) this.camDrag.active = false;
        });

        window.addEventListener('beforeunload', () => {
            if (!this.isResetting) {
                this.saveGame();
            }
        });
    }

    toggleModalTab(activeBtnId, activePaneId) {
        document.getElementById('btn-tab-player').classList.remove('active');
        document.getElementById('btn-tab-staff').classList.remove('active');
        document.getElementById('tab-pane-player').classList.remove('active');
        document.getElementById('tab-pane-staff').classList.remove('active');

        document.getElementById(activeBtnId).classList.add('active');
        document.getElementById(activePaneId).classList.add('active');
    }

    getMaxPrice(recipeId) {
        const lvl = Math.min(100, Math.max(1, this.level));
        const pct = (lvl - 1) / 99;

        const caps = {
            idli: { base: 10, ceil: 20 },
            dosa: { base: 22, ceil: 40 },
            chappathi: { base: 35, ceil: 60 },
            parotta: { base: 50, ceil: 80 },
            noodles: { base: 70, ceil: 100 },
            friedrice: { base: 90, ceil: 120 }
        };

        const config = caps[recipeId];
        if (!config) return 10;

        return Math.round(config.base + pct * (config.ceil - config.base));
    }

    renderPricingMenu() {
        // The Pricing UI has been completely removed.
        // We simply enforce the base price lock here silently.
        const unlocked = this.getUnlockedRecipes();
        unlocked.forEach(recipe => {
            this.prices[recipe.id] = recipe.basePrice;
        });
    }

    saveGame() {
        try {
            const state = {
                cash: this.cash,
                level: this.level,
                xp: this.xp,
                upgrades: this.upgrades,
                prices: this.prices,
                stats: this.stats,
                playerX: this.player.x,
                playerY: this.player.y,
                vending1Unlocked: this.vending1Unlocked,
                vending2Unlocked: this.vending2Unlocked,
                victoryTriggered: this.victoryTriggered,
                restaurantName: this.restaurantName,
                startingCashGranted: this.startingCashGranted,
                tutorialSkipped: this.tutorialSkipped,
                tableFoodStacks: this.tables.map(t => ({ id: t.id, foodStack: t.foodStack })),
                unlockedNodes: [
                    ...this.unlockTiles.filter(t => {
                        if (t.type === 'station') return this.stations.find(s => s.id === t.targetId).unlocked;
                        if (t.type === 'chef') return this.stations.find(s => s.id === t.targetId).hasChef;
                        if (t.type === 'table') return this.tables.find(tbl => tbl.id === t.targetId).unlocked;
                        if (t.type === 'sofa') return this.tables.find(tbl => tbl.id === t.targetId.split('_sofa')[0]).isSofa;
                        if (t.type === 'drive_thru') return this.driveThruUnlocked;
                        if (t.type === 'cashier') return t.targetId === 'cashier_1' ? this.counter1Unlocked : this.counter2Unlocked;
                        if (t.type === 'vending') return t.targetId === 'vending_1' ? this.vending1Unlocked : this.vending2Unlocked;
                        return false;
                    }).map(t => t.id),
                    ...this.staffList.filter(s => s.type === 'worker').map(s => `worker_${s.id}`)
                ],
                investments: this.unlockTiles.map(t => ({ id: t.id, invested: t.currentInvested }))
            };
            localStorage.setItem('dhaba_tycoon_save', JSON.stringify(state));
        } catch (e) {
            console.warn("Storage save failed (usually blocked inside iframe):", e);
        }
    }

    loadGame() {
        let raw = null;
        try {
            raw = localStorage.getItem('dhaba_tycoon_save');
        } catch (e) {
            console.warn("Storage load blocked (usually blocked inside iframe):", e);
        }
        if (!raw) return;
        try {
            const state = JSON.parse(raw);
            this.cash = state.cash || 0;
            this.level = state.level || 1;
            this.xp = state.xp || 0;
            this.startingCashGranted = state.startingCashGranted || false;
            
            this.restaurantName = state.restaurantName || "Bharat Dhaba";
            const nameInput = document.getElementById('restaurant-name-input');
            if (nameInput) {
                nameInput.value = this.restaurantName;
            }
            const bannerText = document.getElementById('restaurant-name-text');
            if (bannerText) {
                bannerText.textContent = this.restaurantName;
            }
            this.upgrades = state.upgrades || this.upgrades;
            this.prices = state.prices || this.prices;
            Object.keys(this.prices).forEach(key => {
                this.prices[key] = RECIPES[key]?.basePrice || 10;
            });
            this.stats = state.stats || this.stats;

            if (state.playerX !== undefined) this.player.x = state.playerX;
            if (state.playerY !== undefined) this.player.y = state.playerY;
            this.vending1Unlocked = state.vending1Unlocked || false;
            this.vending2Unlocked = state.vending2Unlocked || false;
            this.victoryTriggered = state.victoryTriggered || false;
            this.tutorialSkipped = state.tutorialSkipped || false;

            if (state.tableFoodStacks) {
                state.tableFoodStacks.forEach(tfs => {
                    const table = this.tables.find(t => t.id === tfs.id);
                    if (table) table.foodStack = tfs.foodStack || [];
                });
            }

            if (state.investments) {
                state.investments.forEach(inv => {
                    const tile = this.unlockTiles.find(t => t.id === inv.id);
                    if (tile) tile.currentInvested = inv.invested;
                });
            }

            if (state.unlockedNodes) {
                state.unlockedNodes.forEach(nodeId => {
                    const tile = this.unlockTiles.find(t => t.id === nodeId);
                    if (tile) {
                        tile.currentInvested = tile.cost;
                        this.activateUnlock(tile, true);
                    } else if (nodeId.startsWith('worker_')) {
                        const num = parseInt(nodeId.split('_')[1]);
                        if (!this.staffList.some(s => s.type === 'worker' && s.id === num)) {
                            this.staffList.push(new Staff(this, 'worker', num));
                        }
                    }
                });
            }

            // Proactive cleanup of duplicate workers from older broken saves
            const seenWorkers = new Set();
            this.staffList = this.staffList.filter(s => {
                if (s.type === 'worker') {
                    if (seenWorkers.has(s.id)) return false;
                    seenWorkers.add(s.id);
                }
                return true;
            });

            this.xpNeeded = 10 * this.level;
            this.updateHUD();
            nav.updateObstacles(this.tables, this.stations, this.counter1Unlocked, this.counter2Unlocked, this.dishwasher, this.vending1Unlocked, this.vending2Unlocked);
        } catch (e) {
            console.error("Failed loading save:", e);
        }
    }


    purchaseUpgrade(type) {
        const lvl = this.upgrades[type];
        if (lvl >= 5) return;
        const cost = this.getUpgradeCost(type, lvl);
        if (this.cash >= cost) {
            this.cash -= cost;
            this.upgrades[type]++;
            
            // Live-update all active workers with their new upgraded stats
            if (type === 'workerSpeed' || type === 'workerCapacity') {
                this.staffList.forEach(s => {
                    if (s.type === 'worker') {
                        s.speed = 1.8 + this.upgrades.workerSpeed * 0.85;
                        s.carryCapacity = 1 + this.upgrades.workerCapacity;
                    }
                });
            }

            sound.playUpgrade();
            this.addXP(cost * 0.1);
            this.updateHUD();
            this.updateShopUI();
            this.saveGame();
        }
    }

    getUpgradeCost(type, lvl) {
        const costs = {
            playerSpeed: [100, 300, 800, 2000],
            playerCapacity: [150, 450, 1200, 3000],
            workerSpeed: [200, 600, 1500, 4000],
            workerCapacity: [250, 750, 2000, 5000]
        };
        return costs[type][lvl - 1] || 999999;
    }

    updateShopUI() {
        const speedLvl = this.upgrades.playerSpeed;
        document.getElementById('lvl-player-speed').textContent = speedLvl >= 5 ? "MAX" : `Lv. ${speedLvl}`;
        const speedBtn = document.getElementById('buy-player-speed');
        if (speedLvl >= 5) {
            speedBtn.textContent = "MAXED";
            speedBtn.className = "buy-btn maxed";
        } else {
            const cost = this.getUpgradeCost('playerSpeed', speedLvl);
            speedBtn.textContent = `₹${cost}`;
            speedBtn.className = this.cash >= cost ? "buy-btn" : "buy-btn disabled";
        }

        const capLvl = this.upgrades.playerCapacity;
        document.getElementById('lvl-player-capacity').textContent = capLvl >= 5 ? "MAX" : `Lv. ${capLvl}`;
        const capBtn = document.getElementById('buy-player-capacity');
        if (capLvl >= 5) {
            capBtn.textContent = "MAXED";
            capBtn.className = "buy-btn maxed";
        } else {
            const cost = this.getUpgradeCost('playerCapacity', capLvl);
            capBtn.textContent = `₹${cost}`;
            capBtn.className = this.cash >= cost ? "buy-btn" : "buy-btn disabled";
        }

        const wSpeedLvl = this.upgrades.workerSpeed;
        document.getElementById('lvl-worker-speed').textContent = wSpeedLvl >= 5 ? "MAX" : `Lv. ${wSpeedLvl}`;
        const wSpeedBtn = document.getElementById('buy-worker-speed');
        if (wSpeedLvl >= 5) {
            wSpeedBtn.textContent = "MAXED";
            wSpeedBtn.className = "buy-btn maxed";
        } else {
            const cost = this.getUpgradeCost('workerSpeed', wSpeedLvl);
            wSpeedBtn.textContent = `₹${cost}`;
            wSpeedBtn.className = this.cash >= cost ? "buy-btn" : "buy-btn disabled";
        }

        const wCapLvl = this.upgrades.workerCapacity;
        document.getElementById('lvl-worker-capacity').textContent = wCapLvl >= 5 ? "MAX" : `Lv. ${wCapLvl}`;
        const wCapBtn = document.getElementById('buy-worker-capacity');
        if (wCapLvl >= 5) {
            wCapBtn.textContent = "MAXED";
            wCapBtn.className = "buy-btn maxed";
        } else {
            const cost = this.getUpgradeCost('workerCapacity', wCapLvl);
            wCapBtn.textContent = `₹${cost}`;
            wCapBtn.className = this.cash >= cost ? "buy-btn" : "buy-btn disabled";
        }
        
        this.renderWorkerManagement();
    }

    renderWorkerManagement() {
        const container = document.getElementById('worker-management-list');
        if (!container) return;

        const workersConfig = [
            { num: 1, cost: 100, dependency: 'chef_dosa', name: "Serving Worker 1" },
            { num: 2, cost: 250, dependency: 'chef_chappathi', name: "Serving Worker 2" },
            { num: 3, cost: 500, dependency: 'chef_parotta', name: "Serving Worker 3" },
            { num: 4, cost: 1000, dependency: 'chef_noodles', name: "Serving Worker 4" }
        ];

        let html = '';
        workersConfig.forEach(w => {
            const isDepMet = this.checkDependencyMet({ dependency: w.dependency });
            const hired = this.staffList.some(s => s.type === 'worker' && s.id === w.num);

            if (!isDepMet) {
                let depName = "Previous Chef";
                if (w.dependency === 'chef_dosa') depName = "Dosa Chef";
                else if (w.dependency === 'chef_chappathi') depName = "Chappathi Chef";
                else if (w.dependency === 'chef_parotta') depName = "Parotta Chef";
                else if (w.dependency === 'chef_noodles') depName = "Noodles Chef";

                html += `
                    <div class="upgrade-item locked" style="opacity: 0.65;">
                        <div class="upgrade-info">
                            <h3>🔒 ${w.name}</h3>
                            <p>Requires: ${depName} to be hired first.</p>
                        </div>
                        <button class="buy-btn disabled" style="background: #444; color: #aaa; box-shadow: none;">Locked</button>
                    </div>
                `;
            } else if (hired) {
                const refund = Math.floor(w.cost * 0.5);
                html += `
                    <div class="upgrade-item">
                        <div class="upgrade-info">
                            <h3>🤖 ${w.name} (Active)</h3>
                            <p>Speed: Lv. ${this.upgrades.workerSpeed} | Carry: ${this.upgrades.workerCapacity} plates</p>
                        </div>
                        <button class="buy-btn" onclick="window.game.fireWorker(${w.num}, ${refund})" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: white; box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3); border: none; cursor: pointer; border-radius: 10px; font-family: var(--font-heading); font-weight: 800; font-size: 0.9rem; padding: 10px 18px;">Fire</button>
                    </div>
                `;
            } else {
                const canAfford = this.cash >= w.cost;
                html += `
                    <div class="upgrade-item">
                        <div class="upgrade-info">
                            <h3>🤖 ${w.name}</h3>
                            <p>Ready to help clean, serve, and collect tips!</p>
                        </div>
                        <button class="buy-btn ${canAfford ? '' : 'disabled'}" onclick="window.game.hireWorker(${w.num}, ${w.cost})">Hire ₹${w.cost}</button>
                    </div>
                `;
            }
        });
 
        container.innerHTML = html;
    }
 
    hireWorker(num, cost) {
        const alreadyHired = this.staffList.some(s => s.type === 'worker' && s.id === num);
        if (alreadyHired) return;

        if (this.cash >= cost) {
            this.cash -= cost;
            this.staffList.push(new Staff(this, 'worker', num));
            sound.playUnlock();
            
            // Sparkle particles at player position
            for (let i = 0; i < 15; i++) {
                this.particles.push(new Particle(this.player.x, this.player.y, '#4cd964', 'sparkle'));
            }
            this.particles.push(new FloatingText(this.player.x, this.player.y - 15, "WORKER HIRED! 🤖", '#4cd964'));
            
            this.updateShopUI();
            this.updateHUD();
            this.saveGame();
        }
    }

    fireWorker(num, refund) {
        const idx = this.staffList.findIndex(s => s.type === 'worker' && s.id === num);
        if (idx !== -1) {
            const w = this.staffList[idx];
            this.staffList.splice(idx, 1);
            this.cash += refund;
            sound.playUnlock();
            
            // Sparkle particles at worker position
            const wx = w.x || this.player.x;
            const wy = w.y || this.player.y;
            for (let i = 0; i < 15; i++) {
                this.particles.push(new Particle(wx, wy, '#ff4757', 'sparkle'));
            }
            this.particles.push(new FloatingText(wx, wy - 15, "WORKER FIRED! 👋", '#ff4757'));
            
            this.updateShopUI();
            this.updateHUD();
            this.saveGame();
        }
    }

    // ── Camera Pan Helpers ────────────────────────────────────────────────────
    backToPlayer() {
        // Animate camera back to player smoothly via rapid decay
        const snapBack = () => {
            this.camDrag.offsetX *= 0.75;
            this.camDrag.offsetY *= 0.75;
            if (Math.abs(this.camDrag.offsetX) < 1 && Math.abs(this.camDrag.offsetY) < 1) {
                this.camDrag.offsetX = 0;
                this.camDrag.offsetY = 0;
                this.updateCamDragButton();
                return;
            }
            this.updateCamDragButton();
            requestAnimationFrame(snapBack);
        };
        snapBack();
    }

    updateCamDragButton() {
        const btn = document.getElementById('btn-back-to-player');
        const hint = document.getElementById('cam-pan-hint');
        const dist = Math.hypot(this.camDrag.offsetX, this.camDrag.offsetY);
        if (btn) btn.style.display = dist > 50 ? 'flex' : 'none';
        // Show hint briefly at game start (handled by CSS initial display)
    }


    addXP(amt) {
        // Legacy XP leveling is replaced by 26 physical completion milestones.
        this.updateHUD();
    }

    getProgressPercent() {
        let completed = 0;
        
        // 1. Kitchen Stations (6 Unlocked)
        completed += this.stations.filter(s => s.unlocked).length;
        
        // 2. Kitchen Automation (6 Chefs Hired)
        completed += this.stations.filter(s => s.hasChef).length;
        
        // 3. Dining Upgrades (12 Tables Upgraded to Sofas)
        completed += this.tables.filter(t => t.isSofa).length;
        
        // 4. Staff Management (4 Workers Hired)
        completed += Math.min(4, this.staffList.filter(s => s.type === 'worker').length);
        
        // 5. Cashier Counters (2 Cashiers Hired)
        if (this.counter1Unlocked) completed++;
        if (this.counter2Unlocked) completed++;
        
        // 6. Vending Expansion (2 Vending Machines Unlocked)
        if (this.vending1Unlocked) completed++;
        if (this.vending2Unlocked) completed++;

        // 7. Player & Staff Upgrades (16 Upgrades: 4 types * 4 levels each)
        completed += Math.max(0, this.upgrades.playerSpeed - 1);
        completed += Math.max(0, this.upgrades.playerCapacity - 1);
        completed += Math.max(0, this.upgrades.workerSpeed - 1);
        completed += Math.max(0, this.upgrades.workerCapacity - 1);

        return Math.round((completed / 48) * 100);
    }

    updateHUD() {
        document.getElementById('hud-cash').textContent = `₹${this.cash.toLocaleString()}`;
        
        const progressPct = this.getProgressPercent();
        this.level = Math.max(1, progressPct); // Sync level internally with progress (1-100)
        
        const hudLevel = document.getElementById('hud-level');
        if (hudLevel) {
            hudLevel.textContent = `${progressPct}%`;
        }
        
        const progressBar = document.getElementById('level-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPct}%`;
        }
        const progressText = document.getElementById('level-progress-text');
        if (progressText) {
            progressText.textContent = `${progressPct}%`;
        }
    }

    getUnlockedRecipes() {
        return Object.values(RECIPES).filter(r => {
            const s = this.stations.find(st => st.id === r.id);
            return s && s.unlocked;
        });
    }

    findEmptySeat() {
        for (const t of this.tables) {
            if (t.unlocked && !t.dirty) { // Table must NOT be dirty (no empty plates left)
                for (let i = 0; i < t.seats.length; i++) {
                    if (!t.seats[i].occupant) {
                        return { table: t, seatIndex: i };
                    }
                }
            }
        }
        return null;
    }

    joinCounterQueue(customer) {
        if (this.counterQueue.length < 8) {
            this.counterQueue.push(customer);
        } else {
            customer.state = 'leaving';
            customer.path = nav.findPath(customer.x, customer.y, 450, 1150);
        }
    }

    spawnCash(x, y, amount) {
        const billVal = 5;
        const numBills = Math.ceil(amount / billVal);
        for (let i = 0; i < numBills; i++) {
            this.cashList.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y - i * 3.5 + (Math.random() - 0.5) * 4,
                val: billVal,
                targetYOffset: i * 3.5
            });
        }
    }

    collectCash(coin) {
        const idx = this.cashList.indexOf(coin);
        if (idx > -1) {
            this.cashList.splice(idx, 1);
            this.cash += coin.val;
            this.stats.totalRevenue += coin.val;
            sound.playCoin();
            this.particles.push(new FloatingText(coin.x, coin.y, `+₹${coin.val}`, '#4cd964'));
            this.updateHUD();
        }
    }

    // ========================================================================
    // UPDATE
    // ========================================================================
    update() {
        this.saveTimer++;
        if (this.saveTimer >= 300) {
            this.saveTimer = 0;
            this.saveGame();
        }

        // Spawn gentle steam particles from all hot food items to make them look fresh
        this.steamFrame = (this.steamFrame || 0) + 1;
        if (this.steamFrame % 15 === 0) {
            // Stations prepared food stacks
            this.stations.forEach(s => {
                if (s.unlocked && s.preparedStack.length > 0) {
                    this.particles.push(new Particle(s.x + (Math.random() - 0.5) * 20, s.y - 12, 'rgba(240, 240, 240, 0.45)', 'steam'));
                }
            });
            // Dining Tables food stacks
            this.tables.forEach(t => {
                if (t.unlocked && t.foodStack && t.foodStack.length > 0) {
                    this.particles.push(new Particle(t.x + (Math.random() - 0.5) * 30, t.y - 5, 'rgba(240, 240, 240, 0.45)', 'steam'));
                }
            });
            // Cashier counter buffer
            if (this.counterBuffer.length > 0) {
                this.particles.push(new Particle(750 + (Math.random() - 0.5) * 120, 490, 'rgba(240, 240, 240, 0.45)', 'steam'));
            }
            // Drive-thru counter buffer
            if (this.driveThruBuffer.length > 0) {
                this.particles.push(new Particle(180 + (Math.random() - 0.5) * 30, 630, 'rgba(240, 240, 240, 0.45)', 'steam'));
            }
            // Player carried food
            if (this.player.carryStack.length > 0 && typeof this.player.carryStack[this.player.carryStack.length - 1] === 'string') {
                this.particles.push(new Particle(this.player.x + (Math.random() - 0.5) * 10, this.player.y - 20, 'rgba(240, 240, 240, 0.45)', 'steam'));
            }
            // Workers carried food
            this.staffList.forEach(w => {
                if (w.type === 'worker' && w.carryStack.length > 0 && typeof w.carryStack[w.carryStack.length - 1] === 'string') {
                    this.particles.push(new Particle(w.x + (Math.random() - 0.5) * 10, w.y - 20, 'rgba(240, 240, 240, 0.45)', 'steam'));
                }
            });
        }

        // Vending customers spawner
        if (this.vending1Unlocked || this.vending2Unlocked) {
            this.vendingSpawnTimer = (this.vendingSpawnTimer || 0) + 1;
            if (this.vendingSpawnTimer >= 400) {
                this.vendingSpawnTimer = 0;
                const options = [];
                if (this.vending1Unlocked) options.push('vending_1');
                if (this.vending2Unlocked) options.push('vending_2');
                if (options.length > 0 && this.vendingCustomers.length < 5) {
                    const target = options[Math.floor(Math.random() * options.length)];
                    this.vendingCustomers.push(new VendingCustomer(this, target));
                }
            }
        }

        this.player.speed = 3.3 + this.upgrades.playerSpeed * 0.45;
        this.player.carryCapacity = 2 + this.upgrades.playerCapacity * 2;

        let dx = 0;
        let dy = 0;

        if (this.joystick.active) {
            dx = this.joystick.vx;
            dy = this.joystick.vy;
        } else {
            if (this.keys['w'] || this.keys['z'] || this.keys['arrowup']) dy = -1;
            if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
            if (this.keys['a'] || this.keys['q'] || this.keys['arrowleft']) dx = -1;
            if (this.keys['d'] || this.keys['arrowright']) dx = 1;

            if (dx !== 0 && dy !== 0) {
                const length = Math.hypot(dx, dy);
                dx /= length;
                dy /= length;
            }
        }

        if (dx !== 0 || dy !== 0) {
            // Smoothly return camera to player while moving
            if (this.camDrag.offsetX !== 0 || this.camDrag.offsetY !== 0) {
                this.camDrag.offsetX *= 0.88;
                this.camDrag.offsetY *= 0.88;
                if (Math.abs(this.camDrag.offsetX) < 1) this.camDrag.offsetX = 0;
                if (Math.abs(this.camDrag.offsetY) < 1) this.camDrag.offsetY = 0;
                this.updateCamDragButton();
            }

            const nextX = this.player.x + dx * this.player.speed;
            const nextY = this.player.y + dy * this.player.speed;

            const pcol = Math.floor(nextX / GRID_SIZE);
            const prow = Math.floor(nextY / GRID_SIZE);

            const currCol = Math.floor(this.player.x / GRID_SIZE);
            const currRow = Math.floor(this.player.y / GRID_SIZE);
            const isCurrentlyStuck = currCol >= 0 && currCol < COLS && currRow >= 0 && currRow < ROWS && nav.grid[currRow][currCol] === 1;

            if (pcol >= 0 && pcol < COLS && prow >= 0 && prow < ROWS) {
                if (isCurrentlyStuck || nav.grid[prow][pcol] === 0) {
                    this.player.x = nextX;
                    this.player.y = nextY;
                } else {
                    const xcol = Math.floor(nextX / GRID_SIZE);
                    const yrow = Math.floor(this.player.y / GRID_SIZE);
                    if (xcol >= 0 && xcol < COLS && nav.grid[yrow][xcol] === 0) {
                        this.player.x = nextX;
                    } else {
                        const yrow2 = Math.floor(nextY / GRID_SIZE);
                        const xcol2 = Math.floor(this.player.x / GRID_SIZE);
                        if (yrow2 >= 0 && yrow2 < ROWS && nav.grid[yrow2][xcol2] === 0) {
                            this.player.y = nextY;
                        }
                    }
                }
            }

            this.player.bounce += 0.22;
            if (Math.random() < 0.1) {
                this.particles.push(new Particle(this.player.x, this.player.y + 20, 'rgba(255,255,255,0.15)', 'dust'));
            }
            if (Math.floor(this.player.bounce) % 4 === 0 && Math.random() < 0.3) {
                sound.playStep();
            }
        } else {
            this.player.bounce = 0;
        }

        const pvx = this.player.x - this.player.lastX;
        this.player.lastX = this.player.x;
        const targetAngle = -pvx * 0.08;
        const accel = (targetAngle - this.player.stackAngle) * 0.25 - this.player.stackAngleVel * 0.2;
        this.player.stackAngleVel += accel;
        this.player.stackAngle += this.player.stackAngleVel;

        // Update entities
        this.customers.forEach(c => c.update());
        this.vendingCustomers.forEach(c => c.update());
        this.staffList.forEach(s => s.update());
        this.cars.forEach(car => car.update());
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        // Update Plate Washing Machine
        this.updateDishwasher();

        this.cashList.forEach(coin => {
            const dist = Math.hypot(coin.x - this.player.x, coin.y - this.player.y);
            if (dist < 80) {
                const pullSpeed = 0.12 * (80 - dist);
                coin.x += ((this.player.x - coin.x) / dist) * pullSpeed;
                coin.y += ((this.player.y - coin.y) / dist) * pullSpeed;
                if (dist < 15) {
                    this.collectCash(coin);
                }
            }
        });

        // Chef-less manual cooking stand check
        let isCookingManually = false;
        this.stations.forEach(s => {
            if (s.unlocked) {
                if (s.hasChef) {
                    // Chef cooks (Staff update)
                } else {
                    if (s.preparedStack.length < 10) {
                        const dist = Math.hypot(this.player.x - s.x, this.player.y - (s.y + 40));
                        if (dist < 32) {
                            isCookingManually = true;
                            this.manualCookStation = s;
                            this.manualCookProgress += 1.0;

                            const recipe = RECIPES[s.id];
                            if (this.manualCookProgress >= recipe.prepTime) {
                                this.manualCookProgress = 0;
                                s.preparedStack.push(s.id);
                                sound.playServe();
                                for (let i = 0; i < 6; i++) {
                                    this.particles.push(new Particle(s.x, s.y - 10, '#f8f9fa', 'steam'));
                                }
                            }
                        }
                    }
                }
            }
        });

        const cookUI = document.getElementById('manual-cook-container');
        if (isCookingManually && this.manualCookStation) {
            cookUI.classList.remove('hidden');
            const recipe = RECIPES[this.manualCookStation.id];
            document.getElementById('cook-label').textContent = `🍳 Cooking ${recipe.name}...`;
            const pct = (this.manualCookProgress / recipe.prepTime) * 100;
            document.getElementById('manual-cook-progress').style.width = `${pct}%`;
        } else {
            cookUI.classList.add('hidden');
            this.manualCookProgress = 0;
            this.manualCookStation = null;
        }

        // Pick up cooked items
        this.stations.forEach(s => {
            if (s.unlocked && s.preparedStack.length > 0 && this.player.carryStack.length < this.player.carryCapacity) {
                // Ensure player isn't carrying dirty plates (separate items)
                const isCarryingPlates = this.player.carryStack.length > 0 && typeof this.player.carryStack[this.player.carryStack.length - 1] === 'object';
                if (!isCarryingPlates) {
                    const dist = Math.hypot(this.player.x - s.x, this.player.y - (s.y + 40));
                    if (dist < 35) {
                        const plate = s.preparedStack.pop();
                        if (plate) {
                            this.player.carryStack.push(plate);
                            sound.playServe();
                        }
                    }
                }
            }
        });

        // Player Table Cleanups (Standing near dirty tables picks up empty plates)
        this.tables.forEach(t => {
            if (t.unlocked && t.dirty && t.dirtyPlatesCount > 0 && this.player.carryStack.length < this.player.carryCapacity) {
                // Ensure player is empty or carrying dirty plates, not food
                const isCarryingFood = this.player.carryStack.length > 0 && typeof this.player.carryStack[this.player.carryStack.length - 1] === 'string';
                if (!isCarryingFood) {
                    const dist = Math.hypot(this.player.x - t.x, this.player.y - t.y);
                    if (dist < 85) {
                        // Vacuum one plate
                        const plateVal = Math.round(t.dirtyPlatesValue / t.dirtyPlatesCount);
                        this.player.carryStack.push({ type: 'dirty_plate', priceValue: plateVal });
                        t.dirtyPlatesCount--;

                        if (t.dirtyPlatesCount <= 0) {
                            t.dirty = false;
                            t.dirtyPlatesCount = 0;
                            t.dirtyPlatesValue = 0;
                        }
                        sound.playServe();
                    }
                }
            }
        });

        // Player Dishwasher drops (Standing near plate washing machine drops plates inside)
        const distToDishwasher = Math.hypot(this.player.x - this.dishwasher.x, this.player.y - this.dishwasher.y);
        if (distToDishwasher < 85) {
            let placedAny = false;
            while (this.player.carryStack.length > 0) {
                const topItem = this.player.carryStack[this.player.carryStack.length - 1];
                if (topItem && typeof topItem === 'object' && topItem.type === 'dirty_plate') {
                    this.dishwasher.dirtyStack.push(this.player.carryStack.pop());
                    placedAny = true;
                } else {
                    break;
                }
            }
            if (placedAny) {
                sound.playServe();
            }
        }

        // Player Food Serving checks (checks distance to table center: 85px, cashier center: 60px)
        if (this.player.carryStack.length > 0) {
            const currentItem = this.player.carryStack[this.player.carryStack.length - 1];
            const isFood = typeof currentItem === 'string';

            if (isFood) {
                // A. Place food on Dining Tables (checks distance to table center: 85px)
                for (const table of this.tables) {
                    if (table.unlocked && (!table.dirty || table.seats.some(seat => seat.occupant && seat.occupant.state === 'waitingAtTable'))) {
                        const dist = Math.hypot(this.player.x - table.x, this.player.y - table.y);
                        if (dist < 85) {
                            // Calculate net needed items for this table
                            const netNeeded = {};
                            table.seats.forEach(seat => {
                                const customer = seat.occupant;
                                if (customer && customer.order && customer.state === 'waitingAtTable') {
                                    const recipeId = customer.order.recipe.id;
                                    const neededQty = customer.order.qty - customer.foodDeliveredCount;
                                    if (neededQty > 0) {
                                        netNeeded[recipeId] = (netNeeded[recipeId] || 0) + neededQty;
                                    }
                                }
                            });
                            
                            if (table.foodStack) {
                                table.foodStack.forEach(foodId => {
                                    if (netNeeded[foodId] && netNeeded[foodId] > 0) {
                                        netNeeded[foodId]--;
                                    }
                                });
                            }

                            let placedAny = false;
                            // Iterate from top to bottom of carryStack to deliver only what is needed
                            for (let i = this.player.carryStack.length - 1; i >= 0; i--) {
                                if (table.foodStack.length >= 6) break;
                                const item = this.player.carryStack[i];
                                if (typeof item === 'string' && netNeeded[item] && netNeeded[item] > 0) {
                                    this.player.carryStack.splice(i, 1);
                                    table.foodStack.push(item);
                                    netNeeded[item]--;
                                    placedAny = true;
                                }
                            }
                            if (placedAny) {
                                sound.playServe();
                            }
                            break;
                        }
                    }
                }

                // B. Drop food onto the cashier table counter (checks distance to counter center: 60px)
                if (this.player.carryStack.length > 0) {
                    const distToCounter = Math.hypot(this.player.x - 750, this.player.y - 500);
                    if (distToCounter < 60) {
                        let placedAny = false;
                        while (this.player.carryStack.length > 0 && this.counterBuffer.length < 40) {
                            const topItem = this.player.carryStack[this.player.carryStack.length - 1];
                            if (typeof topItem === 'string') {
                                this.counterBuffer.push(this.player.carryStack.pop());
                                placedAny = true;
                            } else {
                                break;
                            }
                        }
                        if (placedAny) {
                            sound.playServe();
                        }
                    }
                }

                // C. Serve Drive Thru directly or buffer
                if (this.driveThruUnlocked && this.player.carryStack.length > 0) {
                    const distToDT = Math.hypot(this.player.x - 180, this.player.y - 650);
                    if (distToDT < 70) {
                        if (this.counter2Unlocked) {
                            while (this.player.carryStack.length > 0 && this.driveThruBuffer.length < 48) {
                                this.driveThruBuffer.push(this.player.carryStack.pop());
                                sound.playServe();
                            }
                        } else {
                            const latest = this.player.carryStack[this.player.carryStack.length - 1];
                            const car = this.cars.find(c => c.state === 'waiting');
                            if (car && car.order && car.order.recipe.id === latest && car.foodDeliveredCount < car.order.qty) {
                                car.foodDeliveredCount++;
                                this.player.carryStack.pop();
                                sound.playServe();
                            }
                        }
                    }
                }
            }
        }

        // If cashier 1 is NOT hired, and player stands near the cashier counter table (distance to center < 60px):
        // Automatically serve the front queue customer using food from the cashier table buffer (this.counterBuffer).
        if (!this.counter1Unlocked && this.counterQueue.length > 0) {
            const distToCounter = Math.hypot(this.player.x - 750, this.player.y - 500);
            if (distToCounter < 60) {
                const customer = this.counterQueue[0];
                if (customer && customer.order) {
                    const neededItem = customer.order.recipe.id;
                    const idx = this.counterBuffer.indexOf(neededItem);
                    if (idx !== -1) {
                        this.counterBuffer.splice(idx, 1);
                        customer.foodDeliveredCount++;
                        sound.playServe();
                    }
                }
            }
        }

        // Stand-on unlock circles
        this.unlockTiles.forEach(tile => {
            if (!this.checkDependencyMet(tile)) return;
            if (this.checkTileUnlocked(tile)) return;

            const dist = Math.hypot(this.player.x - tile.x, this.player.y - tile.y);
            if (dist < 40) {
                const left = tile.cost - tile.currentInvested;
                if (left > 0 && this.cash > 0) {
                    const investSpeed = Math.min(this.cash, Math.max(1, Math.ceil(tile.cost / 60)));
                    const amt = Math.min(left, investSpeed);
                    
                    this.cash -= amt;
                    tile.currentInvested += amt;
                    this.addXP(amt * 0.1); // Spend cash -> get XP
                    this.updateHUD();
                    
                    if (Math.random() < 0.2) {
                        this.particles.push(new Particle(this.player.x, this.player.y, '#4cd964', 'dust'));
                    }

                    if (tile.currentInvested >= tile.cost) {
                        this.activateUnlock(tile);
                    }
                }
            }
        });

        // Customer Spawner
        this.customerSpawnTimer++;
        const spawnDelay = Math.max(180, 420 - this.level * 25);
        if (this.customerSpawnTimer >= spawnDelay) {
            this.customerSpawnTimer = 0;
            if (this.customers.length < 12) {
                this.customers.push(new Customer(this));
            }
        }

        // Drive Thru Spawner
        if (this.driveThruUnlocked) {
            this.carSpawnTimer++;
            const carDelay = Math.max(300, 560 - this.level * 35);
            if (this.carSpawnTimer >= carDelay) {
                this.carSpawnTimer = 0;
                if (this.cars.length < 3) {
                    this.cars.push(new DriveThruCar(this));
                }
            }
        }

        this.updateTutorial();
        this.checkVictoryCondition();
    }

    updateDishwasher() {
        if (this.dishwasher.dirtyStack.length > 0) {
            this.dishwasher.washTimer++;
            if (this.dishwasher.washTimer >= 60) { // 1 second
                this.dishwasher.washTimer = 0;
                this.dishwasher.dirtyStack.shift();
                
                sound.playServe();
                for (let i = 0; i < 4; i++) {
                    this.particles.push(new Particle(this.dishwasher.x, this.dishwasher.y - 12, '#ffffff', 'steam'));
                }
            }
        } else {
            this.dishwasher.washTimer = 0;
        }
    }

    checkDependencyMet(tile) {
        if (!tile.dependency) return true;
        if (tile.dependency === 'all_single_sofas') {
            const singleIds = ['single_1', 'single_2', 'single_3', 'single_4', 'single_5', 'single_6'];
            return singleIds.every(id => {
                const t = this.tables.find(tbl => tbl.id === id);
                return t && t.unlocked && t.isSofa;
            });
        }
        if (tile.dependency === 'all_double_sofas') {
            const doubleIds = ['double_1', 'double_2', 'double_3', 'double_4'];
            return doubleIds.every(id => {
                const t = this.tables.find(tbl => tbl.id === id);
                return t && t.unlocked && t.isSofa;
            });
        }
        const depTile = this.unlockTiles.find(t => t.id === tile.dependency);
        if (depTile) {
            return this.checkTileUnlocked(depTile);
        }
        if (tile.dependency === 'drive_thru') return this.driveThruUnlocked;
        return true;
    }

    checkTileUnlocked(tile) {
        if (tile.type === 'station') return this.stations.find(s => s.id === tile.targetId).unlocked;
        if (tile.type === 'chef') return this.stations.find(s => s.id === tile.targetId).hasChef;
        if (tile.type === 'table') return this.tables.find(t => t.id === tile.targetId).unlocked;
        if (tile.type === 'sofa') return this.tables.find(t => t.id === tile.targetId.split('_sofa')[0]).isSofa;
        if (tile.type === 'drive_thru') return this.driveThruUnlocked;
        if (tile.type === 'cashier') return tile.targetId === 'cashier_1' ? this.counter1Unlocked : this.counter2Unlocked;
        if (tile.type === 'worker') return this.staffList.filter(s => s.type === 'worker').length >= parseInt(tile.targetId.split('_')[1]);
        if (tile.type === 'vending') return tile.targetId === 'vending_1' ? this.vending1Unlocked : this.vending2Unlocked;
        return false;
    }

    activateUnlock(tile, quiet = false) {
        if (tile.type === 'station') {
            const s = this.stations.find(st => st.id === tile.targetId);
            if (s) {
                s.unlocked = true;
                // Nudge player away from station center to prevent getting stuck
                const pdist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                if (pdist < 75) {
                    const angle = pdist > 0 ? Math.atan2(this.player.y - s.y, this.player.x - s.x) : Math.PI / 2;
                    this.player.x = s.x + Math.cos(angle) * 80;
                    this.player.y = s.y + Math.sin(angle) * 80;
                }
            }
        } else if (tile.type === 'chef') {
            const s = this.stations.find(st => st.id === tile.targetId);
            if (s) {
                s.hasChef = true;
                this.staffList.push(new Staff(this, 'chef', this.staffList.length, s));
            }
        } else if (tile.type === 'table') {
            const t = this.tables.find(tbl => tbl.id === tile.targetId);
            if (t) {
                t.unlocked = true;
                // Nudge player away from table center to prevent getting stuck
                const pdist = Math.hypot(this.player.x - t.x, this.player.y - t.y);
                if (pdist < 80) {
                    const angle = pdist > 0 ? Math.atan2(this.player.y - t.y, this.player.x - t.x) : Math.PI / 2;
                    this.player.x = t.x + Math.cos(angle) * 85;
                    this.player.y = t.y + Math.sin(angle) * 85;
                }
            }
        } else if (tile.type === 'sofa') {
            const tableId = tile.targetId.split('_sofa')[0];
            const t = this.tables.find(tbl => tbl.id === tableId);
            if (t) t.isSofa = true;
        } else if (tile.type === 'drive_thru') {
            this.driveThruUnlocked = true;
        } else if (tile.type === 'vending') {
            if (tile.targetId === 'vending_1') {
                this.vending1Unlocked = true;
            } else {
                this.vending2Unlocked = true;
            }
        } else if (tile.type === 'cashier') {
            if (tile.targetId === 'cashier_1') {
                this.counter1Unlocked = true;
                this.staffList.push(new Staff(this, 'cashier_1', 1));
            } else {
                this.counter2Unlocked = true;
                this.staffList.push(new Staff(this, 'cashier_2', 2));
            }
        } else if (tile.type === 'worker') {
            const num = parseInt(tile.targetId.split('_')[1]);
            // Guard: only allow 1 worker per slot and max 4 total
            const alreadyExists = this.staffList.some(s => s.type === 'worker' && s.id === num);
            const totalWorkers = this.staffList.filter(s => s.type === 'worker').length;
            if (!alreadyExists && totalWorkers < 4) {
                this.staffList.push(new Staff(this, 'worker', num));
            }
        }

        if (!quiet) {
            sound.playUnlock();
            for (let i = 0; i < 25; i++) {
                this.particles.push(new Particle(tile.x, tile.y, '#f5b578', 'sparkle'));
            }
            this.particles.push(new FloatingText(tile.x, tile.y - 10, "UNLOCKED! 🎉", '#ff9900'));
            
            // Trigger midroll ad on major unlocks
            if (tile.type === 'station' || tile.type === 'table' || tile.type === 'drive_thru' || tile.type === 'cashier' || tile.type === 'vending') {
                this.requestMidrollAd();
            }
        }

        nav.updateObstacles(this.tables, this.stations, this.counter1Unlocked, this.counter2Unlocked, this.dishwasher, this.vending1Unlocked, this.vending2Unlocked);
        this.saveGame();
    }

    checkVictoryCondition() {
        if (this.victoryTriggered) return;
        const allStations = this.stations.every(s => s.unlocked);
        const allChefs = this.stations.every(s => s.hasChef);
        const allSofas = this.tables.every(t => t.isSofa);
        const allWorkers = this.staffList.filter(s => s.type === 'worker').length >= 4;
        const allVending = this.vending1Unlocked && this.vending2Unlocked;

        if (allStations && allChefs && allSofas && allWorkers && this.counter1Unlocked && this.counter2Unlocked && allVending) {
            this.victoryTriggered = true;
            const vicModal = document.getElementById('victory-overlay');
            document.getElementById('vic-revenue').textContent = `₹${this.stats.totalRevenue.toLocaleString()}`;
            document.getElementById('vic-customers').textContent = this.stats.customersServed;
            vicModal.classList.remove('hidden');
            this.saveGame();
        }
    }

    getTutorialStep() {
        if (this.tutorialSkipped) {
            return null;
        }
        const single1 = this.tables.find(t => t.id === 'single_1');
        if (!single1 || !single1.unlocked) {
            return {
                id: 'unlock_single_1',
                text: "Walk to the zone and spend ₹50 to unlock Single Table 1",
                x: 1050,
                y: 610
            };
        }

        // Step 2: Unlock Idli Station
        const stationIdli = this.stations.find(s => s.id === 'idli');
        if (!stationIdli || !stationIdli.unlocked) {
            return {
                id: 'unlock_station_idli',
                text: "Unlock the Idli cooking station (costs ₹50)",
                x: 300,
                y: 310
            };
        }

        // Step 3: Cook Idli
        const idliInHand = this.player.carryStack.includes('idli');
        const idliPrepared = stationIdli.preparedStack.length > 0;
        if (!idliInHand && !idliPrepared) {
            return {
                id: 'cook_idli',
                text: "Stand in front of the Idli station to cook manually",
                x: 300,
                y: 280
            };
        }

        // Step 4: Collect cooked Idli
        if (!idliInHand && idliPrepared) {
            return {
                id: 'collect_idli',
                text: "Collect the cooked Idli from the station",
                x: 300,
                y: 280
            };
        }

        // Step 5: Serve Customers (either Single Table 1 or Cashier)
        const single1WaitingCustomer = single1.seats.some(seat => seat.occupant && seat.occupant.state === 'waitingAtTable');
        const cashierWaitingCustomer = this.counterQueue.length > 0;
        if (idliInHand) {
            if (single1WaitingCustomer) {
                return {
                    id: 'serve_customer',
                    text: "Deliver the food! Stand near Single Table 1 to serve.",
                    x: 1050,
                    y: 550
                };
            } else if (cashierWaitingCustomer) {
                return {
                    id: 'serve_customer',
                    text: "Deliver the food! Stand near the Cashier table to serve.",
                    x: 750,
                    y: 500
                };
            } else {
                return {
                    id: 'serve_customer_fallback',
                    text: "Stand near the Cashier table to drop the food onto the counter.",
                    x: 750,
                    y: 500
                };
            }
        }

        // Step 6: Clean Single Table 1 (if dirty)
        const hasDirtyPlateInHand = this.player.carryStack.some(item => typeof item === 'object' && item.type === 'dirty_plate');
        if (single1.dirty && !hasDirtyPlateInHand) {
            return {
                id: 'clean_single_1',
                text: "Single Table 1 is dirty! Stand near Single Table 1 to collect the dirty plates.",
                x: 1050,
                y: 550
            };
        }

        // Step 7: Wash Plates (if holding dirty plates)
        if (hasDirtyPlateInHand) {
            return {
                id: 'wash_plates',
                text: "Take the dirty plates to the washing machine in the top-left",
                x: 180,
                y: 240
            };
        }

        // Step 8: Hire Idli Chef
        if (!stationIdli.hasChef) {
            if (this.cash < 80) {
                return {
                    id: 'earn_for_chef',
                    text: "Earn ₹80 to automate cooking by hiring a Chef! Serve customers.",
                    x: 750,
                    y: 500
                };
            } else {
                return {
                    id: 'hire_chef_idli',
                    text: "Hire the Idli Chef to automate cooking (costs ₹80)",
                    x: 300,
                    y: 180
                };
            }
        }

        // Step 9: Unlock Dosa Station (the next food item!)
        const stationDosa = this.stations.find(s => s.id === 'dosa');
        if (!stationDosa || !stationDosa.unlocked) {
            if (this.cash < 150) {
                return {
                    id: 'earn_for_dosa',
                    text: "Earn ₹150 to unlock the next food item (Dosa)!",
                    x: 750,
                    y: 500
                };
            } else {
                return {
                    id: 'unlock_station_dosa',
                    text: "Unlock the Dosa Cooking Station (costs ₹150)",
                    x: 480,
                    y: 310
                };
            }
        }

        // Step 10: Hire Dosa Chef (costs ₹150)
        if (!stationDosa.hasChef) {
            if (this.cash < 150) {
                return {
                    id: 'earn_for_dosa_chef',
                    text: "Earn ₹150 to automate cooking by hiring Dosa Chef! Serve customers.",
                    x: 750,
                    y: 500
                };
            } else {
                return {
                    id: 'hire_chef_dosa',
                    text: "Hire the Dosa Chef to automate cooking (costs ₹150)",
                    x: 480,
                    y: 180
                };
            }
        }

        // Step 11: Hire Cashier 1 (costs ₹200)
        if (!this.counter1Unlocked) {
            if (this.cash < 200) {
                return {
                    id: 'earn_for_cashier',
                    text: "Earn ₹200 to hire a Cashier to automate cashier serving! Serve customers.",
                    x: 750,
                    y: 500
                };
            } else {
                return {
                    id: 'hire_cashier_1',
                    text: "Hire the Cashier to automate cashier serving (costs ₹200)",
                    x: 750,
                    y: 410
                };
            }
        }

        // Step 12: Complete!
        return null;
    }

    requestMidrollAd() {
        if (!this.enableAds) {
            console.log("CrazyGames Basic Launch: Ads are disabled. Bypassing midgame ad request.");
            return;
        }
        if (this.crazySDK) {
            const wasSoundEnabled = sound.enabled;
            if (wasSoundEnabled) {
                sound.toggle(false);
                const sndBtn = document.getElementById('btn-toggle-sound');
                if (sndBtn) {
                    sndBtn.textContent = "OFF";
                    sndBtn.className = "toggle-btn";
                }
            }
            
            this.crazySDK.ad.requestAd('midgame', {
                adStarted: () => {
                    this.running = false;
                    if (this.crazySDK.game) {
                        try {
                            this.crazySDK.game.gameplayStop();
                        } catch (e) {
                            console.warn("gameplayStop failed:", e);
                        }
                    }
                },
                adFinished: () => {
                    this.running = true;
                    this.keys = {}; // Reset keys to clear stuck inputs
                    window.focus();
                    if (this.canvas) {
                        this.canvas.focus();
                    }
                    if (this.crazySDK.game) {
                        try {
                            this.crazySDK.game.gameplayStart();
                        } catch (e) {
                            console.warn("gameplayStart failed:", e);
                        }
                    }
                    if (wasSoundEnabled) {
                        sound.toggle(true);
                        const sndBtn = document.getElementById('btn-toggle-sound');
                        if (sndBtn) {
                            sndBtn.textContent = "ON";
                            sndBtn.className = "toggle-btn on";
                        }
                    }
                },
                adError: (error) => {
                    console.warn("Midgame ad request error:", error);
                    this.running = true;
                    this.keys = {}; // Reset keys to clear stuck inputs
                    window.focus();
                    if (this.canvas) {
                        this.canvas.focus();
                    }
                    if (this.crazySDK.game) {
                        try {
                            this.crazySDK.game.gameplayStart();
                        } catch (e) {
                            console.warn("gameplayStart failed:", e);
                        }
                    }
                    if (wasSoundEnabled) {
                        sound.toggle(true);
                        const sndBtn = document.getElementById('btn-toggle-sound');
                        if (sndBtn) {
                            sndBtn.textContent = "ON";
                            sndBtn.className = "toggle-btn on";
                        }
                    }
                }
            });
        }
    }

    skipTutorial() {
        this.tutorialSkipped = true;
        this.activeTutorialStep = null;
        const banner = document.getElementById('tutorial-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
        this.saveGame();
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                this.player.x,
                this.player.y - 20,
                '#ffd700',
                'sparkle'
            ));
        }
    }

    updateTutorial() {
        const step = this.getTutorialStep();
        const banner = document.getElementById('tutorial-banner');
        if (!banner) return;

        const splash = document.getElementById('splash-screen');
        const splashHidden = splash ? splash.classList.contains('hidden') : true;
        const shopOpen = !document.getElementById('shop-overlay').classList.contains('hidden');
        const settingsOpen = !document.getElementById('settings-overlay').classList.contains('hidden');
        const victoryOpen = !document.getElementById('victory-overlay').classList.contains('hidden');

        if (step && this.running && splashHidden && !shopOpen && !settingsOpen && !victoryOpen) {
            banner.classList.remove('hidden');
            const taskText = document.getElementById('tutorial-task-text');
            if (taskText) {
                taskText.textContent = step.text;
            }
            this.activeTutorialStep = step;
        } else {
            banner.classList.add('hidden');
            this.activeTutorialStep = null;
        }
    }

    drawGuideArrow(ctx, x, y) {
        ctx.save();
        const bounce = Math.sin(Date.now() * 0.007) * 8;
        ctx.translate(x, y - 40 + bounce);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 40 - bounce + 5, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        const gradient = ctx.createLinearGradient(0, -25, 0, 10);
        gradient.addColorStop(0, '#ff9f43');
        gradient.addColorStop(1, '#ff3838');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-10, -25);
        ctx.lineTo(10, -25);
        ctx.lineTo(10, -5);
        ctx.lineTo(20, -5);
        ctx.lineTo(0, 15);
        ctx.lineTo(-20, -5);
        ctx.lineTo(-10, -5);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }

    // ========================================================================
    // RENDER DRAW LOOP
    // ========================================================================
    // ========================================================================
    // RENDER DRAW LOOP
    // ========================================================================
    draw() {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Apply camera drag offset so player can look around the restaurant
        let cameraX = this.player.x - winW / 2 + this.camDrag.offsetX;
        let cameraY = this.player.y - winH / 2 + this.camDrag.offsetY;
        
        let offsetX = 0;
        let offsetY = 0;
        
        const mapW = 1400;
        const mapH = 1200;
        
        if (winW >= mapW) {
            cameraX = 0;
            offsetX = (winW - mapW) / 2;
        } else {
            cameraX = Math.max(0, Math.min(mapW - winW, cameraX));
        }
        
        if (winH >= mapH) {
            cameraY = 0;
            offsetY = (winH - mapH) / 2;
        } else {
            cameraY = Math.max(0, Math.min(mapH - winH, cameraY));
        }

        this.ctx.clearRect(0, 0, winW, winH);

        // Dark background outside game map
        this.ctx.fillStyle = '#1e272e';
        this.ctx.fillRect(0, 0, winW, winH);

        this.ctx.save();
        this.ctx.translate(offsetX - cameraX, offsetY - cameraY);

        // Grass background
        this.ctx.fillStyle = '#4b6b37';
        this.ctx.fillRect(0, 0, 1400, 1200);

        // Asphalt driveway
        this.ctx.fillStyle = '#4e5a65';
        this.ctx.fillRect(0, 0, 150, 1200);
        this.ctx.strokeStyle = '#fdd835';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([30, 25]);
        this.ctx.beginPath();
        this.ctx.moveTo(75, 0);
        this.ctx.lineTo(75, 1200);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Spacious open restaurant floor
        this.ctx.fillStyle = '#cf7a53';
        this.ctx.fillRect(150, 150, 1200, 950);

        // Subtle borders between tiles
        this.ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        this.ctx.lineWidth = 1;
        for (let x = 150; x <= 1350; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 150);
            this.ctx.lineTo(x, 1100);
            this.ctx.stroke();
        }
        for (let y = 150; y <= 1100; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(150, y);
            this.ctx.lineTo(1350, y);
            this.ctx.stroke();
        }

        // Main outer walls (thick 3D-like styling)
        this.ctx.fillStyle = '#7a4224'; // dark wall base
        this.ctx.fillRect(140, 130, 1220, 20); // top wall
        this.ctx.fillRect(130, 130, 20, 980); // left wall
        this.ctx.fillRect(1350, 130, 20, 980); // right wall
        this.ctx.fillRect(130, 1100, 570, 20); // bottom left
        this.ctx.fillRect(800, 1100, 570, 20); // bottom right
        
        // Highlights on top of walls
        this.ctx.fillStyle = '#a8653b'; // light trim top
        this.ctx.fillRect(140, 130, 1220, 5);
        this.ctx.fillRect(130, 130, 5, 980);
        this.ctx.fillRect(1350, 130, 5, 980);
        this.ctx.fillRect(130, 1100, 570, 5);
        this.ctx.fillRect(800, 1100, 570, 5);

        // Door welcome mat
        this.ctx.fillStyle = '#a04000';
        this.ctx.fillRect(700, 1095, 100, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = "bold 8px 'Outfit', sans-serif";
        this.ctx.textAlign = 'center';
        this.ctx.fillText("WELCOME", 750, 1103);

        // Cash bench
        this.ctx.fillStyle = '#a05f32';
        this.ctx.beginPath();
        this.ctx.roundRect(670, 480, 160, 40, 8);
        this.ctx.fill();
        this.ctx.strokeStyle = '#3e1b00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(740, 485, 20, 15);
        this.ctx.strokeRect(740, 485, 20, 15);

        for (let i = 0; i < this.counterBuffer.length; i++) {
            const rec = RECIPES[this.counterBuffer[i]];
            if (rec) {
                const col = i % 8;
                const row = Math.floor(i / 8);
                rec.draw(this.ctx, 685 + col * 18, 500 - row * 10, 10);
            }
        }

        // Drive-Thru Ledge & Counter Table
        if (this.driveThruUnlocked) {
            // Ledge at the window driveway side
            this.ctx.fillStyle = '#57606f';
            this.ctx.fillRect(135, 620, 20, 60);
            this.ctx.strokeStyle = '#2f3542';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(150, 620);
            this.ctx.lineTo(150, 680);
            this.ctx.stroke();

            // Nice indoor wooden counter table for placing food items (like cashier counter)
            this.ctx.fillStyle = '#a05f32';
            this.ctx.beginPath();
            this.ctx.roundRect(160, 610, 40, 80, 6);
            this.ctx.fill();
            this.ctx.strokeStyle = '#3e1b00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw plate stack on this new drive-thru counter table (capacity: 48)
            // Stacks neatly in 4 columns, up to 12 rows
            for (let i = 0; i < this.driveThruBuffer.length; i++) {
                const rec = RECIPES[this.driveThruBuffer[i]];
                if (rec) {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    rec.draw(this.ctx, 168 + col * 9, 675 - row * 7, 8);
                }
            }
        }

        // Draw Plate Washing Machine
        this.drawDishwasher(this.ctx);

        // Draw Vending Machines flanking entrance mat
        if (this.vending1Unlocked) {
            this.drawVendingMachine(this.ctx, 640, 1070);
        }
        if (this.vending2Unlocked) {
            this.drawVendingMachine(this.ctx, 860, 1070);
        }

        // Unlock circles
        this.unlockTiles.forEach(tile => {
            if (!this.checkDependencyMet(tile)) return;
            if (this.checkTileUnlocked(tile)) return;

            this.ctx.save();
            this.ctx.translate(tile.x, tile.y);

            const pulse = 1.0 + Math.sin(Date.now() * 0.007) * 0.03;

            this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 32 * pulse, 0, Math.PI * 2);
            this.ctx.fill();

            const pct = tile.currentInvested / tile.cost;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 28 * pulse, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = '#4cd964';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 28 * pulse, -Math.PI/2, -Math.PI/2 + pct * Math.PI*2);
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = "bold 9px 'Outfit', sans-serif";
            this.ctx.textAlign = 'center';
            this.ctx.fillText(tile.label, 0, -4);

            this.ctx.fillStyle = '#ffd15c';
            this.ctx.font = "bold 10px 'Outfit', sans-serif";
            this.ctx.fillText(`₹${tile.cost - tile.currentInvested}`, 0, 8);

            this.ctx.restore();
        });

        // Cooking stations
        this.stations.forEach(s => {
            if (s.unlocked) {
                // Base counter (metallic stainless steel gradient)
                const counterGrad = this.ctx.createLinearGradient(s.x - 26, s.y - 26, s.x + 26, s.y + 26);
                counterGrad.addColorStop(0, '#bdc3c7');
                counterGrad.addColorStop(0.5, '#7f8c8d');
                counterGrad.addColorStop(1, '#95a5a6');
                
                this.ctx.fillStyle = counterGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(s.x - 26, s.y - 26, 52, 52, 8);
                this.ctx.fill();
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();

                // Cooker knobs on the bottom rim
                this.ctx.fillStyle = '#34495e';
                for (let k = 0; k < 3; k++) {
                    this.ctx.beginPath();
                    this.ctx.arc(s.x - 14 + k * 14, s.y + 20, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Inner appliances rendering
                this.ctx.save();
                this.ctx.translate(s.x, s.y);
                if (s.id === 'idli') {
                    // IDLI STEAMER: Draw shiny silver tiered stand
                    this.ctx.fillStyle = '#ecf0f1';
                    this.ctx.beginPath();
                    this.ctx.arc(0, -3, 16, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#7f8c8d';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();

                    // Steam lid handle
                    this.ctx.fillStyle = '#e74c3c'; // red lid handle
                    this.ctx.beginPath();
                    this.ctx.arc(0, -3, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (s.id === 'dosa' || s.id === 'chappathi' || s.id === 'parotta') {
                    // TAVA/GRIDDLE: Flat griddle plate
                    this.ctx.fillStyle = 'rgba(235, 94, 40, 0.2)'; // hot ring glow
                    this.ctx.beginPath();
                    this.ctx.arc(0, -2, 19, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.fillStyle = '#2f3542'; // griddle plate
                    this.ctx.beginPath();
                    this.ctx.arc(0, -2, 16, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#57606f';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();

                    // Griddle handle
                    this.ctx.fillStyle = '#747d8c';
                    this.ctx.fillRect(-3, 14, 6, 8);
                } else {
                    // WOK/STOVE (Noodles & Fried Rice): Sit on burner grill
                    this.ctx.fillStyle = '#1e272e'; // Burner grates
                    this.ctx.beginPath();
                    this.ctx.arc(0, -2, 15, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Wok Pan
                    this.ctx.fillStyle = '#747d8c';
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -2, 12, 10, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#2f3542';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();

                    // Handles on sides
                    this.ctx.beginPath();
                    this.ctx.arc(-14, -2, 3, 0, Math.PI * 2);
                    this.ctx.arc(14, -2, 3, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                this.ctx.restore();

                const rec = RECIPES[s.id];
                if (rec) {
                    for (let i = 0; i < s.preparedStack.length; i++) {
                        rec.draw(this.ctx, s.x - 12, s.y + 10 - i * 4.5, 10);
                    }
                }
            }
        });

        // 2-Seated Tables / Sofas & 4-Seated Circular Tables
        this.tables.forEach(t => {
            if (t.unlocked) {
                if (t.isRound4Seater) {
                    // Shadow
                    this.ctx.fillStyle = 'rgba(0,0,0,0.12)';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 44, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Table rim
                    this.ctx.fillStyle = t.isSofa ? '#b38f4f' : '#8a5229';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 38, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Table top center (radial gradient wood texture)
                    const grad = this.ctx.createRadialGradient(t.x, t.y, 5, t.x, t.y, 34);
                    grad.addColorStop(0, t.isSofa ? '#ffe596' : '#bf7e4e');
                    grad.addColorStop(1, t.isSofa ? '#ffd15c' : '#a05f32');
                    this.ctx.fillStyle = grad;
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 34, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Wood texture ring line
                    this.ctx.strokeStyle = 'rgba(0,0,0,0.06)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Draw 4 circular seats (stools) around the circular table
                    const seatRadius = 9;
                    const seatOffset = 47;
                    const seatsPos = [
                        { dx: -seatOffset, dy: 0 },
                        { dx: seatOffset, dy: 0 },
                        { dx: 0, dy: -seatOffset },
                        { dx: 0, dy: seatOffset }
                    ];
                    
                    seatsPos.forEach(pos => {
                        this.ctx.fillStyle = t.isSofa ? '#b33939' : '#5c3317'; // Red sofa seat vs brown wood stool
                        this.ctx.beginPath();
                        this.ctx.arc(t.x + pos.dx, t.y + pos.dy, seatRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.fillStyle = t.isSofa ? '#d54d4d' : '#8a5229'; // Inner seat detail
                        this.ctx.beginPath();
                        this.ctx.arc(t.x + pos.dx, t.y + pos.dy, seatRadius - 3, 0, Math.PI * 2);
                        this.ctx.fill();
                    });
                } else if (t.isSingleSeater) {
                    // Shadow
                    this.ctx.fillStyle = 'rgba(0,0,0,0.12)';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 25, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Table rim
                    this.ctx.fillStyle = t.isSofa ? '#b38f4f' : '#8a5229';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Table top center (radial gradient wood texture)
                    const grad = this.ctx.createRadialGradient(t.x, t.y, 3, t.x, t.y, 17);
                    grad.addColorStop(0, t.isSofa ? '#ffe596' : '#bf7e4e');
                    grad.addColorStop(1, t.isSofa ? '#ffd15c' : '#a05f32');
                    this.ctx.fillStyle = grad;
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 17, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Single chair / sofa at the bottom
                    if (t.isSofa) {
                        this.ctx.fillStyle = '#b33939';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x - 18, t.y + 24, 36, 12, 4);
                        this.ctx.fill();
                    } else {
                        this.ctx.fillStyle = '#5c3317';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x - 12, t.y + 22, 24, 8, 3);
                        this.ctx.fill();
                    }
                } else {
                    // Shadow
                    this.ctx.fillStyle = 'rgba(0,0,0,0.12)';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Table rim
                    this.ctx.fillStyle = t.isSofa ? '#b38f4f' : '#8a5229';
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 34, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Table top center (radial gradient wood texture)
                    const grad = this.ctx.createRadialGradient(t.x, t.y, 5, t.x, t.y, 30);
                    grad.addColorStop(0, t.isSofa ? '#ffe596' : '#bf7e4e');
                    grad.addColorStop(1, t.isSofa ? '#ffd15c' : '#a05f32');
                    this.ctx.fillStyle = grad;
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 30, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Draw white table runner tablecloth stripe
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                    this.ctx.fillRect(t.x - 8, t.y - 30, 16, 60);
                    this.ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(t.x - 8, t.y - 30, 16, 60);

                    // Sofa seats / basic chairs
                    if (t.isSofa) {
                        this.ctx.fillStyle = '#b33939';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x - 52, t.y - 28, 16, 56, 8);
                        this.ctx.fill();

                        this.ctx.fillStyle = '#b33939';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x + 36, t.y - 28, 16, 56, 8);
                        this.ctx.fill();
                    } else {
                        this.ctx.fillStyle = '#5c3317';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x - 46, t.y - 14, 12, 28, 4);
                        this.ctx.fill();

                        this.ctx.fillStyle = '#5c3317';
                        this.ctx.beginPath();
                        this.ctx.roundRect(t.x + 34, t.y - 14, 12, 28, 4);
                        this.ctx.fill();
                    }
                }

                // If table has empty plates left, draw stack of dirty plates visually on center of table
                if (t.dirty && t.dirtyPlatesCount > 0) {
                    const size = t.isSingleSeater ? 10 : 14;
                    for (let i = 0; i < t.dirtyPlatesCount; i++) {
                        DRAW_DIRTY_PLATE(this.ctx, t.x, t.y - i * 4, size);
                    }
                }

                // Draw stack of food plates on table center if they are placed there
                if (t.foodStack && t.foodStack.length > 0) {
                    for (let i = 0; i < t.foodStack.length; i++) {
                        const rec = RECIPES[t.foodStack[i]];
                        if (rec) {
                            if (t.isRound4Seater) {
                                // Draw in a neat circular layout around the table center
                                const angle = (i * Math.PI * 2) / Math.max(4, t.foodStack.length);
                                const ox = Math.cos(angle) * 9;
                                const oy = Math.sin(angle) * 9;
                                rec.draw(this.ctx, t.x + ox, t.y + oy, 8);
                            } else if (t.isSingleSeater) {
                                // Single table food stack (drawn straight in the center)
                                rec.draw(this.ctx, t.x, t.y - i * 3.5, 7);
                            } else {
                                const ox = (i % 2 === 0 ? -6 : 6);
                                const oy = -5 + Math.floor(i / 2) * 5;
                                rec.draw(this.ctx, t.x + ox, t.y + oy, 8);
                            }
                        }
                    }
                }
            }
        });

        // Cash Stack on floor
        this.cashList.forEach(coin => {
            this.ctx.save();
            this.ctx.fillStyle = '#2ed573';
            this.ctx.strokeStyle = '#26af5f';
            this.ctx.lineWidth = 1;
            this.ctx.translate(coin.x, coin.y);
            this.ctx.rotate(0.08);

            this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
            this.ctx.fillRect(-8, -3, 17, 8);

            this.ctx.fillStyle = '#2ed573';
            this.ctx.beginPath();
            this.ctx.roundRect(-8, -4, 16, 8, 2);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 4.5, 2.0, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Painter sort
        const entities = [];
        entities.push({ y: this.player.y, draw: (ctx) => this.drawPlayer(ctx) });
        this.customers.forEach(c => entities.push({ y: c.y, draw: (ctx) => c.draw(ctx) }));
        this.vendingCustomers.forEach(c => entities.push({ y: c.y, draw: (ctx) => c.draw(ctx) }));
        this.staffList.forEach(s => entities.push({ y: s.y, draw: (ctx) => s.draw(ctx) }));
        this.cars.forEach(car => entities.push({ y: car.y, draw: (ctx) => car.draw(ctx) }));

        entities.sort((a, b) => a.y - b.y);
        entities.forEach(ent => ent.draw(this.ctx));

        this.particles.forEach(p => p.draw(this.ctx));

        // Draw bouncing tutorial guide arrow overlay
        if (this.activeTutorialStep && this.activeTutorialStep.x !== undefined && this.activeTutorialStep.y !== undefined) {
            this.drawGuideArrow(this.ctx, this.activeTutorialStep.x, this.activeTutorialStep.y);
        }

        this.ctx.restore();

        if (this.controlsOverlayVisible) {
            this.drawControlsOverlay();
        }
    }

    drawControlsOverlay() {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
        this.ctx.fillRect(0, 0, winW, winH);
        
        this.ctx.textAlign = 'center';
        
        // Title
        this.ctx.fillStyle = '#ff9900';
        this.ctx.font = "bold 26px 'Outfit', sans-serif";
        this.ctx.shadowColor = 'rgba(255, 153, 0, 0.4)';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText("DHABA TYCOON", winW / 2, winH / 2 - 120);
        this.ctx.shadowBlur = 0;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = "600 16px 'Outfit', sans-serif";
        this.ctx.fillText("How to Control Your Character:", winW / 2, winH / 2 - 80);
        
        // Draw keys symbols visually on canvas
        // W / Z
        this.drawKeyShape(winW / 2, winH / 2 - 40, "W / Z");
        // A / Q, S, D
        this.drawKeyShape(winW / 2 - 50, winH / 2 + 5, "A / Q");
        this.drawKeyShape(winW / 2, winH / 2 + 5, "S");
        this.drawKeyShape(winW / 2 + 50, winH / 2 + 5, "D");
        
        // Keyboard movement label
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = "500 12px 'Poppins', sans-serif";
        this.ctx.fillText("Use Keyboard Keys or Arrow Keys to walk", winW / 2, winH / 2 + 52);
        
        // Mouse/Touch Joystick instructions
        this.ctx.fillStyle = '#ff9900';
        this.ctx.font = "600 16px 'Outfit', sans-serif";
        this.ctx.fillText("Or Click & Drag to Move", winW / 2, winH / 2 + 90);
        
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = "italic 13px 'Poppins', sans-serif";
        this.ctx.fillText("Press any key or drag the joystick to start serving!", winW / 2, winH / 2 + 130);
        
        this.ctx.restore();
    }
    
    drawKeyShape(x, y, label) {
        this.ctx.save();
        this.ctx.fillStyle = '#1e272e';
        this.ctx.strokeStyle = '#ff9900';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.roundRect(x - 22, y - 18, 44, 34, 6);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = "bold 11px 'Poppins', sans-serif";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x, y - 1);
        this.ctx.restore();
    }

    drawDishwasher(ctx) {
        // Cabinet Box
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.roundRect(this.dishwasher.x - 30, this.dishwasher.y - 30, 60, 60, 8);
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inside Chamber
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(this.dishwasher.x - 20, this.dishwasher.y - 12, 40, 24);

        if (this.dishwasher.dirtyStack.length > 0) {
            ctx.fillStyle = '#0abde3';
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.fillRect(this.dishwasher.x - 20, this.dishwasher.y - 12, 40, 24);
            ctx.globalAlpha = 1.0;
        }

        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.dishwasher.x - 20, this.dishwasher.y - 12, 40, 24);

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 8px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText("WASHER", this.dishwasher.x, this.dishwasher.y - 18);

        // Draw dirty stack
        for (let i = 0; i < this.dishwasher.dirtyStack.length; i++) {
            DRAW_DIRTY_PLATE(ctx, this.dishwasher.x - 12, this.dishwasher.y + 10 - i * 4, 10);
        }
    }

    drawVendingMachine(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.roundRect(x - 20, y - 30, 40, 60, 6);
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#111116';
        ctx.fillRect(x - 14, y - 24, 28, 30);
        
        const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f'];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                ctx.fillStyle = colors[(row + col) % colors.length];
                ctx.fillRect(x - 11 + col * 6, y - 21 + row * 9, 4, 6);
            }
        }

        ctx.fillStyle = '#2ecc71';
        ctx.font = "bold 6px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText("DRINKS", x, y - 26);

        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(x + 6, y + 12, 4, 8);
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(x - 12, y + 14, 12, 8);

        ctx.restore();
    }

    drawPlayer(ctx) {
        const isMoving = this.joystick.active || this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] || this.keys['z'] || this.keys['q'] || this.keys['arrowup'] || this.keys['arrowdown'] || this.keys['arrowleft'] || this.keys['arrowright'];
        const bob = isMoving ? Math.abs(Math.sin(this.player.bounce)) * 3 : 0;
        DRAW_DETAILED_CHARACTER(ctx, this.player.x, this.player.y, this.player.w, this.player.h, '#ff6b6b', '#f9ca24', this.player.bounce, isMoving, 'player_chef');
        
        if (isMoving && this.controlsOverlayVisible) {
            this.controlsOverlayVisible = false;
        }

        if (this.player.carryStack.length > 0) {
            ctx.save();
            ctx.translate(this.player.x, this.player.y - bob - 12);
            ctx.rotate(this.player.stackAngle);
            for (let i = 0; i < this.player.carryStack.length; i++) {
                const item = this.player.carryStack[i];
                if (typeof item === 'string') {
                    const recipe = RECIPES[item];
                    if (recipe) recipe.draw(ctx, 0, -i * 12, 20);
                } else if (item && item.type === 'dirty_plate') {
                    DRAW_DIRTY_PLATE(ctx, 0, -i * 7, 18);
                }
            }
            ctx.restore();
        }
    }

    loop() {
        if (this.running) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('load', () => {
    window.game = new Game();
});
