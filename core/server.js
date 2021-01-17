const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)

const port = 80
const path = require('path')

const {
    getRoom,
    newRoom,
    newRoomID,
    removeRoom,
    StreamSession,
    Room
} = require('./room.js')


class WSMessage {
    constructor(sessionID, type, value) {
        this.SessionID = sessionID
        this.Type = type
        this.Value = value
    }

    json() {
        return JSON.stringify(this)
    }
}

app.use('/static', express.static(path.join(__dirname, '../files/static')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../files/main.html'))
})

app.ws('/ws_serve', (ws, req) => {
    let room = newRoom(ws)

    ws.send(new WSMessage('', 'newRoom', room.ID).json())

    let _interval = setInterval(() => {
        ws.send(new WSMessage(null, 'beat', null).json())
    }, 10e3)

    ws.on('message', msg => {
        let data = JSON.parse(msg)

        let session = room.getSession(data.SessionID)

        if (data.Type == 'addCallerIceCandidate') {
            session.CallerIceCandidates.push(data.Value)
        } else if (data.Type == 'gotOffer') {
            session.Offer = data.Value
        }

        session.CalleeConn.send(msg)
    })

    ws.on('close', () => {
        removeRoom(room.ID)
        room.Sessions.forEach(
            session => session.CalleeConn.send(new WSMessage(session.ID, 'roomClosed', null).json()))
        console.log('WebSocket Host was closed')
    })
})

app.ws('/ws_connect', (ws, req) => {
    let id = req.query.id
    let room = getRoom(id)

    if (room == null) {
        ws.send(new WSMessage(null, 'roomNotFound').json())
        return
    }

    let session = room.newSession(ws)

    room.CallerConn.send(new WSMessage(session.ID, 'newSession', session.ID).json())

    ws.send(new WSMessage(session.ID, 'newSession', session.ID).json())

    ws.on('message', msg => {
        let data = JSON.parse(msg)

        if (data.SessionID == session.ID) {
            if (data.Type == 'addCalleeIceCandidate') {
                session.CalleeIceCandidates.push(data.Value)
            } else if (data.Type == 'gotAnswer') {
                session.Answer = data.Value
            }

            session.CallerConn.send(msg)
        }
    })

    ws.on('close', () => {
        console.log('WebSocket Client was closed')
    })
})


app.listen(port, '0.0.0.0', () => {
    console.log(`Started on http://0.0.0.0:${port}`)
})