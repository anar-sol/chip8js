import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SKP extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const key = chip8.registers.read(this.registerX);
        if (chip8.keyboard.isPressed(key)) chip8.registers.write(Registers.PC, chip8.registers.read(Registers.PC) + 2);
    }
}