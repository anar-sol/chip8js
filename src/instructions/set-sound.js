import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SETSound extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(Registers.SOUND, chip8.registers.read(this.registerX));
    }
}
