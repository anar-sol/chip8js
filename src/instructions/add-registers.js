import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class ADDRegisters extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        const registerYValue = chip8.registers.read(this.registerY);
        const result = registerYValue + registerXValue;
        const flag = result > 255 ? 1 : 0;
        chip8.registers.write(this.registerX, result);
        chip8.registers.write(Registers.VF, flag);
    }
}