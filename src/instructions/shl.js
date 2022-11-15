import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class SHL extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const value = chip8.registers.read(this.registerY);
        chip8.registers.write(Registers.VF, (value & 0b1000_0000) >>> 7);
        chip8.registers.write(this.registerX, value << 1);
        const v = value << 1;
        console.log("************* ", v.toString(2));
    }
}