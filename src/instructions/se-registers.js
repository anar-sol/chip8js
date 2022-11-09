import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SERegisters extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        const registerYValue = chip8.registers.read(this.registerY);
        if (registerXValue === registerYValue) {
            const currentPC = chip8.registers.read(Registers.PC);
            chip8.registers.write(Registers.PC, currentPC + 2);
        }
    }
}