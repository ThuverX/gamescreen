const { getRandomName } = require('./names-generator.js')
var roomMap = {};
class StreamSession {
    constructor(id, callerConn, calleeConn){
        this.ID = id
        this.CallerIceCandidates = []
        this.CalleeIceCandidates = []
        this.CallerConn = callerConn
        this.CalleeConn = calleeConn
    }
}

class Room {
    constructor(id, callerconn){
        this.ID = id
        this.Sessions = []
        this.CallerConn = callerconn
    };
    
    getSession(id){
        return this.Sessions[id]
    }

    newSession(ws){
        let session = new StreamSession(this.newSessionID(), this.CallerConn, ws);
        console.log('newSession', session);
        this.Sessions[session.ID] = session;
        return session;
    }

    newSessionID(){
        return `${this.ID}$${getRandomName()}`
    }
}

function getRoom(id) {
    return roomMap[id];
}

function newRoom(ws) {
    let room = new Room(newRoomID(), ws);
    roomMap[room.ID] = room
    return room
}

function newRoomID(){
    let id = getRandomName();
    return id
}

function removeRoom(id){
    roomMap[id] = null;
    delete roomMap[id]
}

module.exports = {
    getRoom,
    newRoom,
    newRoomID,
    removeRoom,
    StreamSession,
    Room
}