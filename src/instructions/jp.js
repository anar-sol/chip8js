import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class JP extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(Registers.PC, this.address);
    }

}
