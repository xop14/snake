
// make iffe
(() => {
    const colNum = 20;
    const gridContainer = document.querySelector('.grid-container');
    const startBtn = document.querySelector('.start-btn');
    const endBtn = document.querySelector('.end-btn');
    const resetHighScoreBtn = document.querySelector('.reset-high-score-btn');
    const scoreText = document.querySelector('.score');
    const highScoreText = document.querySelector('.high-score');
    const snakeBodyArr = [];
    const snakeBodyDirectionArr = [];

    const snakeClasses = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
    ]
    
    let isPlaying = false;
    let score = 0;
    let highScore =localStorage.getItem('highScore') || 0;
    let previousHighScore = highScore;
    let nextDirection = ''
    let currentDirection = '';
    let snakeLength = 1;
    let speed = 10;
    let appleCell = null;
    let isCreateApple = true;
    let speedBoost = 1;
    let boostCount = 0;



    highScoreText.textContent = highScore;

      
    // event listeners
    window.addEventListener('resize', updateCellSize);
    startBtn.addEventListener('click', startGame);
    endBtn && endBtn.addEventListener('click', endGame);
    resetHighScoreBtn.addEventListener('click', resetHighScore);
    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        x
        const keyName = '' + e.key;
        const parsedKeyName = keyName.split('Arrow')[1]?.toLocaleLowerCase();
        const allowedKeys = ['up', 'down', 'left', 'right', ' '];
        
        if(!isPlaying && keyName === ' ') {
            startGame();
            startBtn.classList.add('start-btn-active'); 
            setTimeout(() => startBtn.classList.remove('start-btn-active'), 300); 
            
            return;
        }
        if(!isPlaying || keyName === ' ') return;

        if (allowedKeys.includes(parsedKeyName)) {

            if (parsedKeyName === 'down' && currentDirection === 'up' ||
                parsedKeyName === 'up' && currentDirection === 'down' ||
                parsedKeyName === 'left' && currentDirection === 'right' ||
                parsedKeyName === 'right' && currentDirection === 'left' || 
                getNextPos() === snakeBodyArr[1]
            ) {
                return
            }
            if (parsedKeyName === nextDirection) {
                boostCount++;
                speedBoost = boostCount > 2 ? (colNum / 10) : 1;
            } else {
                speedBoost = 1;
                boostCount = 0
            }
            nextDirection = parsedKeyName;

        }
    });

    /************************/
    /*** HELPER FUNCTIONS ***/
    /************************/
    
    function addClass(element, className) {
        element.classList.add(`${className}`);
    }

    function getGridWidth() {
        return gridContainer.clientWidth;
    }

    function getCellSize() {
        const gridWidth = getGridWidth();
        const cellSize = gridWidth / colNum;
        return cellSize;
    }

    function getCells() {
        return Array.from(document.querySelectorAll('.cell'));
    }

    function convertPosToString(x, y) {
        return x + '-' + y;
    }

    function resetHighScore() {
        highScore = 0;
        previousHighScore = 0;
        localStorage.setItem('highScore', highScore);
        highScoreText.textContent = '0';
    }


    /**********************/
    /*** GAME FUNCTIONS ***/
    /**********************/

    function createGrid() {
        gridContainer.innerHTML = '';
        for(y = 0; y < colNum; y++) {
            for (x = 0; x < colNum; x++) {
                const cell = createCell(x, y);
                gridContainer.appendChild(cell);
            }
        }
    }
    
    function createCell(x, y) {
        const cell = document.createElement('div');
        addClass(cell, 'cell');
        cell.dataset.cellId = convertPosToString(x, y);
        cell.style.height = getCellSize() + 'px';
        cell.style.width = getCellSize() + 'px';
        cell.style.background = (x+y) % 2 ? '#f6f6f6' : '#ffffff';
        return cell;
    }
    
    
    
    function updateCellSize() {
        const cells = getCells();
        cells.forEach(cell => {
            cell.style.height = getCellSize() + 'px';
            cell.style.width = getCellSize() + 'px';
        });
    }

    function addEyes(cell) {
        const leftEye = document.createElement('div');
        const rightEye = document.createElement('div');
        const cellSize = getCellSize()
        const isHorizontal = currentDirection === 'left' || currentDirection === 'right';
        cell.style.gap = `${cellSize / 20}px`;
        cell.style.flexDirection = isHorizontal ? 'column' : 'row';
        leftEye.style.width = `${cellSize / 3}px`;
        leftEye.style.borderWidth = `${cellSize / 12}px`;
        leftEye.classList.add('eye');
        rightEye.style.width = `${cellSize / 3}px`;
        rightEye.style.borderWidth = `${cellSize / 12}px`;
        rightEye.classList.add('eye');
        cell.appendChild(leftEye);
        cell.appendChild(rightEye);
    }

    function renderSnake() {
        const cells = getCells();
        cells.forEach((cell) => {
            const cellId = cell.dataset.cellId;
            cell.innerHTML = '';
            if (snakeBodyArr.includes(cellId)) {
                if (snakeBodyArr.length === 1) {
                    addEyes(cell);
                    cell.classList.add(...snakeClasses);
                } else if (snakeBodyArr.length > 2 && snakeBodyArr[snakeBodyArr.length - 1] === cellId) {
                    cell.classList.remove(...snakeClasses);
                    // snake tail style
                    switch (snakeBodyDirectionArr[snakeBodyArr.length - 2]) {
                        case 'up':
                            cell.classList.add('bottom-left', 'bottom-right');
                            break;
                        case 'right':
                            cell.classList.add('top-left','bottom-left');
                            break;
                        case 'down':
                            cell.classList.add('top-left', 'top-right');
                            break;
                        case 'left':
                            cell.classList.add('top-right', 'bottom-right');
                            break;
                    }
                } else if (snakeBodyArr[0] === cellId) {
                    // snake head style
                    const eye = document.createElement('div');
                    addEyes(cell);
                    switch (snakeBodyDirectionArr[0]) {
                        case 'up':
                            cell.classList.add('top-left', 'top-right');
                            break;
                        case 'right':
                            cell.classList.add('top-right', 'bottom-right');
                            break;
                        case 'down':
                            cell.classList.add('bottom-left', 'bottom-right');
                            break;
                        case 'left':
                            cell.classList.add('top-left','bottom-left');
                            break;
                        default:
                            cell.classList.add(...snakeClasses);
                            break;
                    }
                } else if (snakeBodyArr.length === 2 && snakeBodyArr[1] === cellId) {
                    cell.classList.remove(...snakeClasses);
                    // snake tail style for snake length 2
                    switch (snakeBodyDirectionArr[0]) {
                        case 'up':
                            cell.classList.add('bottom-left', 'bottom-right');
                            break;
                        case 'right':
                            cell.classList.add('top-left','bottom-left');
                            break;
                        case 'down':
                            cell.classList.add('top-left', 'top-right');
                            break;
                        case 'left':
                            cell.classList.add('top-right', 'bottom-right');
                            break;
                    }
                } else {
                    // snake body style
                    cell.classList.remove(...snakeClasses);
                }
                cell.classList.add('snake');
                // add corners
                const index = snakeBodyArr.findIndex(item => item === cellId);
                const initial = snakeBodyDirectionArr[index];
                const next = snakeBodyDirectionArr[index - 1];
                if (snakeBodyArr.length > 1) {
                    if(initial === 'right' && next === 'up') {
                        cell.classList.add('bottom-right');
                    }
                    if(initial === 'right' && next === 'down') {
                        cell.classList.add('top-right');
                    }
                    if(initial === 'left' && next === 'up') {
                        cell.classList.add('bottom-left');
                    }
                    if(initial === 'left' && next === 'down') {
                        cell.classList.add('top-left');
                    }
                    if(initial === 'up' && next === 'right') {
                        cell.classList.add('top-left');
                    }
                    if(initial === 'up' && next === 'left') {
                        cell.classList.add('top-right');
                    }
                    if(initial === 'down' && next === 'right') {
                        cell.classList.add('bottom-left');
                    }
                    if(initial === 'down' && next === 'left') {
                        cell.classList.add('bottom-right');
                    }
                }
            } else {
                cell.classList.remove('snake', ...snakeClasses);
            }
        });
    }

    function createApple() {
        if(!isCreateApple) return;
        const cells = getCells();
        const emptyCells = cells.filter(cell => !snakeBodyArr.includes(cell.dataset.cellId));
        const randIndex = Math.floor(Math.random() * emptyCells.length)
        appleCell = emptyCells[randIndex];
        if (appleCell) {
            appleCell.classList.add('apple');
        }
        isCreateApple = false
    }

    function getAppleEatenStatus() {
        const isEatApple = snakeBodyArr[0] === appleCell.dataset.cellId;
        if (isEatApple) {
            snakeLength++;
            incrementScore();
            removeApple();
            createApple();
        }
        return isEatApple;
    }

    
    function removeApple() {
        isCreateApple = true;
        appleCell.classList.remove('apple');
    }

    function incrementScore() {
        score++;
        highScore = Math.max(score, highScore);
        localStorage.setItem('highScore', highScore);
        scoreText.textContent = score;
        highScoreText.textContent = highScore;
    }

    function resetScore() {
        score = 0;
        scoreText.textContent = score;
    }

    function moveSnake() {
        const [x, y] = getNextPos();
        const nextPosString = convertPosToString(x, y);
        snakeBodyArr.unshift(nextPosString);
        snakeBodyArr.length = snakeLength;
        snakeBodyDirectionArr.unshift(currentDirection);
        snakeBodyDirectionArr.length = snakeLength;
    }

    function getCurrentPos() {
        let [x, y] = snakeBodyArr[0].split('-');
        
        // convert to integers
        x = +x;
        y = +y;
        
        return [x, y];
    }

    function getNextPos() {
        let [x, y] = getCurrentPos();

        switch (currentDirection) {
            case 'up': 
                y--;
                break;
            case 'down':
                y++;
                break;
            case 'left':
                x--;
                break;
            case 'right':
                x++;
                break;
            }
            if (x < 0 || y < 0 || x >= colNum || y >= colNum) return [null, null];
            
            return [x, y];

    }

    function createStartPosition() {
        const randX = Math.floor(Math.random() * colNum);
        const randY = Math.floor(Math.random() * colNum);
        const snakeHeadPos = convertPosToString(randX, randY);
        snakeBodyArr.push(snakeHeadPos);
        return
    }

    function createAlertModal(title = '', message = '') {
        if (!title && !message) return false
        
        const alertModal = document.createElement('div');
        alertModal.className = 'alert-modal';
        if (title) {
            const titleText = document.createElement('h2');
            titleText.textContent = title;
            alertModal.appendChild(titleText);
        }
        if (message) {
            const messageText = document.createElement('p');
            messageText.textContent = message;
            alertModal.appendChild(messageText);
        }

        gridContainer.appendChild(alertModal);
        const gridWidth = gridContainer.clientWidth;
        const gridHeight = gridContainer.clientHeight;
        const alertWidth = alertModal.clientWidth;
        const alertHeight = alertModal.clientHeight;
        const leftPos = (gridWidth - alertWidth) / 2;
        const topPos = (gridHeight - alertHeight) / 2;
        alertModal.style.left = leftPos + 'px';
        alertModal.style.top = topPos + 'px';

        setTimeout(() => gridContainer.removeChild(alertModal), 1800);
        
        return alertModal;
    }

    function startGame() {
        if (isPlaying) return;
        endGame();
        if (!isCreateApple) {
            removeApple();
        }
        let counter = 0;
        snakeBodyArr.length = 0;
        isPlaying = true;
        snakeLength = 1;
        nextDirection = '';
        speedBoost = 1;
        resetScore();
        createStartPosition();
        renderSnake();
        
        const clock = () => setTimeout(() => {
            if (isPlaying) {
                ++counter;
                currentDirection = nextDirection;
                moveSnake();
                createApple();
                getAppleEatenStatus();
                if (isGameOver()) {
                    endGame();
                } else {
                    renderSnake();
                }
                clock();
            } else {
                clearInterval(clock);
                console.log('timer cleared')
            }
        }, 1000/speed/speedBoost);
        clock();
    }


    function isBeatHighScore() {
        if (highScore > previousHighScore) {
            setTimeout( () => createAlertModal(
                'Congratulations!', 
                'You beat your previous high score!'
                ), 2000);
            previousHighScore = highScore;
        }
    }
    function isGameOver() {
        const snakeHead = snakeBodyArr[0];

        // if snake head hits edge
        if (snakeHead === 'null-null') {
            createAlertModal('Game over!', 'Hit wall!');
            isBeatHighScore();
            return true;
        }
        // if snake head hits body
        if (snakeBodyArr.slice(1).includes(snakeHead)) {
            createAlertModal('Game over!', 'Hit body!');
            isBeatHighScore();
            return true;
        }

        return false;
    }
    

    function endGame() {
        isPlaying = false;
        currentDirection = '';
    }

    createGrid();
})()