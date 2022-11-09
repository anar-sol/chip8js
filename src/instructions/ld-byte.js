import { Instruction } from "./instruction.js";

export default class LDByte extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(this.registerX, this.byte);
    }
}