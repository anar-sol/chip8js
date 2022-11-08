import { getNibble } from "../utils.js";

class Instruction {

    #instruction;

    constructor(instruction) {
        this.#instruction = instruction;
    }

    execute() { }

    get registerX() {
        return getNibble(this.#instruction, 2);
    }

    get registerY() {
        return getNibble(this.#instruction, 1);
    }

    get address() {
        return this.#instruction & 0x0FFF;
    }

    get byte() {
        return this.#instruction & 0x00FF;
    }
}

class InstructionException extends Error {
    constructor(message) {
        super(message);
        this.name = "InstructionException";
    }
}

export { Instruction, InstructionException };
