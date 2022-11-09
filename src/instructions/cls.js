import { Instruction } from "./instruction.js";

export default class CLS extends Instruction {
    
    execute(chip8) {
        chip8.screen.clear();
    }

}