import { RAM } from "./ram.js";
import { Registers } from "./registers.js";
import InstructionDecoder from "./instructions/index.js";

const RAM_SIZE = 4096;
const PROG_START_ADDR = 0x200;

export default class Chip8 {
    #ram;
    #registers;
    #stack;
    #screen;

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

    loadROM(rom) {
        this.#ram.writeRange(PROG_START_ADDR, rom);
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

    execute() {
        const instruction =  InstructionDecoder.decode(this.#fetch());
        instruction.execute(this);
    }

    #init() {
        this.#ram = RAM.newRAM(RAM_SIZE);
        this.#registers = Registers.newRegisters();
        this.#stack = new Array();
        this.#registers.write(Registers.PC, PROG_START_ADDR);
        this.#registers.write(Registers.SP, 0);
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
