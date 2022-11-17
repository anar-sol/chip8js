import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class LDDelay extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(Registers.I, chip8.registers.read(Registers.I) + chip8.registers.read(this.registerX));
    }
}