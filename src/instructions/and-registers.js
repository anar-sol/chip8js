import { Instruction } from "./instruction.js";

export default class ANDRegisters extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        const registerYValue = chip8.registers.read(this.registerY);
        chip8.registers.write(this.registerX, registerYValue & registerXValue);
    }
}