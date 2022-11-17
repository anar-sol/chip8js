import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SETDelay extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(Registers.DELAY, chip8.registers.read(this.registerX));
    }
}
