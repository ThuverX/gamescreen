const ViGEmClient = require('vigemclient')

let v_client = new ViGEmClient()

v_client.connect()

module.exports = class Gamepad {
    io_socket
    gamepad
    index
    connected = false

    controller

    constructor(ID) {
        this.controller = v_client.createX360Controller()
        this.index = ID  
    }

    update(state) {
        if(!this.connected){
            this.controller.connect()
            console.log(this.index, 'is active')
            this.connected = true
        }
        this.controller.axis.leftX.setValue(state.axes.stickl_hor)
        this.controller.axis.leftY.setValue(state.axes.stickl_ver)

        this.controller.axis.rightX.setValue(state.axes.stickr_hor)
        this.controller.axis.rightY.setValue(state.axes.stickr_ver)

        this.controller.button.A.setValue(state.buttons.A == 1)
        this.controller.button.B.setValue(state.buttons.B == 1)
        this.controller.button.X.setValue(state.buttons.X == 1)
        this.controller.button.Y.setValue(state.buttons.Y == 1)
    }

    disconnect() {
        console.log(this.index, 'is removed')
    }
}