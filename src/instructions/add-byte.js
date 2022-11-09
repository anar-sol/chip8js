import { Instruction } from "./instruction.js";

export default class ADDByte extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        chip8.registers.write(this.registerX, registerXValue + this.byte);
    }
    
}