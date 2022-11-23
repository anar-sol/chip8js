import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class ReadRange extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerIValue = chip8.registers.read(Registers.I);
        const range = chip8.ram.readRange(registerIValue, this.registerX + 1);

        chip8.registers.writeRange(Registers.V0, range);
        chip8.registers.write(Registers.I, registerIValue + this.registerX + 1);
    }

}