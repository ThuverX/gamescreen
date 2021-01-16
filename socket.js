const ViGEmClient = require('vigemclient')

let v_client = new ViGEmClient()

v_client.connect()

let gamepads_indices = 0

module.exports = class GameSocket {
    io_socket
    gamepad
    index

    controller

    constructor(socket) {
        this.io_socket = socket

        this.index = gamepads_indices

        this.controller = v_client.createX360Controller()

        gamepads_indices++

        this.connect()
    }

    gamepad_create() {
        console.log(this.index, 'is active')
        this.controller.connect()
    }

    gamepad_update(state) {
        this.controller.axis.leftX.setValue(state.axes.stickl_hor)
        this.controller.axis.leftY.setValue(state.axes.stickl_ver)

        this.controller.axis.rightX.setValue(state.axes.stickr_hor)
        this.controller.axis.rightY.setValue(state.axes.stickr_ver)

        this.controller.button.A.setValue(state.buttons.A == 1)
        this.controller.button.B.setValue(state.buttons.B == 1)
        this.controller.button.X.setValue(state.buttons.X == 1)
        this.controller.button.Y.setValue(state.buttons.Y == 1)
    }

    connect() {
        this.io_socket.on('gamepad_message', (state) => {
            if(!this.gamepad) this.gamepad_create(state)
            this.gamepad = state

            this.gamepad_update(state)
        })
    }

    gamepad_destroy() {
        console.log(this.index, 'is removed')
    }

    disconnect() {
        this.gamepad_destroy()
    }
}