import { RAM } from "./ram.js";
import { Registers } from "./registers.js";
import InstructionDecoder from "./instructions/index.js";
import fontSprites from "./font-sprites.js";
import { timeout } from "./utils.js";

const RAM_SIZE = 4096;
const PROG_START_ADDR = 0x200;

class Keyboard {
    #keys;
    #callback;

    constructor() {
        this.#keys = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
        this.#callback = null;
    }

    pressKey(key) {
        this.#keys[key] = true;
        if (this.#callback !== null) {
            this.#callback(key);
        }
    }

    releaseKey(key) {
        this.#keys[key] = false;
    }

    isPressed(key) {
        return this.#keys[key];
    }

    onKeyPressed(callback) {
        this.#callback = callback;
    }
}

export default class Chip8 {
    #ram;
    #registers;
    #stack;
    #screen;
    #keyboard;
    #isRunning;
    #stopped;

    constructor() {
        this.#init();
    }

    static newChip8() {
        return new Chip8();
    }

    get pc() {
        return this.#registers.read(Registers.PC);
    }

    set pc(value) {
        this.#registers.write(Registers.PC, value)
    }

    get i() {
        return this.#registers.read(Registers.I);
    }

    set i(value) {
        this.#registers.write(Registers.I, value)
    }

    get dt() {
        return this.#registers.read(Registers.DELAY);
    }

    set dt(value) {
        this.#registers.write(Registers.DELAY, value)
    }

    get st() {
        return this.#registers.read(Registers.SOUND);
    }

    set st(value) {
        this.#registers.write(Registers.SOUND, value)
    }

    get sp() {
        return this.#registers.read(Registers.SP);
    }

    get stack() {
        return this.#stack;
    }

    get progStartAddr() {
        return PROG_START_ADDR;
    }

    get ram() {
        return this.#ram;
    }

    get registers() {
        return this.#registers;
    }

    get screen() {
        return this.#screen;
    }

    set screen(screen) {
        this.#screen = screen;
    }

    get keyboard() {
        return this.#keyboard;
    }

    get isRunning() {
        return this.#isRunning;
    }

    loadROM(rom) {
        this.#ram.writeRange(PROG_START_ADDR, rom);
    }

    pause() {
        this.#isRunning = false;
    }

    resume() {
        this.#isRunning = true;
    }

    exit() {
        this.#stopped = true;
        this.#init();
    }

    readRegister(register) {
        return this.#registers.read(register);
    }

    writeRegister(register, value) {
        this.#registers.write(register, value);
    }

    readRAMRange(address, length) {
        return this.#ram.readRange(address, length);
    }

    pushToStack(address) {
        this.#stack.push(address);
    }

    getSpriteAddr(sprite) {
        return sprite * fontSprites[0].length;
    }

    execute() {
        const instruction =  InstructionDecoder.decode(this.#fetch());
        instruction.execute(this);
    }

    async run(frequency) {
        this.#stopped = false;
        this.#isRunning = true;
        const n = Math.floor(frequency * 0.017);
        let last = Date.now();
        while (true && !this.#stopped) {
            if (this.#isRunning) {
                this.#update(n);
            }
            let elapsed = Date.now() - last;
            await timeout(17 - elapsed);
            last = Date.now();
        }
    }

    #init() {
        this.#ram = RAM.newRAM(RAM_SIZE);
        this.#registers = Registers.newRegisters();
        this.#stack = new Array();
        this.#registers.write(Registers.PC, PROG_START_ADDR);
        this.#registers.write(Registers.SP, 0);
        this.#keyboard = new Keyboard();
        this.#isRunning = false;
        this.#loadSprites();
        if (this.#screen != null) this.#screen.clear(); 
    }

    #update(n) {
        if (this.dt > 0) this.dt--;
        if (this.st > 0) this.st--;
        for (let i = 0; i < n; i++) {
            this.execute();
        }
    }

    #loadSprites() {
        let addr = 0;
        for (const sprite of fontSprites) {
            this.#ram.writeRange(addr, sprite);
            addr += sprite.length;
        }
    }

    #incrementPC() {
        this.pc += 2;
    }

    #fetch() {
        const instruction = this.#ram.readDoubleByte(this.pc);
        this.#incrementPC();
        return instruction;
    }
}
