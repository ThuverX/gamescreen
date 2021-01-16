export class GamepadController {

    pollingrate = 50
    #pollIntervalId = -1
    gamepads = {}

    mapping = {
        buttons: {
            0:'A',
            1:'B',
            2:'X',
            3:'Y',

            4: 'bump_left',
            5: 'bump_right',

            6: 'trig_left',
            7: 'trig_right',

            8: 'select',
            9: 'start',

            10:'stickl_press',
            11:'stickr_press',

            12: 'dpad_up',
            13: 'dpad_down',
            14: 'dpad_left',
            15: 'dpad_right',

            16: 'home'
        },
        axes: {
            0: 'stickl_hor',
            1: 'stickl_ver',
            2: 'stickr_hor',
            3: 'stickr_ver'
        }
    }

    constructor() {
        this.#pollIntervalId = setInterval(this.poll.bind(this), this.pollingrate)
    }

    poll() {
        this.gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [])

        let gamepad = Object.values(this.gamepads).find(x => !!x)

        if(!gamepad) return

        let formatted_gamepad = {
            buttons: Object.fromEntries(Object.values(gamepad.buttons).map((x,i) => [this.mapping.buttons[i], x.value])),
            axes: Object.fromEntries(Object.values(gamepad.axes).map((x,i) => [this.mapping.axes[i], x])),
        }

        window.socket.emit('gamepad_message', formatted_gamepad)
    }
}