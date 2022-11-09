import { Instruction } from "./instruction.js";
import { Registers } from "../registers.js";

export default class RET extends Instruction {

    execute(chip8) {
        const address = chip8.stack.pop();
        chip8.registers.write(Registers.PC, address);
    }

}