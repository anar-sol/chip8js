import { RAM } from "./ram.js";
import { timeout, getBCD } from "./utils.js";
import fontSprites from "./font-sprites.js";

export class Chip8Exception extends Error {
}

export default class Chip8 {
    #RAM_SIZE = 4096;
    #NB_GENERAL_REGISTERS = 16;
    #STACK_SIZE = 16;
    #PROGRAM_START_ADDRESS = 512;

    #ram;
    #generalRegisters;
    #stack;
    #addressRegister;
    #soundTimer;
    #delayTimer;
    #programCounter;
    #stackPointer;
    #instruction;
    #isRunning;
    #keyboard;

    constructor() {
        this.initialize();
    }

    static newChip8() {
        return new Chip8();
    }

    get ram() {
        return this.#ram;
    }

    get generalRegisters() {
        return this.#generalRegisters;
    }

    get stack() {
        return this.#stack;
    }

    get programStartAddress() {
        return this.#PROGRAM_START_ADDRESS;
    }

    get addressRegister() {
        return this.#addressRegister;
    }

    set addressRegister(value) {
        this.#addressRegister = value;
    }

    get soundTimer() {
        return this.#soundTimer;
    }

    set soundTimer(value) {
        this.#soundTimer = value;
    }

    get delayTimer() {
        return this.#delayTimer;
    }

    set delayTimer(value) {
        this.#delayTimer = value;
    }

    get programCounter() {
        return this.#programCounter;
    }

    set programCounter(value) {
        this.#programCounter = value;
    }

    get stackPointer() {
        return this.#stackPointer;
    }

    set stackPointer(value) {
        this.#stackPointer = value;
    }

    get instruction() {
        return this.#instruction;
    }

    set instruction(value) {
        this.#instruction = value;
    }

    get isRunning() {
        return this.#isRunning;
    }

    set isRunning(value) {
        this.#isRunning = value;
    }

    get keyboard() {
        return this.#keyboard;
    }

    initialize() {
        this.#ram = RAM.newRAM(this.#RAM_SIZE);
        this.#generalRegisters = new Uint8Array(this.#NB_GENERAL_REGISTERS);
        this.#stack = new Uint16Array(this.#STACK_SIZE);

        this.#addressRegister = 0;
        this.#soundTimer = 0;
        this.#delayTimer = 0;
        this.#programCounter = 0;
        this.#stackPointer = 0;
        this.#instruction = 0;
        this.#isRunning = false;

        this.#loadSprites();
        this.#initKeyboard();
    }

    #loadSprites() {
        for (let i = 0; i < fontSprites.length; i++) {
            const sprite = fontSprites[i];
            this.ram.writeRange(i * sprite.length, sprite);
        }
    }

    #initKeyboard() {
        this.#keyboard = [false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false, false];
    }

    setScreen(screen) {
        this.screen = screen;
    }

    loadProgram(prog) {
        this.ram.writeRange(this.programStartAddress, prog);

        this.programCounter = this.programStartAddress;
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

                const sprite = this.ram.readRange(this.addressRegister, n);
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
                            this.ram.writeByte(this.addressRegister + i, value ? value : 0);
                        }
                        break;
                    }
                    case 0x55: {
                        for (let r = 0; r <= this.getRegisterX(); r++) {
                            this.ram.writeByte(this.addressRegister + r, this.generalRegisters[r]);
                        }
                        break;
                    }
                    case 0x65: {
                        for (let r = 0; r <= this.getRegisterX(); r++) {
                            this.generalRegisters[r] = this.ram.readByte(this.addressRegister + r);
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
        this.instruction = this.ram.readDoubleByte(this.programCounter);
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
