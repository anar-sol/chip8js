import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class LDDelay extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(this.registerX, chip8.registers.read(Registers.DELAY));
    }
}
