import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SNERegisters extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        if (chip8.registers.read(this.registerX) !== chip8.registers.read(this.registerY))
        chip8.registers.write(Registers.PC, chip8.registers.read(Registers.PC) + 2);
    }

}