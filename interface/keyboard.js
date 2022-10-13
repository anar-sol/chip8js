const keyMapping = new Map([
    ['Digit1', 0x1],
    ['Digit2', 0x2],
    ['Digit3', 0x3],
    ['Digit4', 0xC],

    ['KeyQ', 0x4],
    ['KeyW', 0x5],
    ['KeyE', 0x6],
    ['KeyR', 0xD],

    ['KeyA', 0x7],
    ['KeyS', 0x8],
    ['KeyD', 0x9],
    ['KeyF', 0xE],

    ['KeyZ', 0xA],
    ['KeyX', 0x0],
    ['KeyC', 0xB],
    ['KeyV', 0xF],
]);

export default class Keyboard {
    constructor(chip8) {
        this.chip8 = chip8;
    }

    static create(chip8) {
        return new Keyboard(chip8);
    }

    handle(event) {
        switch (event.type) {
            case 'keydown': {
                if (keyMapping.has(event.code)) this.chip8.pressKey(keyMapping.get(event.code));
                break;
            }
            case 'keyup': {
                if (keyMapping.has(event.code)) this.chip8.releaseKey(keyMapping.get(event.code));
                break;
            }
            
        }
    }
}
