import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SHR extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const value = chip8.registers.read(this.registerY);
        chip8.registers.write(Registers.VF, value & 0b0000_0001);
        chip8.registers.write(this.registerX, value >>> 1);
    }
}