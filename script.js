const ROWS = 5, COLS = 4, CELL = 75, GAP = 10;
const boardEl = document.getElementById('board');

// --- オーディオ設定 ---
const SNAP_POOL_SIZE = 4;
const sounds = {
    snap: [],
    click: new Audio('click.mp3'),
    clear: new Audio('clear.mp3')
};
let snapIndex = 0;

for(let i = 0; i < SNAP_POOL_SIZE; i++) {
    const a = new Audio('snap.mp3');
    a.preload = 'auto';
    sounds.snap.push(a);
}
sounds.click.preload = 'auto';
sounds.clear.preload = 'auto';

let pieces = [], activePiece = null, startX, startY, initialPieceX, initialPieceY;
let currentLevel = 1, currentZoom = 1.0, isMuted = false;

const levelConfigs = {
    1: [
        { id: 1, x: 0, y: 0, w: 1, h: 1, type: 'small' }, { id: 2, x: 1, y: 0, w: 1, h: 1, type: 'small' }, { id: 3, x: 2, y: 0, w: 1, h: 1, type: 'small' }, { id: 4, x: 3, y: 0, w: 1, h: 1, type: 'small' },
        { id: 5, x: 2, y: 1, w: 1, h: 2, type: 'v-rect' }, { id: 6, x: 3, y: 1, w: 1, h: 1, type: 'small' },
        { id: 7, x: 0, y: 2, w: 2, h: 2, type: 'big' }, { id: 8, x: 3, y: 2, w: 1, h: 1, type: 'small' },
        { id: 9, x: 2, y: 3, w: 1, h: 1, type: 'small' }, { id: 10, x: 3, y: 3, w: 1, h: 1, type: 'small' },
        { id: 11, x: 0, y: 4, w: 1, h: 1, type: 'small' }, { id: 12, x: 1, y: 4, w: 1, h: 1, type: 'small' }, { id: 13, x: 2, y: 4, w: 1, h: 1, type: 'small' }, { id: 14, x: 3, y: 4, w: 1, h: 1, type: 'small' }
    ],
    2: [
        { id: 1, x: 0, y: 0, w: 1, h: 1, type: 'small' }, { id: 2, x: 1, y: 0, w: 1, h: 1, type: 'small' }, { id: 3, x: 2, y: 0, w: 2, h: 2, type: 'big' },
        { id: 4, x: 0, y: 1, w: 1, h: 1, type: 'small' }, { id: 5, x: 1, y: 1, w: 1, h: 2, type: 'v-rect' },
        { id: 6, x: 0, y: 2, w: 1, h: 1, type: 'small' }, { id: 7, x: 2, y: 2, w: 1, h: 1, type: 'small' }, { id: 8, x: 3, y: 2, w: 1, h: 1, type: 'small' },
        { id: 9, x: 0, y: 3, w: 2, h: 1, type: 'green-h' }, { id: 10, x: 2, y: 3, w: 1, h: 1, type: 'small' }, { id: 11, x: 3, y: 3, w: 1, h: 1, type: 'small' },
        { id: 12, x: 0, y: 4, w: 1, h: 1, type: 'small' }, { id: 13, x: 1, y: 4, w: 1, h: 1, type: 'small' }
    ],
    3: [
        { id: 1, x: 0, y: 0, w: 1, h: 1, type: 'small' }, { id: 2, x: 1, y: 0, w: 1, h: 1, type: 'small' }, { id: 3, x: 2, y: 0, w: 1, h: 1, type: 'small' }, { id: 4, x: 3, y: 0, w: 1, h: 1, type: 'small' },
        { id: 5, x: 0, y: 1, w: 1, h: 2, type: 'v-rect' }, { id: 6, x: 1, y: 1, w: 2, h: 2, type: 'big' }, { id: 7, x: 3, y: 1, w: 1, h: 2, type: 'v-rect' },
        { id: 8, x: 1, y: 3, w: 2, h: 1, type: 'green-h' },
        { id: 9, x: 0, y: 4, w: 1, h: 1, type: 'small' }, { id: 10, x: 1, y: 4, w: 1, h: 1, type: 'small' }, { id: 11, x: 2, y: 4, w: 1, h: 1, type: 'small' }, { id: 12, x: 3, y: 4, w: 1, h: 1, type: 'small' }
    ],
    4: [
        { id: 1, x: 0, y: 0, w: 1, h: 2, type: 'v-rect' }, { id: 2, x: 1, y: 0, w: 1, h: 1, type: 'small' }, { id: 3, x: 2, y: 0, w: 1, h: 1, type: 'small' }, { id: 4, x: 3, y: 0, w: 1, h: 2, type: 'v-rect' },
        { id: 5, x: 1, y: 1, w: 2, h: 2, type: 'big' },
        { id: 6, x: 0, y: 2, w: 1, h: 1, type: 'small' }, { id: 7, x: 3, y: 2, w: 1, h: 1, type: 'small' },
        { id: 8, x: 0, y: 3, w: 2, h: 1, type: 'green-h' }, { id: 9, x: 2, y: 3, w: 1, h: 1, type: 'small' }, { id: 10, x: 3, y: 3, w: 1, h: 1, type: 'small' },
        { id: 11, x: 1, y: 4, w: 2, h: 1, type: 'green-h' }
    ],
    5: [
        { id: 1, x: 0, y: 0, w: 1, h: 2, type: 'v-rect' }, { id: 2, x: 1, y: 0, w: 2, h: 2, type: 'big' }, { id: 3, x: 3, y: 0, w: 1, h: 2, type: 'v-rect' },
        { id: 4, x: 0, y: 2, w: 1, h: 2, type: 'v-rect' }, { id: 5, x: 1, y: 2, w: 2, h: 1, type: 'green-h' }, { id: 6, x: 3, y: 2, w: 1, h: 2, type: 'v-rect' },
        { id: 7, x: 1, y: 3, w: 1, h: 1, type: 'small' }, { id: 8, x: 2, y: 3, w: 1, h: 1, type: 'small' },
        { id: 9, x: 0, y: 4, w: 1, h: 1, type: 'small' }, { id: 10, x: 3, y: 4, w: 1, h: 1, type: 'small' }
    ]
};

document.querySelectorAll('[data-type="click"]').forEach(btn => {
    btn.addEventListener('click', () => playSound('click'));
});

// iOS対応: 確実に無音(muted)で再生し、再生許可を取得する
function unlockAudio() {
    const allSounds = [...sounds.snap, sounds.click, sounds.clear];
    allSounds.forEach(audio => {
        // 1. ミュート設定 (音が漏れないようにする)
        audio.muted = true;
        
        // 2. 再生開始
        audio.play().then(() => {
            // 3. 再生が成功したら即停止
            audio.pause();
            audio.currentTime = 0;
            
            // 4. ミュート解除 (次回以降、音が出るように)
            audio.muted = false;
        }).catch(e => {
            console.log("Audio unlock failed:", e);
        });
    });
}

function playSound(type) {
    if (isMuted) return;

    let audioToPlay;
    if (type === 'snap') {
        audioToPlay = sounds.snap[snapIndex];
        snapIndex = (snapIndex + 1) % SNAP_POOL_SIZE;
    } else {
        audioToPlay = sounds[type];
    }

    if (audioToPlay) {
        audioToPlay.currentTime = 0;
        // 通常再生時は muted = false であること
        audioToPlay.muted = false; 
        audioToPlay.play().catch(e => {});
    }
}

function startGame() {
    // アンロック処理（無音）
    unlockAudio();
    
    // スタート時のクリック音（有音）
    if (!isMuted) {
        setTimeout(() => {
            sounds.click.muted = false;
            sounds.click.currentTime = 0;
            sounds.click.play().catch(()=>{});
        }, 50);
    }

    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-screen').classList.add('visible');
        initGame(1);
    }, 400);
}

function adjustZoom(val) {
    currentZoom = Math.max(0.5, Math.min(1.5, currentZoom + val));
    document.getElementById('game-view-wrapper').style.transform = `scale(${currentZoom})`;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('mute-btn').innerText = `音量: ${isMuted ? 'OFF' : 'ON'}`;
}

function initGame(lv) {
    currentLevel = lv;
    document.getElementById('message').innerText = "";
    document.querySelectorAll('.level-btn').forEach((b, i) => {
        b.classList.toggle('active', i + 1 === lv);
    });
    pieces = JSON.parse(JSON.stringify(levelConfigs[lv]));
    render();
}

function render() {
    const currentPieces = boardEl.querySelectorAll('.piece');
    currentPieces.forEach(p => p.remove());
    pieces.forEach(p => {
        const div = document.createElement('div');
        div.className = `piece ${p.type}`;
        div.style.left = `${p.x * (CELL + GAP)}px`;
        div.style.top = `${p.y * (CELL + GAP)}px`;
        div.onpointerdown = (e) => startDrag(e, p, div);
        boardEl.appendChild(div);
    });
}

function startDrag(e, piece, el) {
    activePiece = { data: piece, el: el, oldX: piece.x, oldY: piece.y };
    startX = e.clientX; startY = e.clientY;
    initialPieceX = piece.x * (CELL + GAP);
    initialPieceY = piece.y * (CELL + GAP);
    el.setPointerCapture(e.pointerId);
    el.onpointermove = onDrag;
    el.onpointerup = stopDrag;
}

function onDrag(e) {
    if (!activePiece) return;
    const dx = (e.clientX - startX) / currentZoom;
    const dy = (e.clientY - startY) / currentZoom;
    let tx = initialPieceX + dx, ty = initialPieceY + dy;
    const lim = calculateLimits(activePiece.data);
    const minX = lim.minX * (CELL + GAP), maxX = lim.maxX * (CELL + GAP);
    const minY = lim.minY * (CELL + GAP), maxY = lim.maxY * (CELL + GAP);

    if (Math.abs(dx) > Math.abs(dy)) {
        tx = Math.max(minX, Math.min(maxX, tx)); ty = initialPieceY;
    } else {
        ty = Math.max(minY, Math.min(maxY, ty)); tx = initialPieceX;
    }
    activePiece.el.style.left = `${tx}px`;
    activePiece.el.style.top = `${ty}px`;
}

function stopDrag() {
    if (!activePiece) return;
    const newX = Math.round(parseFloat(activePiece.el.style.left) / (CELL + GAP));
    const newY = Math.round(parseFloat(activePiece.el.style.top) / (CELL + GAP));

    if (newX !== activePiece.oldX || newY !== activePiece.oldY) {
        playSound('snap');
    }

    activePiece.data.x = newX; activePiece.data.y = newY;
    activePiece.el.onpointermove = null; activePiece.el.onpointerup = null;
    activePiece = null;
    render();
    checkWin();
}

function calculateLimits(p) {
    let l = { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y };
    while (canMoveTo(p, l.minX - 1, p.y)) l.minX--;
    while (canMoveTo(p, l.maxX + 1, p.y)) l.maxX++;
    while (canMoveTo(p, p.x, l.minY - 1)) l.minY--;
    while (canMoveTo(p, p.x, l.maxY + 1)) l.maxY++;
    return l;
}

function canMoveTo(p, nx, ny) {
    if (nx < 0 || ny < 0 || nx + p.w > COLS || ny + p.h > ROWS) return false;
    return !pieces.some(o => o.id !== p.id && nx < o.x + o.w && nx + p.w > o.x && ny < o.y + o.h && ny + p.h > o.y);
}

function checkWin() {
    const red = pieces.find(p => p.type === 'big');
    if (red.x === 1 && red.y === 3) {
        document.getElementById('message').innerText = "CLEAR";
        playSound('clear');
    }
}

// --- モーダル制御用関数 ---
function showResetConfirm() {
    document.getElementById('confirm-modal').classList.add('visible');
}

function hideResetConfirm() {
    document.getElementById('confirm-modal').classList.remove('visible');
}

function executeReset() {
    hideResetConfirm();
    initGame(currentLevel);
}

/* --- 既存のコードの末尾に追加してください --- */

// --- タイトルへ戻るモーダル制御 ---
function showTitleConfirm() {
    document.getElementById('title-confirm-modal').classList.add('visible');
}

function hideTitleConfirm() {
    document.getElementById('title-confirm-modal').classList.remove('visible');
}

function executeTitleReturn() {
    hideTitleConfirm();
    
    // ゲーム画面を隠す
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('visible');
    
    // タイトル画面を表示する
    const titleScreen = document.getElementById('title-screen');
    titleScreen.style.display = 'flex'; // まずdisplayを戻す
    
    // 少し待ってからフェードイン（CSS transitionを効かせるため）
    setTimeout(() => {
        titleScreen.style.opacity = '1';
    }, 50);
}