import fontSprites from "./font-sprites";

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getBCD(n) {
    const bcd = new Array();
    do {
        const r = n % 10;
        bcd.push(r);
        n = Math.floor(n / 10);
    } while (n > 0);
    return bcd;
}

export class Chip8Exception extends Error {
}

export class RAM {
    #array;

    constructor(size) {
        this.#array = new Uint8Array(size);
    }

    get length() {
        return this.#array.length;
    }

    getRange(begin, end) {
        return this.#array.subarray(begin, end);
    }
}

export default class Chip8 {

    constructor() {
        this.ram = new Uint8Array(4096);
        this.generalRegisters = new Uint8Array(16);
        this.stack = new Uint16Array(16);
        this.keyboard = [false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false, false];
        this.programStart = 512;
        this.addressRegister = 0;
        this.soundTimer = 0;
        this.delayTimer = 0;
        this.programCounter = 0;
        this.stackPointer = 0;
        this.instruction = 0;
        this.resolveKey = null;

        let shift = 0;
        for (let i = 0; i < fontSprites.length; i++) {
            const sprite = fontSprites[i];
            for (let j = 0; j < sprite.length; j++) {
                this.ram[shift + j] = sprite[j];
            }
            shift += sprite.length;
        }

        this.isRunning = false;
    }

    static create() {
        return new Chip8();
    }

    setScreen(screen) {
        this.screen = screen;
    }

    loadProgram(prog) {
        let i = this.programStart;
        for (const byte of prog) {
            this.ram[i++] = byte;
        }

        this.programCounter = this.programStart;
        this.stackPointer = 0;
    }

    pressKey(k) {
        this.keyboard[k] = true;
        if (this.waitingKey) {
            this.generalRegisters[this.getRegisterX()] = k;
            this.waitingKey = false;
        }
    }

    releaseKey(k) {
        this.keyboard[k] = false;
    }

    async run(freq) {
        this.isRunning = true;
        this.screen.clear();

        const n = Math.floor(freq * 0.017);
        let last = Date.now();
        while (this.isRunning) {
            if (this.delayTimer > 0) this.delayTimer--;
            if (this.soundTimer > 0) this.soundTimer--;
            for (let i = 0; i < n; i++) {
                this.execute();
            }
            let elapsed = Date.now() - last;
            await timeout(17 - elapsed);
            last = Date.now();
        }
    }

    stop() {
        this.isRunning = false;
        this.screen.clear();
    }

    execute() {
        if (this.waitingKey) return;
        this.fetch();
        const opcode = this.getOpCode();
        switch (opcode) {
            case 0x0:
                switch (this.getAddress()) {
                    case 0x0E0: {
                        this.screen.clear();
                        break;
                    }
                    case 0x0EE: {
                        this.programCounter = this.stack[this.stackPointer--];
                        break;
                    }
                    default: {
                        throw new Chip8Exception();
                    }
                }
                break;
            case 0x1:
                this.programCounter = this.getAddress();
                break;
            case 0x2: {
                this.stack[++this.stackPointer] = this.programCounter;
                this.programCounter = this.getAddress();
                break;
            }
            case 0x3: {
                if (this.generalRegisters[this.getRegisterX()] == this.getValue()) this.moveToNextInstruction();
                break;
            }
            case 0x4: {
                if (this.generalRegisters[this.getRegisterX()] != this.getValue()) this.moveToNextInstruction();
                break;
            }
            case 0x5: {
                if (this.generalRegisters[this.getRegisterX()] == this.generalRegisters[this.getRegisterY()]) this.moveToNextInstruction();
                break;
            }
            case 0x6: {
                this.generalRegisters[this.getRegisterX()] = this.getValue();
                break;
            }
            case 0x7: {
                this.generalRegisters[this.getRegisterX()] += this.getValue();
                break;
            }
            case 0x8: {
                switch (this.getNibble(0)) {
                    case 0x0: {
                        this.generalRegisters[this.getRegisterX()] = this.generalRegisters[this.getRegisterY()];
                        break;
                    }
                    case 0x1: {
                        this.generalRegisters[this.getRegisterX()] = this.generalRegisters[this.getRegisterX()] | this.generalRegisters[this.getRegisterY()];
                        break;
                    }
                    case 0x2: {
                        this.generalRegisters[this.getRegisterX()] = this.generalRegisters[this.getRegisterX()] & this.generalRegisters[this.getRegisterY()];
                        break;
                    }
                    case 0x3: {
                        this.generalRegisters[this.getRegisterX()] = this.generalRegisters[this.getRegisterX()] ^ this.generalRegisters[this.getRegisterY()];
                        break;
                    }
                    case 0x4: {
                        this.generalRegisters[0xF] = 0;
                        const result = this.generalRegisters[this.getRegisterX()] + this.generalRegisters[this.getRegisterY()];
                        this.generalRegisters[this.getRegisterX()] = result;
                        if (result > 255) this.generalRegisters[0xF] = 1;
                        break;
                    }
                    case 0x5: {
                        this.generalRegisters[0xF] = 0;
                        const result = this.generalRegisters[this.getRegisterX()] - this.generalRegisters[this.getRegisterY()];
                        this.generalRegisters[this.getRegisterX()] = result;
                        if (result > 0) this.generalRegisters[0xF] = 1;
                        break;

                    }
                    case 0x6: {
                        const value = this.generalRegisters[this.getRegisterX()];
                        this.generalRegisters[0xF] = value & 0b0000_0001;
                        this.generalRegisters[this.getRegisterX()] = value >>> 1;
                        break;
                    }
                    case 0x7: {
                        this.generalRegisters[0xF] = 0;
                        const result = this.generalRegisters[this.getRegisterY()] - this.generalRegisters[this.getRegisterX()];
                        this.generalRegisters[this.getRegisterX()] = result;
                        if (result > 0) this.generalRegisters[0xF] = 1;
                        break;
                    }
                    case 0xE: {
                        const value = this.generalRegisters[this.getRegisterX()];
                        this.generalRegisters[0xF] = (value & 0b1000_0000) >>> 7;
                        this.generalRegisters[this.getRegisterX()] = value << 1;
                        break;
                    }
                    default: {
                        throw new Chip8Exception();
                    }
                }
                break;
            }
            case 0x9: {
                if (this.generalRegisters[this.getRegisterX()] != this.generalRegisters[this.getRegisterY()]) this.moveToNextInstruction();
                break;
            }
            case 0xB: {
                this.programCounter = this.getAddress() + this.generalRegisters[0];
                break;
            }
            case 0xA: {
                this.addressRegister = this.getAddress();
                break;
            }
            case 0xC: {
                this.generalRegisters[this.getRegisterX()] = this.getRandomByte() & this.getValue();
                break;
            }
            case 0xD: {
                const n = this.getNibble(0);

                const x = this.generalRegisters[this.getRegisterX()] % this.screen.width;
                const y = this.generalRegisters[this.getRegisterY()] % this.screen.height;

                const sprite = this.ram.subarray(this.addressRegister, this.addressRegister + n);
                this.generalRegisters[0xF] = 0;
                for (let i = 0; i < n; i++) {
                    this.drawByte(x, y + i, sprite[i]);
                }
                break;
            }
            case 0xE: {
                switch (this.getValue()) {
                    case 0x9E: {
                        const key = this.generalRegisters[this.getRegisterX()];
                        if (this.keyboard[key]) this.moveToNextInstruction();
                        break;
                    }
                    case 0xA1: {
                        const key = this.generalRegisters[this.getRegisterX()];
                        if (!this.keyboard[key]) this.moveToNextInstruction();
                        break;
                    }
                    default: {
                        throw new Chip8Exception();
                    }
                }
                break;
            }
            case 0xF: {
                switch (this.getValue()) {
                    case 0x07: {
                        this.generalRegisters[this.getRegisterX()] = this.delayTimer;
                        break;
                    }
                    case 0x0A: {
                        this.waitingKey = true;
                        break;
                    }
                    case 0x15: {
                        this.delayTimer = this.generalRegisters[this.getRegisterX()];
                        break;
                    }
                    case 0x18: {
                        this.soundTimer = this.generalRegisters[this.getRegisterX()];
                        break;
                    }
                    case 0x1E: {
                        this.addressRegister += this.generalRegisters[this.getRegisterX()];
                        break;
                    }
                    case 0x29: {
                        this.addressRegister = this.generalRegisters[this.getRegisterX()] * 5;
                        break;
                    }
                    case 0x33: {
                        const bcd = getBCD(this.generalRegisters[this.getRegisterX()]);
                        for (let i = 0; i < 3; i++) {
                            const value = bcd.pop();
                            this.ram[this.addressRegister + i] = value ? value : 0;
                        }
                        break;
                    }
                    case 0x55: {
                        for (let r = 0; r <= this.getRegisterX(); r++) {
                            this.ram[this.addressRegister + r] = this.generalRegisters[r];
                        }
                        break;
                    }
                    case 0x65: {
                        for (let r = 0; r <= this.getRegisterX(); r++) {
                            this.generalRegisters[r] = this.ram[this.addressRegister + r];
                        }
                        break;
                    }
                    default: {
                        throw new Chip8Exception();
                    }
                }
                break;
            }
        }
    }

    fetch() {
        const byte1 = this.ram[this.programCounter];
        const byte0 = this.ram[this.programCounter + 1];
        this.instruction = (byte1 << 8) | byte0;
        this.moveToNextInstruction();
    }

    moveToNextInstruction() {
        this.programCounter += 2;
    }

    getOpCode() {
        return this.getNibble(3);
    }

    getAddress() {
        return this.instruction & 0x0FFF;
    }

    getRegisterX() {
        return this.getNibble(2);
    }

    getRegisterY() {
        return this.getNibble(1);
    }

    getValue() {
        return this.instruction & 0x00FF;
    }

    getNibble(n) {
        const mask = 0xF << (4 * n);
        return (this.instruction & mask) >>> (4 * n);
    }

    getRandomByte() {
        return Math.floor(Math.random() * 256);
    }

    drawByte(x, y, byte) {
        let mask = 0b1000_0000;
        for (let i = 7; i >= 0; i--) {
            const pixel = (byte & mask) >>> i;
            mask = mask >>> 1;

            const currentPixel = this.screen.getPixel(x, y);
            this.screen.setPixel(x, y, pixel ^ currentPixel);
            if (pixel && currentPixel) this.generalRegisters[0xF] = 1;
            x++;
        }
    }
}
