import { gamePutMassCompleted, gameSkipCurrentPlayer, startGame } from "./game.js";
import { gamePutMass } from "./game.js";
import { Server } from "socket.io";

const io = new Server(3001, {
    cors: {
        origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    },
});

let clientRooms = {};
let state = {};

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => handleJoinRoom(roomId));
    socket.on("createRoom", () => handleCreateRoom());
    socket.on("disconnect", (reason) => handleDisconnect(reason));
    socket.on("putMass", (pos) => handlePutMass(pos));
    socket.on("putMassCompleted", () => handlePutMassCompleted());
    socket.on("skipCurrentPlayer", () => handleSkipCurrentPlayer());

    function handleSkipCurrentPlayer() {
        gameSkipCurrentPlayer();
        const roomId = clientRooms[socket.id];
        console.log("handleSkipCurrentPlayer", roomId);
        socket.to(roomId).emit("skipCurrentPlayer");
    }

    function handlePutMassCompleted() {
        gamePutMassCompleted();
    }

    function handlePutMass(pos) {
        gamePutMass(pos, socket.number);
    }

    function handleJoinRoom(roomId) {
        console.log("handleJoinRoom", roomId);
        // io.sockets.adapter.rooms is Map/Set collection
        const room = io.sockets.adapter.rooms.get(roomId);
        // room is Set collection
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }
        if (numClients === 0) {
            socket.emit("unknownGame");
            return;
        } else if (numClients > 1) {
            socket.emit("tooManyPlayers");
            return;
        }
        clientRooms[socket.id] = roomId;
        socket.join(roomId);
        socket.emit("roomIdJoined", roomId);

        socket.number = 2;
        socket.emit("init", 2);

        console.log("handleJoinRoom", clientRooms);
        startGame();
    }

    function handleCreateRoom() {
        const roomId = makeId(6);
        clientRooms[socket.id] = roomId;
        socket.emit("roomIdCreated", roomId);
        socket.join(roomId);

        socket.number = 1;
        socket.emit("init", 1);
//        startGame();
    }

    function handleDisconnect(reason) {
        console.log("handleDisconnect", reason);
        delete clientRooms[socket.id];
        socket.disconnect();
        io.emit("removedPlayer", socket.id);
    }
});

function makeId(length) {
    const dict = "ABCDEFGHIJKLMLOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += dict.charAt(Math.floor(Math.random() * dict.length));
    }
    return result;
}

const updateState = (state) => {
    io.emit("updateState", state);
}

const gameOver = (winner) => {
    io.emit("gameOver", winner);
}

export {
    updateState,
    gameOver,
}
