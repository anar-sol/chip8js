import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";
import { getBCD } from "../utils.js";

export default class BCD extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerIValue = chip8.registers.read(Registers.I);
        const registerXValue = chip8.registers.read(this.registerX);
        const bcd = getBCD(registerXValue);
        chip8.ram.writeRange(registerIValue, bcd);
    }

}