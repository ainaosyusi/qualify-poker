// スートとランクの定義
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let bestHands = [];         // マルチハンドモード用
let numberOfHands = 2;      // マルチハンドモードでのプレイヤー数（初期値2）
let numberOfHandsSet = false; // プレイヤー数が設定済みかどうか

// 役名のマッピング
const handNameMap = {
    'Royal Flush': 'ロイヤルフラッシュ',
    'Straight Flush': 'ストレートフラッシュ',
    'Four of a Kind': 'フォーカード',
    'Full House': 'フルハウス',
    'Flush': 'フラッシュ',
    'Straight': 'ストレート',
    'Three of a Kind': 'スリーカード',
    'Two Pair': 'ツーペア',
    'One Pair': 'ワンペア',
    'High Card': 'ハイカード'
};

// デッキの生成
function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit: suit, rank: rank });
        }
    }
    return deck;
}

// シャッフル関数
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// マルチハンドモードの開始
function startMultiHandMode() {
    // プレイヤー数の入力（初回のみ）
    if (!numberOfHandsSet) {
        numberOfHands = parseInt(prompt('何人分のハンドを配りますか？（2〜4）', '2'));
        if (isNaN(numberOfHands) || numberOfHands < 2 || numberOfHands > 4) {
            alert('有効な人数を入力してください（2〜4）');
            return;
        }
        numberOfHandsSet = true; // プレイヤー数が設定されたことを記録
    }

    // 最初の問題を出す
    nextMultiHandProblem();
}

// 次の問題を表示
function nextMultiHandProblem() {
    // 画面の初期化
    document.getElementById('hand-container').innerHTML = '';
    document.getElementById('board-cards').innerHTML = '';
    document.getElementById('multi-result').textContent = '';
    document.getElementById('multi-symbol').style.display = 'none'; // 結果表示エリアを非表示

    // マルチハンドを配る
    dealMultipleHands(numberOfHands);
}

function dealMultipleHands(numHands) {
    let deck = createDeck();
    deck = shuffleDeck(deck);

    // 各プレイヤーのハンドを配布
    let hands = [];
    for (let i = 0; i < numHands; i++) {
        hands.push(deck.slice(i * 2, i * 2 + 2));
    }

    // ボードの配布
    const board = deck.slice(numHands * 2, numHands * 2 + 5);

    // ハンドの表示
    displayMultipleHands(hands);

    // ボードの表示
    displayCards(board, 'board');

    // 各ハンドの評価
    bestHands = [];
    for (let i = 0; i < numHands; i++) {
        const allCards = hands[i].concat(board);
        const evaluatedHand = evaluateHand(allCards);
        bestHands.push({
            player: i + 1,
            hand: evaluatedHand,
            cards: hands[i],
        });
    }
}

// 複数のハンドを表示
function displayMultipleHands(hands) {
    const handContainer = document.getElementById('hand-container');
    handContainer.innerHTML = '';

    hands.forEach((hand, index) => {
        const playerHandDiv = document.createElement('div');
        playerHandDiv.className = 'card-container';
        playerHandDiv.innerHTML = `
            <h2>プレイヤー ${index + 1} のハンド</h2>
            <div id="hand-${index}-cards" class="player-hand"></div>
            <div id="player-${index}-hand-rank"></div>
            <button onclick="submitMultiHandAnswer(${index})">このハンドを選択</button>
        `;
        handContainer.appendChild(playerHandDiv);
        displayCards(hand, `hand-${index}`);
    });
}

function submitMultiHandAnswer(selectedIndex) {
    const resultElement = document.getElementById('multi-result');
    const symbolElement = document.getElementById('multi-symbol');

    // プレイヤーのハンドを評価
    const handsToCompare = bestHands.map(h => h.hand);
    const winningHands = Hand.winners(handsToCompare);

    // 勝者の特定
    const winners = bestHands.filter(h => winningHands.includes(h.hand));

    // ユーザーの選択が勝者かどうかを判定
    const userIsCorrect = winners.some(winner => winner.player === selectedIndex + 1);

    // 結果を表示
    if (userIsCorrect) {
        resultElement.textContent = '正解です！';
        symbolElement.textContent = '○'; // ○を表示
        symbolElement.className = 'correct'; // クラスを追加
    } else {
        resultElement.textContent = '不正解です。';
        symbolElement.textContent = '×'; // ×を表示
        symbolElement.className = 'incorrect'; // クラスを追加
    }

    // 結果表示エリアを表示
    resultElement.style.display = 'block';
    symbolElement.style.display = 'block';

    // 各プレイヤーの役を表示
    bestHands.forEach((h, index) => {
        const handRankDiv = document.getElementById(`player-${index}-hand-rank`);
        handRankDiv.textContent = `役: ${h.hand.nameJa}`;
    });

    // ボタンを無効化する
    const buttons = document.querySelectorAll('.card-container button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}


// カードの表示
function displayCards(cards, elementId) {
    const container = document.getElementById(elementId + '-cards');
    container.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card ' + card.suit;

        // スートのシンボルを取得
        let suitSymbol = '';
        switch (card.suit) {
            case 'hearts':
                suitSymbol = '♥';
                break;
            case 'diamonds':
                suitSymbol = '♦';
                break;
            case 'clubs':
                suitSymbol = '♣';
                break;
            case 'spades':
                suitSymbol = '♠';
                break;
        }

        // カードの表示内容を設定
        cardElement.innerHTML = `
            <div class="card-rank">${card.rank}</div>
            <div class="card-suit">${suitSymbol}</div>
        `;

        container.appendChild(cardElement);
    });
}

// 役の評価
function evaluateHand(cards) {
    const cardStrings = cards.map(card => {
        let rank = card.rank;
        if (rank === '10') rank = 'T';
        return rank + card.suit[0].toUpperCase();
    });

    // 役の評価（pokersolverライブラリを使用）
    const result = Hand.solve(cardStrings);

    // 役名を日本語に変換
    result.nameJa = handNameMap[result.name] || result.name;

    return result;
}
