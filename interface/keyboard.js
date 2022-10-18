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

const buttonsMapping = new Map([
    ['key0', 0x0],
    ['key1', 0x1],
    ['key2', 0x2],
    ['key3', 0x3],
    ['key4', 0x4],
    ['key5', 0x5],
    ['key6', 0x6],
    ['key7', 0x7],
    ['key8', 0x8],
    ['key9', 0x9],
    ['keyA', 0xA],
    ['keyB', 0xB],
    ['keyC', 0xC],
    ['keyD', 0xD],
    ['keyE', 0xE],
    ['keyF', 0xF],
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
            case 'mousedown':
            case 'pointerdown': {
                event.preventDefault();
                const key = event.currentTarget.id;
                if (buttonsMapping.has(key)) this.chip8.pressKey(buttonsMapping.get(key));
                break;
            }
            case 'mouseup': 
            case 'pointerup': {
                event.preventDefault();
                const key = event.currentTarget.id;
                if (buttonsMapping.has(key)) this.chip8.releaseKey(buttonsMapping.get(key));
                break;
            }
        }
    }
}
