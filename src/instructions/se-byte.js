import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SEByte extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerValue = chip8.registers.read(this.registerX);
        if (registerValue === this.byte) {
            const currentPC = chip8.registers.read(Registers.PC);
            chip8.registers.write(Registers.PC, currentPC + 2);
        }
    }
}