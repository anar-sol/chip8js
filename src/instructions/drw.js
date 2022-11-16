import { Registers } from "../registers.js";
import { Instruction } from "./instruction.js";

export default class DRW extends Instruction {

    constructor(instruction) {
        super(instruction);
    }

    execute(chip8) {
        const nBytes = this.nibble;
        const xCoord = chip8.registers.read(this.registerX) % chip8.screen.width;
        const yCoord = chip8.registers.read(this.registerY) % chip8.screen.height;
        const sprite = chip8.ram.readRange(chip8.registers.read(Registers.I), nBytes);

        chip8.registers.write(Registers.VF, 0);

        for (let i = 0; i < nBytes; i++) {
            this.#drawByte(chip8, xCoord, yCoord + i, sprite[i]);
        }
    }

    #drawByte(chip8, x, y, byte) {
        let mask = 0b1000_0000;
        for (let i = 7; i >= 0; i--) {
            const pixel = (byte & mask) >>> i;
            mask = mask >>> 1;

            const currentPixel = chip8.screen.getPixel(x, y);
            chip8.screen.setPixel(x, y, pixel ^ currentPixel);
            if (pixel && currentPixel) chip8.registers.write(Registers.VF, 1);
            x++;
        }
    }
}