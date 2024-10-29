// カードのスートと値の定義
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// カードの値をランクにマッピング
const valueRanks = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
};

// ゲームモード
let gameMode = 'normal'; // 'normal' または 'mix'
let subGameMode = 'hand'; // 'hand' または 'winner'、ミックスゲームでも使用
let mixGameType = ''; // 'superHoldem' または 'ocean' for mix mode

// カラーアシストモードのフラグ
let colorAssistMode = false;

// タイムアタックモードかどうかのフラグ
let isTimeAttack = false;

// 役の名前のリスト
const handNames = ['ストレートフラッシュ', 'フォーカード', 'フルハウス', 'フラッシュ', 'ストレート', 'スリーカード', 'ツーペア', 'ワンペア', 'ハイカード'];

// カウンターの初期化
let correctStreak = 0;

// プレイヤーの手役と強さを格納
let playerHandsData = [];

// タイマー関連の変数
let timerInterval;
let startTime;

// 問題数と正解数、不正解数の管理
let totalQuestions = 0; // 正解した問題数
let correctAnswers = 0; // 正解した問題数（totalQuestionsと同じ役割）
let incorrectAnswers = 0; // 不正解数

// 不正解フラグ
let hasMistakeInRound = false;

// 不正解の問題を保存する配列を追加
let incorrectQuestions = [];

// 現在の問題のデータを保存するオブジェクト
let currentQuestionData = {
    boardCards: [],
    playerHands: [],
    correctHandNames: []
};

// モード選択ボタンのイベントリスナー
document.getElementById('mode-normal-button').addEventListener('click', () => {
    gameMode = 'normal';
    updateMainModeButtons();
    document.body.classList.remove('mix-mode');
});

document.getElementById('mode-mix-button').addEventListener('click', () => {
    gameMode = 'mix';
    updateMainModeButtons();
    document.body.classList.add('mix-mode');
});

// サブモード（通常モード）のボタンのイベントリスナー
document.getElementById('mode-hand-button').addEventListener('click', () => {
    subGameMode = 'hand';
    updateSubModeButtons();
});

document.getElementById('mode-winner-button').addEventListener('click', () => {
    subGameMode = 'winner';
    updateSubModeButtons();
});

document.getElementById('time-attack-button').addEventListener('click', () => {
    isTimeAttack = !isTimeAttack;
    document.getElementById('time-attack-button').innerHTML = isTimeAttack ? 'タイムアタックモード中' : 'タイムアタックモード';
    updateCounter();
});

// ミックスゲームのボタンのイベントリスナー
document.getElementById('super-holdem-button').addEventListener('click', () => {
    mixGameType = 'superHoldem';
    updateMixModeButtons();
});

document.getElementById('ocean-button').addEventListener('click', () => {
    mixGameType = 'ocean';
    updateMixModeButtons();
});

// ミックスゲームのサブモードボタンのイベントリスナー
document.getElementById('mix-mode-hand-button').addEventListener('click', () => {
    subGameMode = 'hand';
    updateMixSubModeButtons();
});

document.getElementById('mix-mode-winner-button').addEventListener('click', () => {
    subGameMode = 'winner';
    updateMixSubModeButtons();
});

// 色アシストボタンのイベントリスナー
document.getElementById('color-assist-button').addEventListener('click', () => {
    colorAssistMode = !colorAssistMode;
    document.getElementById('color-assist-button').classList.toggle('active-mode', colorAssistMode);
});

// メインモードボタンの状態を更新する関数
function updateMainModeButtons() {
    const normalButton = document.getElementById('mode-normal-button');
    const mixButton = document.getElementById('mode-mix-button');

    if (gameMode === 'normal') {
        normalButton.classList.add('active-mode');
        mixButton.classList.remove('active-mode');
        document.getElementById('normal-mode-options').style.display = 'block';
        document.getElementById('mix-mode-options').style.display = 'none';
    } else {
        normalButton.classList.remove('active-mode');
        mixButton.classList.add('active-mode');
        document.getElementById('normal-mode-options').style.display = 'none';
        document.getElementById('mix-mode-options').style.display = 'block';
    }
}

// サブモードボタンの状態を更新する関数（通常モード）
function updateSubModeButtons() {
    const handButton = document.getElementById('mode-hand-button');
    const winnerButton = document.getElementById('mode-winner-button');

    if (subGameMode === 'hand') {
        handButton.classList.add('active-mode');
        winnerButton.classList.remove('active-mode');
    } else {
        handButton.classList.remove('active-mode');
        winnerButton.classList.add('active-mode');
    }
}

// ミックスゲームボタンの状態を更新する関数
function updateMixModeButtons() {
    const superHoldemButton = document.getElementById('super-holdem-button');
    const oceanButton = document.getElementById('ocean-button');

    if (mixGameType === 'superHoldem') {
        superHoldemButton.classList.add('active-mode');
        oceanButton.classList.remove('active-mode');
    } else if (mixGameType === 'ocean') {
        superHoldemButton.classList.remove('active-mode');
        oceanButton.classList.add('active-mode');
    }
}

// ミックスゲームのサブモードボタンの状態を更新する関数
function updateMixSubModeButtons() {
    const handButton = document.getElementById('mix-mode-hand-button');
    const winnerButton = document.getElementById('mix-mode-winner-button');

    if (subGameMode === 'hand') {
        handButton.classList.add('active-mode');
        winnerButton.classList.remove('active-mode');
    } else {
        handButton.classList.remove('active-mode');
        winnerButton.classList.add('active-mode');
    }
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // モードボタンの状態を更新
    updateMainModeButtons();
    updateSubModeButtons();
    updateMixSubModeButtons();

    // 色アシストボタンの状態を更新
    if (colorAssistMode) {
        document.getElementById('color-assist-button').classList.add('active-mode');
    }
});

// 通常モードのスタートボタンのイベントリスナー
document.getElementById('start-button').addEventListener('click', () => {
    if (isTimeAttack) {
        // タイムアタックモードの場合、カウンターとタイマーを初期化
        totalQuestions = 0; // 正解数をリセット
        correctAnswers = 0;
        incorrectAnswers = 0;
        incorrectQuestions = []; // 間違えた問題をリセット
        startTimer();
    } else {
        correctStreak = 0;
    }
    let numPlayers = parseInt(document.getElementById('num-players').value);
    startGame(numPlayers);
    document.getElementById('game-selection').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    updateCounter();
});

// ミックスゲームのスタートボタンのイベントリスナー
document.getElementById('mix-start-button').addEventListener('click', () => {
    if (isTimeAttack) {
        // タイムアタックモードの場合、カウンターとタイマーを初期化
        totalQuestions = 0; // 正解数をリセット
        correctAnswers = 0;
        incorrectAnswers = 0;
        incorrectQuestions = []; // 間違えた問題をリセット
        startTimer();
    } else {
        correctStreak = 0;
    }
    let numPlayers = parseInt(document.getElementById('mix-num-players').value);
    startGame(numPlayers);
    document.getElementById('game-selection').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    updateCounter();
});

// 「チョップ」ボタンのイベントリスナー
document.getElementById('chop-button').addEventListener('click', () => {
    checkChop();
});

// 「スタートに戻る」ボタンのイベントリスナーを修正
document.getElementById('result-restart-button').addEventListener('click', () => {
    resetGame();
});

document.getElementById('review-restart-button').addEventListener('click', () => {
    resetGame();
});

// リセット用の関数を作成
function resetGame() {
    document.getElementById('result-area').style.display = 'none';
    document.getElementById('review-area').style.display = 'none';
    document.getElementById('game-selection').style.display = 'block';
    document.getElementById('counter').innerHTML = '';
    document.getElementById('timer').innerHTML = '';
    correctStreak = 0;
    incorrectQuestions = []; // 間違えた問題をリセット
    stopTimer();
}

// メインメニューに戻るボタンのイベントリスナー
document.getElementById('main-menu-button').addEventListener('click', () => {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('game-selection').style.display = 'block';
    document.getElementById('counter').innerHTML = '';
    document.getElementById('timer').innerHTML = '';
    correctStreak = 0;
    stopTimer();
});

// 「次の問題に進む」ボタンのイベントリスナー
document.getElementById('next-button').addEventListener('click', () => {
    let numPlayers = gameMode === 'normal' ?
        parseInt(document.getElementById('num-players').value) :
        parseInt(document.getElementById('mix-num-players').value);
    startGame(numPlayers);
});

// カウンターの表示を更新
function updateCounter() {
    if (isTimeAttack) {
        document.getElementById('counter').innerHTML = `正解数: ${totalQuestions} / 20`;
    } else {
        document.getElementById('counter').innerHTML = `ミスなし回数: ${correctStreak}`;
    }
}

// タイマーを開始する関数
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').innerHTML = `経過時間: ${elapsedTime} 秒`;
    }, 1000);
}

// タイマーを停止する関数
function stopTimer() {
    clearInterval(timerInterval);
}

// ゲーム終了時の処理
function endGame() {
    stopTimer();
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('result-area').style.display = 'block';

    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // プレイヤー数の取得（通常モードとミックスモードに対応）
    let numPlayers = gameMode === 'normal' ?
        parseInt(document.getElementById('num-players').value) :
        parseInt(document.getElementById('mix-num-players').value);

    // スコアの計算
    let score = 400 - elapsedTime - (5 * incorrectAnswers) + (numPlayers - 2) * 30;

    // ランクの判定と文字色の設定
    let rank = '';
    let rankColor = '';
    if (score >= 340) {
        rank = 'S';
        rankColor = 'gold';
    } else if (score >= 300) {
        rank = 'A';
        rankColor = 'red';
    } else if (score >= 260) {
        rank = 'B';
        rankColor = 'blue';
    } else if (score >= 220) {
        rank = 'C';
        rankColor = 'yellow';
    } else {
        rank = 'D';
        rankColor = 'black';
    }

    // 結果メッセージの更新
    let resultMessage = 'タイム: ' + elapsedTime + ' 秒<br>' +
                        '間違えた問題数: ' + incorrectAnswers + '<br>' +
                        'スコア: ' + score + '<br>' +
                        'ランク: <span style="color: ' + rankColor + '; font-size: 24px;">' + rank + '</span>';

    document.getElementById('result-message').innerHTML = resultMessage;

    // 振り返りボタンの表示
    if (incorrectQuestions.length > 0) {
        document.getElementById('review-button').style.display = 'inline-block';
    } else {
        document.getElementById('review-button').style.display = 'none';
    }
}

// デッキを生成
function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

// デッキをシャッフル
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// カードを表示
function renderCard(card) {
    let cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    // 値の表示
    let valueDiv = document.createElement('div');
    valueDiv.className = 'value';
    valueDiv.innerHTML = card.value;
    cardDiv.appendChild(valueDiv);

    // スートの表示
    let suitDiv = document.createElement('div');
    suitDiv.className = 'suit';
    suitDiv.innerHTML = card.suit;
    cardDiv.appendChild(suitDiv);

    // スートに応じた色の設定
    if (colorAssistMode) {
        if (card.suit === '♥') {
            cardDiv.style.color = 'red';
        } else if (card.suit === '♦') {
            cardDiv.style.color = 'blue';
        } else if (card.suit === '♣') {
            cardDiv.style.color = 'green';
        } else {
            cardDiv.style.color = 'black';
        }
    } else {
        if (card.suit === '♥' || card.suit === '♦') {
            cardDiv.style.color = 'red';
        } else {
            cardDiv.style.color = 'black';
        }
    }

    return cardDiv;
}

// ゲーム開始
function startGame(numPlayers) {
    hasMistakeInRound = false; // 不正解フラグをリセット

    // 「次の問題に進む」ボタンを隠す
    document.getElementById('next-button').style.display = 'none';

    let deck = shuffle(createDeck());

    // カウンターはリセットしない
    updateCounter();

    // プレイヤーの手役データをリセット
    playerHandsData = [];

    // 現在の問題データを保存するオブジェクトを初期化
    currentQuestionData = {
        boardCards: [],
        playerHands: [],
        correctHandNames: []
    };

    // 「チョップ」ボタンを無効化
    document.getElementById('chop-button').disabled = true;

    // ボードカードの表示
    let boardCardCount = 5;
    if (gameMode === 'mix' && mixGameType === 'ocean') {
        boardCardCount = 6; // オーシャンではボードが6枚
    }
    let boardCards = deck.splice(0, boardCardCount);
    let boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    boardCards.forEach(card => {
        boardDiv.appendChild(renderCard(card));
    });

    // ボードカードを保存
    currentQuestionData.boardCards = boardCards;

    // ハンドエリアをクリア
    let handsDiv = document.getElementById('hands');
    handsDiv.innerHTML = '';

    // 2秒後にプレイヤーのハンドを表示
    setTimeout(() => {
        // プレイヤーのハンドの表示
        for (let i = 0; i < numPlayers; i++) {
            let playerHandDiv = document.createElement('div');
            playerHandDiv.className = 'player-hand';
            let handTitle = document.createElement('h3');
            handTitle.innerHTML = `プレイヤー ${i + 1}`;
            playerHandDiv.appendChild(handTitle);

            let handCardsDiv = document.createElement('div');
            handCardsDiv.className = 'hand-cards';

            // ハンドのカード数を決定
            let handCardCount = 2;
            if (gameMode === 'mix' && mixGameType === 'superHoldem') {
                handCardCount = 3; // スーパーホールデムではハンドが3枚
            }

            let playerCards = deck.splice(0, handCardCount);
            playerCards.forEach(card => {
                handCardsDiv.appendChild(renderCard(card));
            });

            playerHandDiv.appendChild(handCardsDiv);

            // プレイヤーの手役を評価して保存
            let fullHand = playerCards.concat(boardCards);
            let evaluatedHand = evaluateHand(fullHand);
            playerHandsData.push({
                playerIndex: i,
                hand: evaluatedHand,
                cards: fullHand
            });

            // プレイヤーのハンドを保存
            currentQuestionData.playerHands.push({
                playerIndex: i,
                handCards: playerCards,
                evaluatedHand: evaluatedHand
            });

            let answerButton = document.createElement('button');
            answerButton.className = 'answer-button';
            answerButton.innerHTML = '答え合わせ';
            answerButton.addEventListener('click', () => {
                checkHand(i, answerButton, playerHandDiv);
            });

            playerHandDiv.appendChild(answerButton);
            handsDiv.appendChild(playerHandDiv);
        }

        // 正解の手役を保存
        currentQuestionData.correctHandNames = playerHandsData.map(data => data.hand.name);

        // 「チョップ」ボタンを有効化
        document.getElementById('chop-button').disabled = false;

    }, 2000); // 2秒（2000ミリ秒）待ってから実行
}

// 手役を評価する関数
function evaluateHand(cards) {
    // カードのランクとスートを取得
    let counts = {};
    let suitsCount = {};
    let ranks = [];

    cards.forEach(card => {
        let rank = valueRanks[card.value];
        ranks.push(rank);
        counts[rank] = (counts[rank] || 0) + 1;
        suitsCount[card.suit] = (suitsCount[card.suit] || []);
        suitsCount[card.suit].push(rank);
    });

    ranks.sort((a, b) => b - a);

    // 同じスートのカードを取得
    let flushSuit = null;
    for (let suit in suitsCount) {
        if (suitsCount[suit].length >= 5) {
            flushSuit = suitsCount[suit].sort((a, b) => b - a);
            break;
        }
    }

    // ストレートの判定
    let isStraight = false;
    let straightRanks = [];
    let uniqueRanks = [...new Set(ranks)];

    // Aを1として扱うために追加
    if (uniqueRanks.includes(14)) {
        uniqueRanks.push(1);
    }

    uniqueRanks.sort((a, b) => b - a);

    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
        if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
            isStraight = true;
            straightRanks = uniqueRanks.slice(i, i + 5);
            break;
        }
    }

    // フラッシュの判定
    if (flushSuit) {
        // ストレートフラッシュの判定
        let flushUniqueRanks = [...new Set(flushSuit)];
        if (flushUniqueRanks.includes(14)) {
            flushUniqueRanks.push(1);
        }
        flushUniqueRanks.sort((a, b) => b - a);

        for (let i = 0; i <= flushUniqueRanks.length - 5; i++) {
            if (flushUniqueRanks[i] - flushUniqueRanks[i + 4] === 4) {
                return { rank: 9, name: 'ストレートフラッシュ', cards: flushUniqueRanks.slice(i, i + 5) };
            }
        }
        return { rank: 6, name: 'フラッシュ', cards: flushSuit.slice(0, 5) };
    }

    if (isStraight) {
        return { rank: 5, name: 'ストレート', cards: straightRanks };
    }

    // カウントを配列に変換してソート
    let countsArray = Object.entries(counts).map(([rank, count]) => ({ rank: parseInt(rank), count }));
    countsArray.sort((a, b) => {
        if (b.count === a.count) {
            return b.rank - a.rank;
        }
        return b.count - a.count;
    });

    // 役の判定
    if (countsArray[0].count === 4) {
        let kickers = ranks.filter(rank => rank !== countsArray[0].rank).sort((a, b) => b - a);
        return { rank: 8, name: 'フォーカード', cards: [countsArray[0].rank, countsArray[0].rank, countsArray[0].rank, countsArray[0].rank, kickers[0]] };
    }

    if (countsArray[0].count === 3 && countsArray[1] && countsArray[1].count >= 2) {
        return { rank: 7, name: 'フルハウス', cards: [countsArray[0].rank, countsArray[0].rank, countsArray[0].rank, countsArray[1].rank, countsArray[1].rank] };
    }

    if (countsArray[0].count === 3) {
        let kickers = ranks.filter(rank => rank !== countsArray[0].rank).sort((a, b) => b - a);
        return { rank: 4, name: 'スリーカード', cards: [countsArray[0].rank, countsArray[0].rank, countsArray[0].rank, kickers[0], kickers[1]] };
    }

    if (countsArray[0].count === 2 && countsArray[1] && countsArray[1].count === 2) {
        let kickers = ranks.filter(rank => rank !== countsArray[0].rank && rank !== countsArray[1].rank).sort((a, b) => b - a);
        return { rank: 3, name: 'ツーペア', cards: [countsArray[0].rank, countsArray[0].rank, countsArray[1].rank, countsArray[1].rank, kickers[0]] };
    }

    if (countsArray[0].count === 2) {
        let kickers = ranks.filter(rank => rank !== countsArray[0].rank).sort((a, b) => b - a);
        return { rank: 2, name: 'ワンペア', cards: [countsArray[0].rank, countsArray[0].rank, kickers[0], kickers[1], kickers[2]] };
    }

    // ハイカード
    return { rank: 1, name: 'ハイカード', cards: ranks.slice(0, 5) };
}

// 手役を比較する関数
function compareHands(handA, handB) {
    if (handA.rank > handB.rank) {
        return 1;
    } else if (handA.rank < handB.rank) {
        return -1;
    } else {
        // ランクが同じ場合、カードの強さを比較
        for (let i = 0; i < handA.cards.length; i++) {
            if (handA.cards[i] > handB.cards[i]) {
                return 1;
            } else if (handA.cards[i] < handB.cards[i]) {
                return -1;
            }
        }
        return 0; // 引き分け
    }
}

// 手役を判定
function checkHand(playerIndex, button, playerHandDiv) {
    let playerData = playerHandsData[playerIndex];

    // 他のプレイヤーの手役と比較
    let isBestHand = true;
    let bestHandIndex = playerIndex;
    for (let i = 0; i < playerHandsData.length; i++) {
        if (i !== playerIndex) {
            let comparison = compareHands(playerData.hand, playerHandsData[i].hand);
            if (comparison < 0) {
                isBestHand = false;
                bestHandIndex = i;
                break;
            } else if (comparison === 0 && i < playerIndex) {
                // 同じ強さの場合、先のプレイヤーを勝者とする
                isBestHand = false;
                bestHandIndex = i;
                break;
            }
        }
    }

    // 引き分けの判定
    let isTie = isTieGame();

    if (isTimeAttack) {
        let isCorrect = false;
        if (isTie) {
            isCorrect = false;
        } else if (isBestHand) {
            isCorrect = true;
        }

        if (isCorrect) {
            correctAnswers++;
            totalQuestions++;
        } else {
            incorrectAnswers++;
            // 間違えた問題を保存
            saveIncorrectQuestion();
        }

        let numPlayers = gameMode === 'normal' ?
            parseInt(document.getElementById('num-players').value) :
            parseInt(document.getElementById('mix-num-players').value);

        if (totalQuestions >= 20) {
            endGame();
        } else {
            // 次の問題へ
            updateCounter();
            startGame(numPlayers);
        }
    } else {
        if (subGameMode === 'hand') {
            // 役を選ぶモード
            // 既に選択肢が表示されている場合は何もしない
            if (playerHandDiv.querySelector('.hand-options')) {
                return;
            }

            // 選択肢のインターフェースを作成
            let optionsDiv = document.createElement('div');
            optionsDiv.className = 'hand-options';

            handNames.forEach(handName => {
                let optionButton = document.createElement('button');
                optionButton.className = 'option-button';
                optionButton.innerHTML = handName;
                optionButton.addEventListener('click', () => {
                    let isCorrect = false;
                    if (handName === playerData.hand.name) {
                        isCorrect = true;
                    } else {
                        hasMistakeInRound = true; // 不正解フラグを立てる
                    }

                    if (isCorrect) {
                        if (!hasMistakeInRound) {
                            alert('正解です！');
                            correctStreak++;
                            updateCounter();
                        } else {
                            alert('正解ですが、既に不正解の選択肢を選んでいます。');
                        }
                    } else {
                        alert(`不正解です。`);
                        correctStreak = 0; // ミスしたのでカウンターをリセット
                        updateCounter();
                    }
                    button.disabled = true;
                    optionsDiv.remove();

                    // 「次の問題に進む」ボタンを表示
                    document.getElementById('next-button').style.display = 'inline-block';
                });
                optionsDiv.appendChild(optionButton);
            });

            // プレイヤーのハンドに選択肢を追加
            playerHandDiv.appendChild(optionsDiv);
        } else {
            // 勝者を選ぶモード
            if (isTie) {
                alert(`不正解です。引き分け（チョップ）でした。`);
                hasMistakeInRound = true;
                correctStreak = 0; // ミスしたのでカウンターをリセット
                updateCounter();
            } else if (isBestHand) {
                if (!hasMistakeInRound) {
                    alert(`正解です！あなたの役は "${playerData.hand.name}" です。`);
                    correctStreak++;
                    updateCounter();
                } else {
                    alert(`正解ですが、既に不正解の選択肢を選んでいます。`);
                }
            } else {
                let winnerIndices = getWinnerIndices();
                let winnerHandName = playerHandsData[winnerIndices[0]].hand.name;
                alert(`不正解です。勝者は "プレイヤー ${winnerIndices[0] + 1}" です。勝者の役は "${winnerHandName}" です。`);
                hasMistakeInRound = true;
                correctStreak = 0; // ミスしたのでカウンターをリセット
                updateCounter();
            }
            // 「次の問題に進む」ボタンを表示
            document.getElementById('next-button').style.display = 'inline-block';
        }
    }
}

// 「チョップ」をチェックする関数
function checkChop() {
    let isTie = isTieGame();

    if (isTimeAttack) {
        let isCorrect = isTie;

        if (isCorrect) {
            correctAnswers++;
            totalQuestions++;
        } else {
            incorrectAnswers++;
            // 間違えた問題を保存
            saveIncorrectQuestion();
        }

        if (totalQuestions >= 20) {
            endGame();
        } else {
            // 次の問題へ
            updateCounter();
            let numPlayers = gameMode === 'normal' ?
                parseInt(document.getElementById('num-players').value) :
                parseInt(document.getElementById('mix-num-players').value);
            startGame(numPlayers);
        }
    } else {
        if (isTie) {
            if (!hasMistakeInRound) {
                alert('正解です！引き分け（チョップ）でした。');
                correctStreak++;
                updateCounter();
            } else {
                alert('正解ですが、既に不正解の選択肢を選んでいます。');
            }
        } else {
            let winnerIndices = getWinnerIndices();
            let winnerHandName = playerHandsData[winnerIndices[0]].hand.name;
            alert(`不正解です。勝者は "プレイヤー ${winnerIndices[0] + 1}" です。勝者の役は "${winnerHandName}" です。`);
            hasMistakeInRound = true;
            correctStreak = 0; // ミスしたのでカウンターをリセット
            updateCounter();
        }
        // 「次の問題に進む」ボタンを表示
        document.getElementById('next-button').style.display = 'inline-block';
    }
}

// 間違えた問題を保存する関数
function saveIncorrectQuestion() {
    // 現在の問題のデータを保存
    incorrectQuestions.push({
        boardCards: currentQuestionData.boardCards,
        playerHands: currentQuestionData.playerHands,
        correctHandNames: currentQuestionData.correctHandNames
    });
}

// ゲーム全体が引き分けかどうかを判定する関数
function isTieGame() {
    let winnerIndices = getWinnerIndices();
    return winnerIndices.length > 1;
}

// 勝者のインデックスを取得する関数
function getWinnerIndices() {
    let bestHand = playerHandsData[0].hand;
    let winnerIndices = [0];
    for (let i = 1; i < playerHandsData.length; i++) {
        let comparison = compareHands(bestHand, playerHandsData[i].hand);
        if (comparison < 0) {
            bestHand = playerHandsData[i].hand;
            winnerIndices = [i];
        } else if (comparison === 0) {
            winnerIndices.push(i);
        }
    }
    return winnerIndices;
}

// 「振り返り」ボタンのイベントリスナー
document.getElementById('review-button').addEventListener('click', () => {
    showReview();
});

// 振り返り画面を表示する関数
function showReview() {
    document.getElementById('result-area').style.display = 'none';
    document.getElementById('review-area').style.display = 'block';

    let reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '';

    incorrectQuestions.forEach((question, index) => {
        let questionDiv = document.createElement('div');
        questionDiv.className = 'review-question';

        // 問題番号
        let questionTitle = document.createElement('h3');
        questionTitle.innerHTML = `問題 ${index + 1}`;
        questionDiv.appendChild(questionTitle);

        // ボードカードの表示
        let boardDiv = document.createElement('div');
        boardDiv.className = 'board-cards';
        question.boardCards.forEach(card => {
            boardDiv.appendChild(renderCard(card));
        });
        questionDiv.appendChild(boardDiv);

        // プレイヤーのハンドと正解の手役を表示
        question.playerHands.forEach(player => {
            let playerDiv = document.createElement('div');
            playerDiv.className = 'player-hand';

            let playerTitle = document.createElement('h4');
            playerTitle.innerHTML = `プレイヤー ${player.playerIndex + 1}`;
            playerDiv.appendChild(playerTitle);

            let handCardsDiv = document.createElement('div');
            handCardsDiv.className = 'hand-cards';
            player.handCards.forEach(card => {
                handCardsDiv.appendChild(renderCard(card));
            });
            playerDiv.appendChild(handCardsDiv);

            let handNameDiv = document.createElement('p');
            handNameDiv.innerHTML = `役: ${player.evaluatedHand.name}`;
            playerDiv.appendChild(handNameDiv);

            questionDiv.appendChild(playerDiv);
        });

        reviewContent.appendChild(questionDiv);
    });
}
