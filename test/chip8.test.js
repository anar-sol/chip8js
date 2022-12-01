import fs from 'node:fs/promises';
import Chip8 from '../src/chip8.js';
import { Chip8Exception } from '../src/~chip8.js';

describe("Chip8", () => {
    let rom;
    let chip8;

    beforeAll(async () => {
        rom = Uint8Array.from(await fs.readFile('test/roms/IBM Logo.ch8'));
    });

    beforeEach(() => {
        chip8 = Chip8.newChip8();
    });

    test('loadROM', () => {
        chip8.loadROM(rom);
        const ram = chip8.readRAMRange(chip8.progStartAddr, rom.length);
        expect(ram).toEqual(rom);
    });

    test('loadROM sets PC to progStartAddr', () => {
        chip8.loadROM(rom);
        expect(chip8.pc).toBe(chip8.progStartAddr);
    });

    test('loadROM sets SP to 0', () => {
        chip8.loadROM(rom);
        expect(chip8.sp).toBe(0);
    });

    test('execute 00E0 CLS', () => {
        const prog = Uint8Array.from([0x00, 0xE0]);
        const screen = {
            clear: jest.fn(),
        };

        chip8.screen = screen;
        chip8.loadROM(prog);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(screen.clear).toHaveBeenCalled();
        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction 00EE RET', () => {
        const prog = Uint8Array.from([0x00, 0xEE, 0x00, 0x00, 0x00, 0x00]);
        const RETURN_ADDRESS = 0x204;

        chip8.loadROM(prog);
        chip8.pushToStack(RETURN_ADDRESS);

        chip8.execute();

        expect(chip8.stack).toEqual([]);
        expect(chip8.pc).toBe(RETURN_ADDRESS);
    });

    test('instruction 1nnn JP addr', () => {
        const prog = Uint8Array.from([0x12, 0x04, 0x00, 0x00, 0x00, 0xE0]);

        chip8.loadROM(prog);

        chip8.execute();

        expect(chip8.pc).toBe(0x204);
    });

    test('instruction 2nnn CALL addr', () => {
        const prog = Uint8Array.from([0x22, 0x04, 0x00, 0x00, 0x00, 0xE0]);
        const ADDR = 0x204;

        chip8.loadROM(prog);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.stack).toEqual([previousPC + 2]);
        expect(chip8.pc).toBe(ADDR);
    });

    test('instruction 3xnn Skip next instruction if Vx == nn', () => {
        const prog = Uint8Array.from([0x30, 0x25, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0x0;
        const BYTE_VALUE = 0x25;
        const REGISTER_X_VALUE = BYTE_VALUE;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction 3xnn does not Skip next instruction if Vx != nn', () => {
        const prog = Uint8Array.from([0x3E, 0x25, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0xE;
        const BYTE_VALUE = 0x25;
        const REGISTER_X_VALUE = BYTE_VALUE + 1;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction 4xnn Skip next instruction if Vx != nn', () => {
        const prog = Uint8Array.from([0x4C, 0x7F, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0xC;
        const BYTE_VALUE = 0x7F;
        const REGISTER_X_VALUE = BYTE_VALUE + 1;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction 4xnn does not Skip next instruction if Vx == nn', () => {
        const prog = Uint8Array.from([0x4A, 0xF1, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0xA;
        const BYTE_VALUE = 0xF1;
        const REGISTER_X_VALUE = BYTE_VALUE;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction 5xy0 Skip next instruction if Vx == Vy', () => {
        const prog = Uint8Array.from([0x50, 0xE0, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0x0;
        const REGISTER_Y = 0xE;
        const REGISTER_X_VALUE = 0xF5;
        const REGISTER_Y_VALUE = REGISTER_X_VALUE;


        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction 5xy0 does not Skip next instruction if Vx != Vy', () => {
        const prog = Uint8Array.from([0x50, 0xE0, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0x0;
        const REGISTER_Y = 0xE;
        const REGISTER_X_VALUE = 0xF5;
        const REGISTER_Y_VALUE = 0xE2;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction 6xnn LD nn to Vx', () => {
        const prog = Uint8Array.from([0x60, 0xF1]);
        const REGISTER_X = 0x0;
        const BYTE_VALUE = 0xF1;

        chip8.loadROM(prog);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(BYTE_VALUE);
    });

    test('instruction 7xnn ADD nn to Vx', () => {
        const prog = Uint8Array.from([0x71, 0x2F]);
        const REGISTER_X = 0x1;
        const REGISTER_X_VALUE = 0x20;
        const BYTE_VALUE = 0x2F;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(REGISTER_X_VALUE + BYTE_VALUE);
    });

    test('instruction 8xy0 LD stores value of Vy in Vx', () => {
        const prog = Uint8Array.from([0x83, 0xB0, 0x00, 0x00]);
        const REGISTER_X = 0x3;
        const REGISTER_Y = 0xB;
        const REGISTER_X_VALUE = 0xF5;
        const REGISTER_Y_VALUE = 0xE2;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(REGISTER_X)).toBe(chip8.readRegister(REGISTER_Y));
    });

    test('instruction 8xy1 OR bitwise OR on Vx and Vy, stores the result in Vx', () => {
        const prog = Uint8Array.from([0x81, 0x01, 0x00, 0x00]);
        const REGISTER_X = 0x1;
        const REGISTER_Y = 0x0;
        const REGISTER_X_VALUE = 0b1100_1100;
        const REGISTER_Y_VALUE = 0b0110_1110;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(REGISTER_X_VALUE | REGISTER_Y_VALUE);
    });

    test('instruction 8xy2 bitwise AND on Vx and Vy, stores the result in Vx', () => {
        const prog = Uint8Array.from([0x8A, 0xC2, 0x00, 0x00]);
        const REGISTER_X = 0xA;
        const REGISTER_Y = 0xC;
        const REGISTER_X_VALUE = 0b1100_1100;
        const REGISTER_Y_VALUE = 0b0110_1110;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(REGISTER_X_VALUE & REGISTER_Y_VALUE);
    });

    test('instruction 8xy3 bitwise XOR on Vx and Vy, stores the result in Vx', () => {
        const prog = Uint8Array.from([0x8A, 0x93, 0x00, 0x00]);
        const REGISTER_X = 0xA;
        const REGISTER_Y = 0x9;
        const REGISTER_X_VALUE = 0b1100_1100;
        const REGISTER_Y_VALUE = 0b0110_1110;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(REGISTER_X_VALUE ^ REGISTER_Y_VALUE);
    });

    test('instruction 8xy4 ADD Vx and Vy, stores the result in Vx, VF = carry', () => {
        const prog = Uint8Array.from([0x8A, 0x94, 0x00, 0x00]);
        const REGISTER_X = 0xA;
        const REGISTER_Y = 0x9;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x0F;
        const CARRY_REGISTER = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(REGISTER_X_VALUE + REGISTER_Y_VALUE);
        expect(chip8.readRegister(CARRY_REGISTER)).toBe(0);
    });

    test('instruction 8xy4 ADD Vx and Vy, stores the result in Vx, VF = carry (result > 255)', () => {
        const prog = Uint8Array.from([0x8A, 0x94, 0x00, 0x00]);
        const REGISTER_X = 0xA;
        const REGISTER_Y = 0x9;
        const REGISTER_X_VALUE = 0xFE;
        const REGISTER_Y_VALUE = 0x2;
        const CARRY_REGISTER = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe((REGISTER_X_VALUE + REGISTER_Y_VALUE) & 0xFF);
        expect(chip8.readRegister(CARRY_REGISTER)).toBe(1);
    });

    test('instruction 8xy5 SUB Vy from Vx, stores the result in Vx, if Vx > Vy VF = 1', () => {
        const prog = Uint8Array.from([0x87, 0x85, 0x00, 0x00]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x0F;
        const BORROW_REGISTER = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe((REGISTER_X_VALUE - REGISTER_Y_VALUE) & 0xFF);
        expect(chip8.readRegister(BORROW_REGISTER)).toBe(1);
    });

    test('instruction 8xy5 SUB Vy from Vx, stores the result in Vx, if Vx > Vy VF = 1 (result < 0)', () => {
        const prog = Uint8Array.from([0x87, 0x85, 0x00, 0x00]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x2F;
        const BORROW_REGISTER = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe((REGISTER_X_VALUE - REGISTER_Y_VALUE) & 0xFF);
        expect(chip8.readRegister(BORROW_REGISTER)).toBe(0);
    });

    test('instruction 8xy6 SHR If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 1.', () => {
        const prog = Uint8Array.from([0x83, 0x06, 0x00, 0x00]);
        const REGISTER_X = 0x3;
        const REGISTER_Y = 0x0;
        const REGISTER_X_VALUE = 0x0;
        const REGISTER_Y_VALUE = 0b0101_0101;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = 0b0010_1010;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(1);
    });

    test('instruction 8xy6 SHR If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0.', () => {
        const prog = Uint8Array.from([0x83, 0x06, 0x00, 0x00]);
        const REGISTER_X = 0x3;
        const REGISTER_Y = 0x0;
        const REGISTER_X_VALUE = 0x0;
        const REGISTER_Y_VALUE = 0b0101_0100;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = 0b0010_1010;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0);
    });

    test('instruction 8xy7 SUB Vx from Vy, stores the result in Vx, if Vy > Vx VF = 1', () => {
        const prog = Uint8Array.from([0x87, 0x87, 0x00, 0x00]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x0F;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = (REGISTER_Y_VALUE - REGISTER_X_VALUE) & 0xFF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0);
    });

    test('instruction 8xy7 SUB Vx from Vy, stores the result in Vx, if Vy > Vx VF = 1', () => {
        const prog = Uint8Array.from([0x87, 0x87, 0x00, 0x00]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x2F;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = (REGISTER_Y_VALUE - REGISTER_X_VALUE) & 0xFF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(1);
    });

    test('instruction 8xyE SHL If the most-significant bit of Vx is 1, then VF is set to 1, otherwise 0.', () => {
        const prog = Uint8Array.from([0x83, 0x0E, 0x00, 0x00]);
        const REGISTER_X = 0x3;
        const REGISTER_Y = 0x0;
        const REGISTER_X_VALUE = 0x0;
        const REGISTER_Y_VALUE = 0b1101_0101;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = 0b1010_1010;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(1);
    });

    test('instruction 8xyE SHL If the most-significant bit of Vx is 1, then VF is set to 1, otherwise 0.', () => {
        const prog = Uint8Array.from([0x83, 0x0E, 0x00, 0x00]);
        const REGISTER_X = 0x3;
        const REGISTER_Y = 0x0;
        const REGISTER_X_VALUE = 0x0;
        const REGISTER_Y_VALUE = 0b0101_0101;
        const FLAG_REGISTER = 0xF;
        const EXPECTED_RESULT = 0b1010_1010;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(EXPECTED_RESULT);
        expect(chip8.readRegister(REGISTER_Y)).toBe(REGISTER_Y_VALUE);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0);
    });

    test('instruction 9xy0 Skip next instruction if Vx != Vy', () => {
        const prog = Uint8Array.from([0x9B, 0xC0, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0xB;
        const REGISTER_Y = 0xC;
        const REGISTER_X_VALUE = 0xF1;
        const REGISTER_Y_VALUE = 0xF2;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction 9xy0 Skip next instruction if Vx != Vy', () => {
        const prog = Uint8Array.from([0x9B, 0xC0, 0x00, 0x00, 0x00, 0x00]);
        const REGISTER_X = 0xB;
        const REGISTER_Y = 0xC;
        const REGISTER_X_VALUE = 0xF1;
        const REGISTER_Y_VALUE = 0xF1;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction Annn LD nnn to I', () => {
        const prog = Uint8Array.from([0xA2, 0x04, 0x00, 0x00, 0x00, 0xE0]);
        const ADDRESS_VALUE = 0x204;

        chip8.loadROM(prog);
        const previousPC = chip8.pc;
        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.i).toBe(ADDRESS_VALUE);
    });

    test('instruction Bnnn JP V0, addr: Jump to location nnn + V0', () => {
        const prog = Uint8Array.from([0xB2, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        const ADDRESS_VALUE = 0x202;
        const REGISTER = 0x0;
        const REGISTER_VALUE = 0x4;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER, REGISTER_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(ADDRESS_VALUE + REGISTER_VALUE);
    });

    test('instruction Cxnn, RND Vx, byte: random number 0 to 255, ANDed kk. Result stored in Vx', () => {
        const prog = Uint8Array.from([0xC0, 0xFF]);
        const REGISTER_X = 0x0;

        chip8.loadROM(prog);

        chip8.execute();

        expect(chip8.readRegister(REGISTER_X)).toBeLessThanOrEqual(255);
        expect(chip8.readRegister(REGISTER_X)).toBeGreaterThanOrEqual(0);
    });

    test('instruction Cxnn, RND Vx, byte: random number 0 to 255, ANDed kk. Result stored in Vx', () => {
        const prog = Uint8Array.from([0xCD, 0xF]);
        const REGISTER_X = 0x0D

        chip8.loadROM(prog);

        chip8.execute();

        expect(chip8.readRegister(REGISTER_X)).toBeLessThanOrEqual(16);
        expect(chip8.readRegister(REGISTER_X)).toBeGreaterThanOrEqual(0);
    });

    test('instruction Dxyn', () => {
        /**
         * ROM
         * Dxyn with x = 7, y = 8, n = 2
         * Draw a 2-byte sprite at (V7, V8)
         * the sprite bytes start at I = programStartAddress + 2
         * sprite:
         * ----------
         * |****    |
         * |    ****|
         * ----------
         */
        const prog = Uint8Array.from([0xD7, 0x82, 0xF0, 0x0F]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const FLAG_REGISTER = 0xF;
        const REGISTER_X_VALUE = 28;
        const REGISTER_Y_VALUE = 12;
        const screen = {
            width: 64,
            height: 32,
            setPixel: jest.fn(),
            getPixel: jest.fn(() => 0),
        };

        chip8.loadROM(prog);
        chip8.screen = screen;
        /**
         * set V7 to 28, V8 = 12 for coordinates (28, 12)
         * set I = programStartAddress + 2 to locate sprite bytes
         */
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        chip8.i = chip8.pc + 2;
        const previousPC = chip8.pc;

        chip8.execute();
        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0x0);

        expect(screen.setPixel).toHaveBeenCalledTimes(16);

        expect(screen.setPixel).toHaveBeenCalledWith(28, 12, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(29, 12, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(30, 12, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(31, 12, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(32, 12, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(33, 12, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(34, 12, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(35, 12, 0);

        expect(screen.setPixel).toHaveBeenCalledWith(28, 13, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(29, 13, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(30, 13, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(31, 13, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(32, 13, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(33, 13, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(34, 13, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(35, 13, 1);
    });

    test('instruction Dxyn x and y must be modulo of the width and height', () => {
        /**
         * ROM
         * Dxyn with x = 7, y = 8, n = 1
         * Draw a 7-byte sprite at (V7, V8)
         * the sprite bytes are located at I = programStartAddress + 2
         * sprite:
         * ----------
         * |****    |
         * ----------
         */
        const prog = Uint8Array.from([0xD7, 0x81, 0xF0, 0x0F]);
        const REGISTER_X = 0x7;
        const REGISTER_Y = 0x8;
        const FLAG_REGISTER = 0xF;
        const REGISTER_X_VALUE = 64;
        const REGISTER_Y_VALUE = 34;
        const screen = {
            width: 64,
            height: 32,
            setPixel: jest.fn(),
            getPixel: jest.fn(() => 0),
        };

        chip8.loadROM(prog);
        chip8.screen = screen;
        /**
         * set V7 to 64, V8 = 34 for coordinates (64, 34) --> (0, 2)
         * set I = programStartAddress + 2 to locate sprite bytes
         */
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        chip8.i = chip8.pc + 2;
        const previousPC = chip8.pc;

        chip8.execute();
        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0x0);

        expect(screen.setPixel).toHaveBeenCalledTimes(8);

        expect(screen.setPixel).toHaveBeenCalledWith(0, 2, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(1, 2, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(2, 2, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(3, 2, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(4, 2, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(5, 2, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(6, 2, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(7, 2, 0);
    });

    test('instruction Dxyn with already set pixels', () => {
        /**
         * ROM
         * Dxyn with x = 0, y = 5, n = 1
         * Draw a 7-byte sprite at (V0, V5)
         * the sprite bytes are located at I = programStartAddress + 4
         * sprite:
         * ----------
         * |    ****|
         * ----------
         */
        const prog = Uint8Array.from([0xD0, 0x51, 0xF0, 0x0F, 0x0F]);
        const REGISTER_X = 0x0;
        const REGISTER_Y = 0x5;
        const FLAG_REGISTER = 0xF;
        const REGISTER_X_VALUE = 1;
        const REGISTER_Y_VALUE = 1;
        const screen = {
            width: 64,
            height: 32,
            setPixel: jest.fn(),
            /* pixels (2, 1) and (6, 1) are already set on the screen */
            getPixel: jest.fn((x, y) => {
                if ((x === 2 || x === 6) && (y === 1)) return 1;
                return 0;
            }),
        };

        chip8.loadROM(prog);
        chip8.screen = screen;
        /**
         * set V0 to 1, V5 to 1 for coordinates (1, 1)
         * set I = programStartAddress + 4 to locate sprite bytes
         */
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.writeRegister(REGISTER_Y, REGISTER_Y_VALUE);
        chip8.i = chip8.pc + 4;
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(FLAG_REGISTER)).toBe(0x1);

        expect(screen.setPixel).toHaveBeenCalledTimes(8);
        expect(screen.getPixel).toHaveBeenCalledTimes(8);

        expect(screen.setPixel).toHaveBeenCalledWith(1, 1, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(2, 1, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(3, 1, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(4, 1, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(5, 1, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(6, 1, 0);
        expect(screen.setPixel).toHaveBeenCalledWith(7, 1, 1);
        expect(screen.setPixel).toHaveBeenCalledWith(8, 1, 1);
    });

    test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
        const prog = Uint8Array.from([0xE1, 0x9E]);
        const REGISTER_X = 0x1;
        const KEY = 0x0;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, KEY);
        const previousPC = chip8.pc;
        chip8.keyboard.pressKey(KEY);

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
        const prog = Uint8Array.from([0xE3, 0x9E]);
        const REGISTER_X = 0x3;
        const KEY = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, KEY);
        const previousPC = chip8.pc;
        chip8.keyboard.pressKey(KEY);

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
        const prog = Uint8Array.from([0xE7, 0x9E]);
        const REGISTER_X = 0x7;
        const KEY = 0xF;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, KEY);
        const previousPC = chip8.pc;
        chip8.keyboard.pressKey(KEY);
        chip8.keyboard.releaseKey(KEY);

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction ExA1 - SKNP Vx: Skip next instruction if key with the value of Vx is not pressed', () => {
        const prog = Uint8Array.from([0xEB, 0xA1]);
        const REGISTER_X = 0xB;
        const KEY = 0x9;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, KEY);
        const previousPC = chip8.pc;
        chip8.keyboard.pressKey(KEY);
        chip8.keyboard.releaseKey(KEY);

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 4);
    });

    test('instruction ExA1 - SKNP Vx: Skip next instruction if key with the value of Vx is not pressed', () => {
        const prog = Uint8Array.from([0xEE, 0xA1]);
        const REGISTER_X = 0xE;
        const KEY = 0x9;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, KEY);
        const previousPC = chip8.pc;
        chip8.keyboard.pressKey(KEY);

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
    });

    test('instruction Fx07 - LD Vx, DT: Set Vx = delay timer value', () => {
        const prog = Uint8Array.from([0xF6, 0x07]);
        const REGISTER_X = 0x6;
        const DT_VALUE = 0x1F;

        chip8.loadROM(prog);
        chip8.dt = DT_VALUE;
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(DT_VALUE);
    });

    test('instruction Fx0A - LD Vx, K: Wait for a key press, store the value of the key in Vx', () => {
        const prog = Uint8Array.from([0xF8, 0x0A]);
        const REGISTER_X = 0x8;
        const KEY = 0xA;

        chip8.loadROM(prog);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.isRunning).toBe(false);

        chip8.keyboard.pressKey(KEY);

        expect(chip8.isRunning).toBe(true);
        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.readRegister(REGISTER_X)).toBe(KEY);
    });

    test('instruction Fx15 - LD DT, Vx: Set delay timer = Vx', () => {
        const prog = Uint8Array.from([0xF6, 0x15]);
        const REGISTER_X = 0x6;
        const REGISTER_X_VALUE = 0x1F;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.dt).toBe(REGISTER_X_VALUE);
    });

    test('instruction Fx18 - LD ST, Vx: Set sound timer = Vx', () => {
        const prog = Uint8Array.from([0xF6, 0x18]);
        const REGISTER_X = 0x6;
        const REGISTER_X_VALUE = 0x1F;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.st).toBe(REGISTER_X_VALUE);
    });

    test('instruction Fx1E - ADD I, Vx: Set I = I + Vx', () => {
        const prog = Uint8Array.from([0xF7, 0x1E]);
        const REGISTER_X = 0x7;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_I_VALUE = 0x20;

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.i = REGISTER_I_VALUE;
        const previousPC = chip8.pc;

        chip8.execute();

        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.i).toBe(REGISTER_X_VALUE + REGISTER_I_VALUE);
    });

    test('instruction Fx29 - LD F, Vx: Set I = location of sprite for digit Vx', () => {
        const prog = Uint8Array.from([0xF9, 0x29]);
        const REGISTER_X = 0x7;
        const REGISTER_X_VALUE = 0x0;
        const sprite = Uint8Array.from([
            0b11110000,
            0b10010000,
            0b10010000,
            0b10010000,
            0b11110000,
        ]);

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        const ram = chip8.readRAMRange(chip8.i, sprite.length);

        expect(chip8.pc).toBe(previousPC + 2);
        expect(ram).toEqual(sprite);
    });

    test('instruction Fx29 - LD F, Vx: Set I = location of sprite for digit Vx', () => {
        const prog = Uint8Array.from([0xF9, 0x29]);
        const REGISTER_X = 0x9;
        const REGISTER_X_VALUE = 0xF;
        const sprite = Uint8Array.from([
            0b11110000,
            0b10000000,
            0b11110000,
            0b10000000,
            0b10000000,
        ]);

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        const previousPC = chip8.pc;

        chip8.execute();

        const ram = chip8.readRAMRange(chip8.i, sprite.length);

        expect(chip8.pc).toBe(previousPC + 2);
        expect(ram).toEqual(sprite);
    });

    test('instruction Fx33 - LD B, Vx: Store BCD representation of Vx in memory locations I, I+1, and I+2', () => {
        const prog = Uint8Array.from([0xFE, 0x33]);
        const REGISTER_X = 0xE;
        const REGISTER_X_VALUE = 123;
        const REGISTER_I_VALUE = 0x204;
        const bcd = Uint8Array.from([1, 2, 3]);

        chip8.loadROM(prog);
        chip8.writeRegister(REGISTER_X, REGISTER_X_VALUE);
        chip8.i = REGISTER_I_VALUE;
        const previousPC = chip8.pc;

        chip8.execute();

        const ram = chip8.readRAMRange(REGISTER_I_VALUE, bcd.length);

        expect(chip8.pc).toBe(previousPC + 2);
        expect(ram).toEqual(bcd);
    });

    test('instruction Fx55 - LD [I], Vx, Vx: Store registers V0 through Vx in memory starting at location I', () => {
        const prog = Uint8Array.from([0xFF, 0x55]);
        const REGISTER_X = 0xF;
        const REGISTER_I_VALUE = 0x204;
        const registerValues = [
            0xF0, 0xF1, 0xF2, 0xF3,
            0xF4, 0xF5, 0xF6, 0xF7,
            0xF8, 0xF9, 0xFA, 0xFB,
            0xFC, 0xFD, 0xFE, 0xFF
        ];

        chip8.loadROM(prog);
        chip8.writeRegister(0x0, registerValues[0x0]);
        chip8.writeRegister(0x1, registerValues[0x1]);
        chip8.writeRegister(0x2, registerValues[0x2]);
        chip8.writeRegister(0x3, registerValues[0x3]);
        chip8.writeRegister(0x4, registerValues[0x4]);
        chip8.writeRegister(0x5, registerValues[0x5]);
        chip8.writeRegister(0x6, registerValues[0x6]);
        chip8.writeRegister(0x7, registerValues[0x7]);
        chip8.writeRegister(0x8, registerValues[0x8]);
        chip8.writeRegister(0x9, registerValues[0x9]);
        chip8.writeRegister(0xA, registerValues[0xA]);
        chip8.writeRegister(0xB, registerValues[0xB]);
        chip8.writeRegister(0xC, registerValues[0xC]);
        chip8.writeRegister(0xD, registerValues[0xD]);
        chip8.writeRegister(0xE, registerValues[0xE]);
        chip8.writeRegister(0xF, registerValues[0xF]);
        chip8.i = REGISTER_I_VALUE;
        const previousPC = chip8.pc;

        chip8.execute();

        const ram = chip8.readRAMRange(REGISTER_I_VALUE, registerValues.length);
        expect(ram).toEqual(Uint8Array.from(registerValues));
        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.i).toBe(REGISTER_I_VALUE + REGISTER_X + 1);
    });

    test('instruction Fx65 - LD Vx, [I]: Read registers V0 through Vx from memory starting at location I', () => {
        const prog = Uint8Array.from([0xFF, 0x65, 0x00, 0x00, 0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
            0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF]);
        const REGISTER_X = 0xF;
        const REGISTER_I_VALUE = 0x204;

        chip8.loadROM(prog);
        chip8.i = REGISTER_I_VALUE;
        const previousPC = chip8.pc;

        chip8.execute();

        const ram = prog.subarray(4, 4 + 16);
        expect(chip8.readRegister(0x0)).toBe(ram[0x0]);
        expect(chip8.readRegister(0x1)).toBe(ram[0x1]);
        expect(chip8.readRegister(0x2)).toBe(ram[0x2]);
        expect(chip8.readRegister(0x3)).toBe(ram[0x3]);
        expect(chip8.readRegister(0x4)).toBe(ram[0x4]);
        expect(chip8.readRegister(0x5)).toBe(ram[0x5]);
        expect(chip8.readRegister(0x6)).toBe(ram[0x6]);
        expect(chip8.readRegister(0x7)).toBe(ram[0x7]);
        expect(chip8.readRegister(0x8)).toBe(ram[0x8]);
        expect(chip8.readRegister(0x9)).toBe(ram[0x9]);
        expect(chip8.readRegister(0xA)).toBe(ram[0xA]);
        expect(chip8.readRegister(0xB)).toBe(ram[0xB]);
        expect(chip8.readRegister(0xC)).toBe(ram[0xC]);
        expect(chip8.readRegister(0xD)).toBe(ram[0xD]);
        expect(chip8.readRegister(0xE)).toBe(ram[0xE]);
        expect(chip8.readRegister(0xF)).toBe(ram[0xF]);
        expect(chip8.pc).toBe(previousPC + 2);
        expect(chip8.i).toBe(REGISTER_I_VALUE + REGISTER_X + 1);
    });

    test("run", async () => {
        const prog = Uint8Array.from([0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0,]);
        const FREQUENCY = 118; // 2 instructions per 1/60 second or 17ms
        const MS_PER_FRAME = 17;
        const DELAY_TIMER_VALUE = 100;
        const SOUND_TIMER_VALUE = 100;
        const screen = {
            clear: jest.fn(),
        };

        chip8.loadROM(prog);
        const previousPC = chip8.pc;
        chip8.screen = screen;
        chip8.st = SOUND_TIMER_VALUE;
        chip8.dt = DELAY_TIMER_VALUE;

        Object.defineProperty(global, "performance", {
            value: jest.fn(),
            configurable: true,
            writable: true
        });
        jest.useFakeTimers();
        chip8.run(FREQUENCY);

        expect(chip8.pc).toBe(previousPC + 4);
        expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
        expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);

        jest.advanceTimersByTime(MS_PER_FRAME);

        return new Promise(resolve => { resolve(); }).then(() => {
            expect(chip8.pc).toBe(previousPC + 8);
            expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 2);
            expect(chip8.st).toBe(SOUND_TIMER_VALUE - 2);
        });
    });

    test("pause", async () => {
        const prog = Uint8Array.from([0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0,]);
        const FREQUENCY = 118; // 2 instructions per 1/60 second or 17ms
        const MS_PER_FRAME = 17;
        const DELAY_TIMER_VALUE = 100;
        const SOUND_TIMER_VALUE = 100;
        const screen = {
            clear: jest.fn(),
        };

        chip8.loadROM(prog);
        const previousPC = chip8.pc;
        chip8.screen = screen;
        chip8.st = SOUND_TIMER_VALUE;
        chip8.dt = DELAY_TIMER_VALUE;

        Object.defineProperty(global, "performance", {
            value: jest.fn(),
            configurable: true,
            writable: true
        });
        jest.useFakeTimers();
        chip8.run(FREQUENCY);

        expect(chip8.pc).toBe(previousPC + 4);
        expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
        expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);

        chip8.pause();

        jest.advanceTimersByTime(MS_PER_FRAME);

        return new Promise(resolve => { resolve(); }).then(() => {
            expect(chip8.pc).toBe(previousPC + 4);
            expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
            expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);
        });
    });

    test("resume", async () => {
        const prog = Uint8Array.from([0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0,]);
        const FREQUENCY = 118; // 2 instructions per 1/60 second or 17ms
        const MS_PER_FRAME = 17;
        const DELAY_TIMER_VALUE = 100;
        const SOUND_TIMER_VALUE = 100;
        const screen = {
            clear: jest.fn(),
        };

        chip8.loadROM(prog);
        const previousPC = chip8.pc;
        chip8.screen = screen;
        chip8.st = SOUND_TIMER_VALUE;
        chip8.dt = DELAY_TIMER_VALUE;

        Object.defineProperty(global, "performance", {
            value: jest.fn(),
            configurable: true,
            writable: true
        });
        jest.useFakeTimers();
        chip8.run(FREQUENCY);

        expect(chip8.pc).toBe(previousPC + 4);
        expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
        expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);

        chip8.pause();
        chip8.resume();

        jest.advanceTimersByTime(MS_PER_FRAME);

        return new Promise(resolve => { resolve(); }).then(() => {
            expect(chip8.pc).toBe(previousPC + 8);
            expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 2);
            expect(chip8.st).toBe(SOUND_TIMER_VALUE - 2);
        });
    });

    test("exit", async () => {
        const prog = Uint8Array.from([0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0,]);
        const FREQUENCY = 118; // 2 instructions per 1/60 second or 17ms
        const MS_PER_FRAME = 17;
        const DELAY_TIMER_VALUE = 100;
        const SOUND_TIMER_VALUE = 100;
        const screen = {
            clear: jest.fn(),
        };

        chip8.loadROM(prog);
        const previousPC = chip8.pc;
        chip8.screen = screen;
        chip8.st = SOUND_TIMER_VALUE;
        chip8.dt = DELAY_TIMER_VALUE;

        Object.defineProperty(global, "performance", {
            value: jest.fn(),
            configurable: true,
            writable: true
        });
        jest.useFakeTimers();
        chip8.run(FREQUENCY);

        expect(chip8.pc).toBe(previousPC + 4);
        expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
        expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);

        chip8.exit();
        chip8.resume();

        jest.advanceTimersByTime(MS_PER_FRAME);

        return new Promise(resolve => { resolve(); }).then(() => {
            expect(chip8.pc).toBe(previousPC + 4);
            expect(chip8.dt).toBe(DELAY_TIMER_VALUE - 1);
            expect(chip8.st).toBe(SOUND_TIMER_VALUE - 1);
        });
    });
});
