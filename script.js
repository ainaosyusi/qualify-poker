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
    'K':13,
    'A':14
};

// ゲームモード： 'hand'（役を選ぶ）または 'winner'（勝者を選ぶ）
let gameMode = 'winner'; // デフォルトで勝者を選ぶモードに設定

// 役の名前のリスト
const handNames = ['ストレートフラッシュ', 'フォーカード', 'フルハウス', 'フラッシュ', 'ストレート', 'スリーカード', 'ツーペア', 'ワンペア', 'ハイカード'];

// カウンターの初期化
let correctStreak = 0;

// プレイヤーの手役と強さを格納
let playerHandsData = [];

// ゲームを開始
document.getElementById('start-button').addEventListener('click', () => {
    let numPlayers = parseInt(document.getElementById('num-players').value);
    startGame(numPlayers);
    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    updateCounter(); // カウンターの表示を更新
});

// 新しいハンドを生成
document.getElementById('new-hand-button').addEventListener('click', () => {
    let numPlayers = parseInt(document.getElementById('num-players').value);
    startGame(numPlayers);
});

// ゲームモードの切り替え
document.getElementById('mode-button').addEventListener('click', () => {
    gameMode = gameMode === 'hand' ? 'winner' : 'hand';
    document.getElementById('mode-button').innerHTML = gameMode === 'hand' ? '勝者を選ぶモードに切替' : '役を選ぶモードに切替';
});

// 「チョップ」ボタンのイベントリスナー
document.getElementById('chop-button').addEventListener('click', () => {
    checkChop();
});

// カウンターの表示を更新
function updateCounter() {
    let counterDiv = document.getElementById('counter');
    if (!counterDiv) {
        counterDiv = document.createElement('div');
        counterDiv.id = 'counter';
        document.getElementById('game-area').insertBefore(counterDiv, document.getElementById('board-cards'));
    }
    counterDiv.innerHTML = `ミスなし回数: ${correctStreak}`;
}

function startGame(numPlayers) {
    let deck = shuffle(createDeck());

    // カウンターはリセットしない
    updateCounter();

    // プレイヤーの手役データをリセット
    playerHandsData = [];

    // 「チョップ」ボタンを無効化
    document.getElementById('chop-button').disabled = true;

    // ボードカードの表示
    let boardCards = deck.splice(0, 5);
    let boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    boardCards.forEach(card => {
        boardDiv.appendChild(renderCard(card));
    });

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

            let playerCards = deck.splice(0, 2);
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

            let answerButton = document.createElement('button');
            answerButton.className = 'answer-button';
            answerButton.innerHTML = '答え合わせ';
            answerButton.addEventListener('click', () => {
                checkHand(i, answerButton, playerHandDiv);
            });

            playerHandDiv.appendChild(answerButton);
            handsDiv.appendChild(playerHandDiv);
        }

        // 「チョップ」ボタンを有効化
        document.getElementById('chop-button').disabled = false;

    }, 2000); // 2秒（2000ミリ秒）待ってから実行
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

    cardDiv.innerHTML = card.value;
    let suitDiv = document.createElement('div');
    suitDiv.className = 'suit';
    suitDiv.innerHTML = card.suit;
    cardDiv.appendChild(suitDiv);

    if (card.suit === '♥' || card.suit === '♦') {
        cardDiv.style.color = 'red';
    }
    return cardDiv;
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

    if (gameMode === 'hand') {
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
                }

                if (isCorrect) {
                    alert('正解です！');
                    correctStreak++;
                } else {
                    alert(`不正解です。正しい役は ${playerData.hand.name} です。`);
                    correctStreak = 0; // ミスしたのでカウンターをリセット
                }
                updateCounter(); // カウンターの表示を更新
                button.disabled = true;
                optionsDiv.remove();
            });
            optionsDiv.appendChild(optionButton);
        });

        // プレイヤーのハンドに選択肢を追加
        playerHandDiv.appendChild(optionsDiv);
    } else {
        // 勝者を選ぶモード
        // ボタンを押したプレイヤーを選択したとみなす

        if (isTie) {
            // 引き分けの場合、プレイヤーのボタンを押したら不正解
            alert(`不正解です。引き分け（チョップ）でした。`);
            correctStreak = 0; // ミスしたのでカウンターをリセット
        } else if (isBestHand) {
            // 勝者の場合
            alert(`正解です！あなたの役は "${playerData.hand.name}" です。`);
            correctStreak++;
        } else {
            // 他のプレイヤーが勝者の場合
            let winnerIndices = getWinnerIndices();
            let winnerHandName = playerHandsData[winnerIndices[0]].hand.name;
            alert(`不正解です。勝者は "プレイヤー ${winnerIndices[0] + 1}" です。勝者の役は "${winnerHandName}" です。`);
            correctStreak = 0; // ミスしたのでカウンターをリセット
        }
        updateCounter(); // カウンターの表示を更新
        button.disabled = true;
        // 「チョップ」ボタンを無効化
        document.getElementById('chop-button').disabled = true;
    }
}

// 「チョップ」をチェックする関数
function checkChop() {
    let isTie = isTieGame();
    if (isTie) {
        alert('正解です！引き分け（チョップ）でした。');
        correctStreak++;
    } else {
        let winnerIndices = getWinnerIndices();
        let winnerHandName = playerHandsData[winnerIndices[0]].hand.name;
        alert(`不正解です。勝者は "プレイヤー ${winnerIndices[0] + 1}" です。勝者の役は "${winnerHandName}" です。`);
        correctStreak = 0; // ミスしたのでカウンターをリセット
    }
    updateCounter();
    // 「チョップ」ボタンを無効化
    document.getElementById('chop-button').disabled = true;
    // すべての「答え合わせ」ボタンを無効化
    let answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = true;
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
