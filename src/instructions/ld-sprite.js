import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class LDSprite extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const registerXValue = chip8.registers.read(this.registerX);
        const spriteAddr = chip8.getSpriteAddr(registerXValue);
        chip8.registers.write(Registers.I, spriteAddr);
    }

}