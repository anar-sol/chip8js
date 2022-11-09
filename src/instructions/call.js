import { Instruction } from "./instruction.js";
import { Registers } from "../registers.js";

export default class CALL extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const currentPC = chip8.registers.read(Registers.PC);
        chip8.stack.push(currentPC);
        chip8.registers.write(Registers.PC, this.address);
    }

}