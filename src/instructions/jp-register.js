import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class JPRegister extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        chip8.registers.write(Registers.PC, this.address + chip8.registers.read(Registers.V0));
    }

}