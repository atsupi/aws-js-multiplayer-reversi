import { gameSkipOnce, setMyPlayerNo, updateGameState } from "./game.js";

const SERVER = "https://e25idfspzm.ap-northeast-1.awsapprunner.com:3001";
const socket = io(SERVER);

const joinRoomButton = document.getElementById("joinRoomButton");
const roomIdInput = document.getElementById("roomIdInput");
const createRoomButton = document.getElementById("createRoomButton");
const gameScreen = document.getElementById("gameScreen");
const gameStatus = document.getElementById("gameStatus");

let myPlayerNo = null;
let initialized = null;

socket.on("connect", () => {
    console.log(`connected: ${socket.id}`);
    initScreen();
});

function initScreen() {
    gameScreen.style.display = "none";
    startScreen.style.display = "block";
    roomIdInput.value = "";
}

socket.on("roomIdCreated", (roomId) => handleRoomIdCreated(roomId));
socket.on("unkownGame", () => handleUnknownGame());
socket.on("tooManyPlayers", () => handleTooManyPlayers());
socket.on("roomIdJoined", (roomId) => handleRoomIdJoined(roomId));
socket.on("removedPlayer", (playerId) => handleRemovedPlayer(playerId));
socket.on("init", (playerNo) => handleInit(playerNo));
socket.on("updateState", (state) => handleUpdateState(state));
socket.on("disconnect", (reason) => handleDisconnect(reason));
socket.on("gameOver", (winner) => handleGameOver(winner));
socket.on("skipCurrentPlayer", () => handleSkipCurrentPlayer());

joinRoomButton.addEventListener("click", (event) => handleJoinRoom());
createRoomButton.addEventListener("click", (event) => handleCreateRoom());

function handleJoinRoom() {
    console.log("handleJoinRoom");
    const roomId = roomIdInput.value;
    if (roomId !== "") {
        socket.emit("joinRoom", roomIdInput.value);
    }
}

function handleCreateRoom() {
    console.log("handleCreateRoom");
    socket.emit("createRoom");
}

function handleRoomIdCreated(roomId) {
    switchToGameScreen(roomId);
}

function handleUnknownGame() {
    console.log("Unknown game");
    initScreen();
}

function handleTooManyPlayers() {
    console.log("Too many players");
    initScreen();
}

function handleRoomIdJoined(roomId) {
    console.log("handleRoomIdJoined");
    switchToGameScreen(roomId);
}

function handleRemovedPlayer(playerId) {
    console.log("handleRemovedPlayer", playerId);
}

function switchToGameScreen(roomId) {
    const div = document.getElementById("spanRoomId");
    div.innerText = roomId;
    gameScreen.style.display = "block";
    startScreen.style.display = "none";
}

function handleInit(playerNo) {
    myPlayerNo = playerNo;
    setMyPlayerNo(myPlayerNo);
    initialized = false;
}

function handleUpdateState(state) {
    state.initialized = initialized;
    updateGameState(state);
    initialized = true;
}

function handleDisconnect(reason) {
    console.log("handleDisconnect", reason);
}

function handleGameOver(winner) {
    if (winner === myPlayerNo) {
        alertStatus("Won the game!", initScreen);
    } else {
        alertStatus("Lost the game...", initScreen);
    }
}

function handleSkipCurrentPlayer() {
    console.log("ToDo: handleSkipCurrent");
    gameSkipOnce();
}

function alertStatus(msg, cb) {
    const div = document.getElementById("spanStatus");
    div.innerText = msg;
    gameStatus.style.display = "block";
    setTimeout(() => {
        gameStatus.style.display = "none";
        cb();
    }, 5000);
}

//document.addEventListener("keydown", handleKeyDown);

function putMass(posX, posY) {
    console.log(posX, posY);
    const pos = {x: posX, y: posY};
    socket.emit("putMass", pos);
}

function putMassCompleted() {
    setTimeout(() => {
        socket.emit("putMassCompleted");
    }, 1000);
}

function skipCurrentPlayer() {
    console.log("skipCurrentPlayer");
    socket.emit("skipCurrentPlayer");
}

export {
    putMass,
    putMassCompleted,
    skipCurrentPlayer,
}