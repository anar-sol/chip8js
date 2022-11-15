import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SUBRegisters extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        const registerYValue = chip8.registers.read(this.registerY);
        const result = registerXValue - registerYValue;
        const flag = result < 0 ? 0 : 1;
        chip8.registers.write(this.registerX, result);
        chip8.registers.write(Registers.VF, flag);
    }
}