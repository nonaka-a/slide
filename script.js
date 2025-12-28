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
let isEditorMode = false; // エディタモード中かどうか
let isCustomPlaying = false; // 自作問題をプレイ中かどうか
let uniqueIdCounter = 100; // カスタムコマ用ID

// マウスと要素の中心のオフセット（ドラッグ位置補正用）
let dragOffsetX = 0, dragOffsetY = 0;

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

// iOS対応
function unlockAudio() {
    const allSounds = [...sounds.snap, sounds.click, sounds.clear];
    allSounds.forEach(audio => {
        audio.muted = true;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
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
        audioToPlay.muted = false; 
        audioToPlay.play().catch(e => {});
    }
}

function startGame() {
    unlockAudio();
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

// --- ゲーム初期化 ---
function initGame(lv) {
    isEditorMode = false;
    isCustomPlaying = false;
    currentLevel = lv;
    document.getElementById('message').innerText = "";
    document.querySelectorAll('.level-btn').forEach((b, i) => {
        if(b.classList.contains('create-btn')) b.classList.remove('active');
        else b.classList.toggle('active', i + 1 === lv);
    });
    
    // UIの表示切り替え
    document.getElementById('normal-controls').style.display = 'flex';
    document.getElementById('editor-controls').style.display = 'none';
    document.getElementById('editor-palette').style.display = 'none';
    document.querySelector('.level-selector').style.display = 'flex';

    pieces = JSON.parse(JSON.stringify(levelConfigs[lv]));
    render();
}

// --- レベルエディタ初期化 ---
function initEditor() {
    isEditorMode = true;
    isCustomPlaying = false;
    document.getElementById('message').innerText = "CREATE MODE";
    
    // UIの表示切り替え
    document.querySelector('.level-selector').style.display = 'none';
    document.getElementById('normal-controls').style.display = 'none';
    document.getElementById('editor-controls').style.display = 'flex';
    document.getElementById('editor-palette').style.display = 'flex';

    // ボタンのテキストを初期化
    document.getElementById('editor-action-btn').innerText = "プレイ";

    // 赤コマ(big)を上部中央に配置
    pieces = [
        { id: 99, x: 1, y: 0, w: 2, h: 2, type: 'big' }
    ];
    render();
}

function exitEditor() {
    initGame(1);
}

// エディタボタン（プレイ/やりなおす）の制御
function handleEditorAction() {
    const btn = document.getElementById('editor-action-btn');
    if (isCustomPlaying) {
        // 「やりなおす」処理：エディタモードに戻る
        isCustomPlaying = false;
        isEditorMode = true;
        btn.innerText = "プレイ";
        document.getElementById('message').innerText = "CREATE MODE";
        document.getElementById('editor-palette').style.display = 'flex'; // パレット再表示
        render(); // リセットなしでそのまま編集継続
    } else {
        // 「プレイ」処理：カスタムプレイ開始
        isCustomPlaying = true;
        isEditorMode = false;
        btn.innerText = "やりなおす";
        document.getElementById('message').innerText = "CUSTOM PLAY";
        document.getElementById('editor-palette').style.display = 'none'; // パレット隠す
        render();
    }
}

// パレットからコマを生成してドラッグ開始
function spawnPiece(e, type) {
    e.preventDefault();
    if (!isEditorMode) return;

    let w = 1, h = 1;
    if (type === 'v-rect') h = 2;
    if (type === 'green-h') w = 2;
    // bigはパレットにない前提だが一応残しておく

    // 枠外の適当な位置で生成せず、カーソル位置に生成する
    const rect = boardEl.getBoundingClientRect();
    
    // クライアント座標からボード内座標へ変換
    const mouseX = (e.clientX - rect.left) / currentZoom;
    const mouseY = (e.clientY - rect.top) / currentZoom;

    // コマの中心をマウス位置に合わせるための初期座標
    const pieceW = (w * CELL + (w-1) * GAP);
    const pieceH = (h * CELL + (h-1) * GAP);
    const initialX = mouseX - pieceW / 2;
    const initialY = mouseY - pieceH / 2;

    const newPiece = { 
        id: uniqueIdCounter++, 
        x: 0, y: 0, // グリッド座標はドラッグ終了時に決定
        w: w, h: h, 
        type: type 
    };

    pieces.push(newPiece);
    render();

    // 生成されたDOMを取得（配列末尾）
    const allPieces = boardEl.querySelectorAll('.piece');
    const el = allPieces[allPieces.length - 1];

    // スタイルを直接セットして位置合わせ
    el.style.left = `${initialX}px`;
    el.style.top = `${initialY}px`;

    // ドラッグ開始（第4引数 true で新規生成フラグ）
    startDrag(e, newPiece, el, true);
}

function render() {
    const currentPieces = boardEl.querySelectorAll('.piece');
    currentPieces.forEach(p => p.remove());
    pieces.forEach(p => {
        const div = document.createElement('div');
        div.className = `piece ${p.type}`;
        div.style.left = `${p.x * (CELL + GAP)}px`;
        div.style.top = `${p.y * (CELL + GAP)}px`;
        
        // エディタモード中、赤コマ(big)だけは動かせないようにする？
        // ユーザの要望:「最初から置いてある」。移動可能かは指示がないが、
        // 一般的に箱入り娘作成なら赤コマも動かせた方がよいので動かせるようにする。
        // もし固定したい場合は if (isEditorMode && p.type === 'big') return;
        
        div.onpointerdown = (e) => startDrag(e, p, div, false);
        boardEl.appendChild(div);
    });
}

function startDrag(e, piece, el, isSpawning = false) {
    activePiece = { data: piece, el: el, oldX: piece.x, oldY: piece.y };
    startX = e.clientX; 
    startY = e.clientY;
    
    // 要素の現在の見た目の位置（左上）
    const currentRect = el.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();

    // ボード基準の相対座標（ズーム適用済み）
    const currentLeft = (currentRect.left - boardRect.left) / currentZoom;
    const currentTop = (currentRect.top - boardRect.top) / currentZoom;

    initialPieceX = currentLeft;
    initialPieceY = currentTop;

    // マウスカーソルと要素左上のズレ（オフセット）を計算
    if (isSpawning) {
        // 修正箇所：生成時はマウスカーソルが中心に来るように、幅・高さの半分をオフセットにする
        const pieceW = (piece.w * CELL + (piece.w - 1) * GAP);
        const pieceH = (piece.h * CELL + (piece.h - 1) * GAP);
        dragOffsetX = pieceW / 2;
        dragOffsetY = pieceH / 2;
    } else {
        // 通常ドラッグ時は、実際にクリックした位置と左上の差分を維持
        const mouseXInBoard = (e.clientX - boardRect.left) / currentZoom;
        const mouseYInBoard = (e.clientY - boardRect.top) / currentZoom;
        dragOffsetX = mouseXInBoard - currentLeft;
        dragOffsetY = mouseYInBoard - currentTop;
    }
    
    el.setPointerCapture(e.pointerId);
    el.onpointermove = onDrag;
    el.onpointerup = stopDrag;
    el.style.zIndex = 100;
}


function onDrag(e) {
    if (!activePiece) return;
    
    const boardRect = boardEl.getBoundingClientRect();
    const mouseX = (e.clientX - boardRect.left) / currentZoom;
    const mouseY = (e.clientY - boardRect.top) / currentZoom;

    // マウス位置からオフセットを引いて、要素の左上位置を決定
    let tx = mouseX - dragOffsetX;
    let ty = mouseY - dragOffsetY;

    if (isEditorMode) {
        // エディタモード：自由配置
        activePiece.el.style.left = `${tx}px`;
        activePiece.el.style.top = `${ty}px`;
    } else {
        // 通常プレイ：軸固定移動
        // グリッドスナップされた開始位置
        const gridStartX = activePiece.oldX * (CELL + GAP);
        const gridStartY = activePiece.oldY * (CELL + GAP);
        
        const dx = tx - gridStartX;
        const dy = ty - gridStartY;

        // 制限計算
        const lim = calculateLimits(activePiece.data);
        const minX = lim.minX * (CELL + GAP), maxX = lim.maxX * (CELL + GAP);
        const minY = lim.minY * (CELL + GAP), maxY = lim.maxY * (CELL + GAP);

        if (Math.abs(dx) > Math.abs(dy)) {
            // 横移動優先
            tx = Math.max(minX, Math.min(maxX, tx));
            ty = gridStartY;
        } else {
            // 縦移動優先
            ty = Math.max(minY, Math.min(maxY, ty));
            tx = gridStartX;
        }
        activePiece.el.style.left = `${tx}px`;
        activePiece.el.style.top = `${ty}px`;
    }
}

function stopDrag() {
    if (!activePiece) return;
    
    // ドロップ位置からグリッド座標を計算
    // 四捨五入することで一番近いグリッドに吸着
    const rawX = parseFloat(activePiece.el.style.left) / (CELL + GAP);
    const rawY = parseFloat(activePiece.el.style.top) / (CELL + GAP);
    const newX = Math.round(rawX);
    const newY = Math.round(rawY);

    if (isEditorMode) {
        const p = activePiece.data;
        
        // 枠外チェック（少し緩めに判定：中心が枠外なら削除など）
        // ここでは左上が完全にはみ出したら、あるいは中心か。
        // 簡易的に：newX, newYが範囲外なら削除
        if (newX < 0 || newY < 0 || newX + p.w > COLS || newY + p.h > ROWS) {
            // 赤コマだけは削除不可にする？
            if (p.type === 'big') {
                // 削除せず元の位置(または初期位置)に戻す
                p.x = 1; p.y = 0; // 強制的に定位置へ
                playSound('snap');
            } else {
                pieces = pieces.filter(item => item.id !== p.id);
                playSound('snap');
            }
        } else {
            // 枠内：重なりチェック
            const isOverlapping = pieces.some(o => 
                o.id !== p.id && 
                newX < o.x + o.w && newX + p.w > o.x && 
                newY < o.y + o.h && newY + p.h > o.y
            );

            if (!isOverlapping) {
                p.x = newX;
                p.y = newY;
                playSound('snap');
            } else {
                // 重なっている場合は元の位置に戻す
                // 新規作成(spawn)の場合は削除してしまう
                if (p.x === 0 && p.y === 0 && activePiece.oldX === 0 && activePiece.oldY === 0) {
                     // 座標0,0が初期値の新規コマが置けなかったら消す
                     // ただし偶然0,0に置こうとした場合はここに来ないので、
                     // 厳密には「配置確定前のコマ」かどうかで判定すべきだが、
                     // UX的には「弾かれて元の場所（パレット）に戻る＝消える」でOK
                     pieces = pieces.filter(item => item.id !== p.id);
                } else {
                    // 既存コマの移動失敗なら元の位置へ
                    // renderで再描画されるのでデータ更新だけでOK
                }
            }
        }
    } else {
        // 通常プレイ
        if (newX !== activePiece.oldX || newY !== activePiece.oldY) {
            playSound('snap');
        }
        activePiece.data.x = newX; 
        activePiece.data.y = newY;
    }

    activePiece.el.onpointermove = null; 
    activePiece.el.onpointerup = null;
    activePiece.el.style.zIndex = "";
    activePiece = null;
    
    render();
    if (!isEditorMode) checkWin();
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
    if (red && red.x === 1 && red.y === 3) {
        document.getElementById('message').innerText = "CLEAR";
        playSound('clear');
    }
}

// --- モーダル制御 ---
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

// --- タイトルへ戻るモーダル制御 ---
function showTitleConfirm() {
    document.getElementById('title-confirm-modal').classList.add('visible');
}

function hideTitleConfirm() {
    document.getElementById('title-confirm-modal').classList.remove('visible');
}

function executeTitleReturn() {
    hideTitleConfirm();
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('visible');
    const titleScreen = document.getElementById('title-screen');
    titleScreen.style.display = 'flex';
    setTimeout(() => {
        titleScreen.style.opacity = '1';
    }, 50);
}