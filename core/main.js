const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)

const port = 80
const path = require('path')

const { getRoom,
    newRoom,
    newRoomID,
    removeRoom,
    StreamSession,
    Room } = require('./room.js')


class WSMessage {
    constructor(sessionID, type, value){
        this.SessionID = sessionID;
        this.Type = type;
        this.Value = value;
    }
}

app.use('/static', express.static('files/static'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './files/main.html'))
});
app.ws('/ws_serve', (ws, req) => {
    console.log("new host");
    let room = newRoom(ws)
    ws.send(JSON.stringify(new WSMessage("", "newRoom", room.ID)))
    let interval = setInterval(() => {
        ws.send(JSON.stringify(new WSMessage(null, "beat", null)))
    }, 10 * 1000);
    ws.on('message', msg => {
        let data = JSON.parse(msg)
        console.log("host_data_sessionID,", data.SessionID)
        let session = room.getSession(data.SessionID)
        if(data.Type == "addCallerIceCandidate"){
            session.CallerIceCandidates.push(data.Value);
        } else if(data.Type == "gotOffer"){
            session.Offer = data.Value
        }
        session.CalleeConn.send(msg);
    })

    ws.on('close', () => {
        removeRoom(room.ID);
        room.Sessions.forEach(
            session => session.CalleeConn.send(JSON.stringify(new WSMessage(session.ID, "roomClosed", null))))
        console.log('WebSocket Host was closed')
    })
})

app.ws('/ws_connect', (ws, req) => {
    console.log("new client")
    let id = req.query.id;
    //console.log(id);
    let room = getRoom(id);
    //console.log(room);
    if(room == null){
        ws.send(JSON.stringify(new WSMessage(null, "roomNotFound")));
        return
    }
    let session = room.newSession(ws);
    console.log("session," + session);
    room.CallerConn.send(JSON.stringify(new WSMessage(session.ID, "newSession", session.ID)));
    ws.send(JSON.stringify(new WSMessage(session.ID, "newSession", session.ID)));

    ws.on('message', msg => {
        let data = JSON.parse(msg);
        if(data.SessionID == session.ID){
            if(data.Type == "addCalleeIceCandidate"){
                session.CalleeIceCandidates.push(data.Value);
            } else if(data.Type == "gotAnswer"){
                session.Answer = data.Value
            }
            session.CallerConn.send(msg);
        }
    })

    ws.on('close', () => {
        console.log('WebSocket Client was closed')
    })
})


app.listen(port, '0.0.0.0', () => {
    console.log(`Started on http://0.0.0.0:${port}`)
})