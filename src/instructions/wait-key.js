import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class WaitKey extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerX = this.registerX;
        chip8.pause();
        chip8.onKeyPressed(key => {
            chip8.registers.write(registerX, key);
            chip8.resume();
        });
    }
}