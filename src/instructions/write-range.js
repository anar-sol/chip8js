import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class WriteRange extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerIValue = chip8.registers.read(Registers.I);
        const range = chip8.registers.readRange(Registers.V0, this.registerX + 1);

        chip8.ram.writeRange(registerIValue, range);
        chip8.registers.write(Registers.I, registerIValue + this.registerX + 1);
    }

}