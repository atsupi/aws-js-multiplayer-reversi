import { updateState } from "./server.js";
import { gameOver } from "./server.js";

let gameState = null;
let eventQueue = [];

function newGameState() {
    return {
        currentPlayer: 1,
        waitingResponse: true,
        gamePhase: 0,
        putMass: {
            valid: false,
            pos: {
                x: 0,
                y: 0,
            }
        },
        winner: 0,
    }
}

function gameLoop() {
    if (!gameState) return;

    const event = eventQueue.pop();
    if (event === undefined) return;

    // to check winner event
    if (event.winner) {
        gameState.currentPlayer = 0;
        gameState.waitingResponse = false;
        gameState.gamePhase = 9;
        gameState.putMass.valid = false;
        gameState.winner = event.winner;
        return gameState.winner;
    }

    // to check new mass operation
    if (event.playerNo === 1 || event.playerNo === 2) {
        gameState.putMass.valid = true;
        gameState.putMass.pos = event.pos;
        gameState.winner = 0;
    } else {
        gameState.putMass.valid = false;
        gameState.putMass.pos = {x: 0, y: 0};
        gameState.winner = 0;
    }

    return gameState.winner;
}

function startInterval() {
    const interval = setInterval(() => {
        const winner = gameLoop();
        if (!winner) {
            updateState(gameState);
            gameState.waitingResponse = false;
        }
        if (winner) {
            gameOver(winner);
            gameState = null;
            clearInterval(interval);
            return;
        }
    }, 1000 / 12);
}

const startGame = () => {
    startInterval();
    gameState = newGameState();
}

const gamePutMass = (pos, playerNo) => {
    console.log("gamePutMass", pos, playerNo);
    if (!pos || !playerNo) return;

    if (gameState.currentPlayer == playerNo) {
        const newParam = {
            playerNo: playerNo,
            pos: pos,
            winner: 0,
        }
        eventQueue.push(newParam);
    }
}

const gamePutMassCompleted = () => {
    gameState.currentPlayer = 3 - gameState.currentPlayer;
    gameState.waitingResponse = true;
    console.log("gamePutMassCompleted", gameState);
}

const gameSkipCurrentPlayer = () => {
    gameState.currentPlayer = 3 - gameState.currentPlayer;
    gameState.waitingResponse = true;
    console.log("gameSkipCurrentPlayer: new=", gameState.currentPlayer);
}

const gameWinner = (winner) => {
    const newParam = {
        playerNo: 0,
        pos: null,
        winner: winner,
    }
    eventQueue.push(newParam);
}

function newFoodPos() {
    const x = Math.floor(Math.random() * 20);
    const y = Math.floor(Math.random() * 20);

    if (x === gameState.playerOne.pos.x && y === gameState.playerOne.pos.y ||
        x === gameState.playerTwo.pos.x && y === gameState.playerTwo.pos.y) {
        newFoodPos();
        return;
    }
    gameState.playerOne.body.forEach((value) => {
        if (x === value.x && y === value.y) {
            newFoodPos();
            return;
        }
    })
    gameState.playerTwo.body.forEach((value) => {
        if (x === value.x && y === value.y) {
            newFoodPos();
            return;
        }
    })

    gameState.food.pos.x = x;
    gameState.food.pos.y = y;
}

export {
    startGame,
    gamePutMass,
    gamePutMassCompleted,
    gameSkipCurrentPlayer,
}
