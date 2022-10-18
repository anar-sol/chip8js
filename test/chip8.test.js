import fs from 'node:fs/promises';

import Chip8 from '../src/chip8.js';
import { Chip8Exception } from '../src/chip8.js';


let IBMLogoProgram;

beforeAll(async () => {
    IBMLogoProgram = Uint8Array.from(await fs.readFile('test/roms/IBM Logo.ch8'));
});

test('RAM is 4K (4096) bytes length', () => {
    expect(Chip8.create().ram).toHaveLength(4096);
});

test('programs start at location programStart = 0x200 (512)', () => {
    expect(Chip8.create().programStart).toBe(512);
});

test('has 16 general purpose 8-bit registers', () => {
    expect(Chip8.create().generalRegisters).toHaveLength(16);
});

test('has a 16-bit addressRegister', () => {
    expect(typeof Chip8.create().addressRegister).toBe('number');
});

test('has a 8-bit sound timer register', () => {
    expect(typeof Chip8.create().soundTimer).toBe('number');
});

test('has a 8-bit delay timer register', () => {
    expect(typeof Chip8.create().delayTimer).toBe('number');
});

test('has a 16-bit program counter register', () => {
    expect(typeof Chip8.create().programCounter).toBe('number');
});

test('has a 8-bit stack pointer register', () => {
    expect(typeof Chip8.create().stackPointer).toBe('number');
});

test('has a stack of 16 16-bit values', () => {
    expect(Chip8.create().stack).toHaveLength(16);
});

test('loadProgram copies program in ram', () => {
    const chip8 = Chip8.create();
    chip8.loadProgram(IBMLogoProgram);
    const ram = chip8.ram.subarray(chip8.programStart, chip8.programStart + IBMLogoProgram.length);
    expect(ram).toEqual(IBMLogoProgram);
});

test('loadProgram() set PC to programStart', () => {
    const chip8 = Chip8.create();
    chip8.loadProgram(IBMLogoProgram);
    expect(chip8.programCounter).toBe(chip8.programStart);
});

test('loadProgram() set SP to 0', () => {
    const chip8 = Chip8.create();
    chip8.loadProgram(IBMLogoProgram);
    expect(chip8.stackPointer).toBe(0);
});

test('execute throws Chip8Exception when fetching unknown instruction 0x0', () => {
    const prog = Uint8Array.from([0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);

    expect(() => { chip8.execute(); }).toThrow(Chip8Exception);
});

test('execute throws Chip8Exception when fetching unknown instruction 0x8', () => {
    const prog = Uint8Array.from([0x80, 0x08]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);

    expect(() => { chip8.execute(); }).toThrow(Chip8Exception);
});

test('execute throws Chip8Exception when fetching unknown instruction 0xE', () => {
    const prog = Uint8Array.from([0xE0, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);

    expect(() => { chip8.execute(); }).toThrow(Chip8Exception);
});

test('execute throws Chip8Exception when fetching unknown instruction 0xF', () => {
    const prog = Uint8Array.from([0xF0, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);

    expect(() => { chip8.execute(); }).toThrow(Chip8Exception);
});

test('instruction 00E0 CLS', () => {
    const prog = Uint8Array.from([0x00, 0xE0]);
    const clear = jest.fn();
    const chip8 = Chip8.create();
    chip8.setScreen({
        clear: clear,
    });
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(clear).toHaveBeenCalledTimes(1);
});

test('instruction 00EE RET', () => {
    const prog = Uint8Array.from([0x00, 0xEE, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousSP = chip8.stackPointer;
    chip8.stack[++chip8.stackPointer] = 0x204;
    chip8.execute();

    expect(chip8.stackPointer).toBe(previousSP);
    expect(chip8.programCounter).toBe(0x204);
});

test('instruction 1nnn JP addr', () => {
    const prog = Uint8Array.from([0x12, 0x04, 0x00, 0x00, 0x00, 0xE0]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.execute();

    expect(chip8.programCounter).toBe(0x204);
});

test('instruction 2nnn CALL addr', () => {
    const prog = Uint8Array.from([0x22, 0x04, 0x00, 0x00, 0x00, 0xE0]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.stack[chip8.stackPointer]).toBe(previousPC + 2);
    expect(chip8.programCounter).toBe(0x204);
});

test('instruction 3xnn Skip next instruction if Vx == nn', () => {
    const prog = Uint8Array.from([0x30, 0x25, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x0] = 0x25;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction 3xnn does not Skip next instruction if Vx != nn', () => {
    const prog = Uint8Array.from([0x3E, 0x25, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xE] = 0xFF;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction 4xnn Skip next instruction if Vx != nn', () => {
    const prog = Uint8Array.from([0x4C, 0x7F, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xC] = 0x25;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction 4xnn does not Skip next instruction if Vx == nn', () => {
    const prog = Uint8Array.from([0x4A, 0xF1, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xA] = 0xF1;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction 5xy0 Skip next instruction if Vx == Vy', () => {
    const prog = Uint8Array.from([0x50, 0xE0, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x0] = 0x2F;
    chip8.generalRegisters[0xE] = 0x2F;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction 5xy0 does not Skip next instruction if Vx != Vy', () => {
    const prog = Uint8Array.from([0x5A, 0x20, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xA] = 0xF1;
    chip8.generalRegisters[0x2] = 0xF2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});


test('instruction 6xnn LD nn to Vx', () => {
    const prog = Uint8Array.from([0x60, 0xF1]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0]).toBe(0xF1);
});

test('instruction 7xnn ADD nn to Vx', () => {
    const prog = Uint8Array.from([0x71, 0x2F]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[1] = 0x03;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[1]).toBe(0x32);
});

test('instruction 8xy0 LD stores value of Vy in Vx', () => {
    const prog = Uint8Array.from([0x83, 0xB0, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xB] = 0x1F;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xB]).toBe(0x1F);
    expect(chip8.generalRegisters[0x3]).toBe(chip8.generalRegisters[0xB]);
});

test('instruction 8xy1 OR bitwise OR on Vx and Vy, stores the result in Vx', () => {
    const prog = Uint8Array.from([0x81, 0x01, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0b1100_1100;
    const value2 = 0b0110_1110;
    chip8.generalRegisters[0x1] = value1;
    chip8.generalRegisters[0x0] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x1]).toBe(value1 | value2);
});

test('instruction 8xy2 bitwise AND on Vx and Vy, stores the result in Vx', () => {
    const prog = Uint8Array.from([0x8A, 0xC2, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0b1100_1100;
    const value2 = 0b0110_1110;
    chip8.generalRegisters[0xA] = value1;
    chip8.generalRegisters[0xC] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xA]).toBe(value1 & value2);
});

test('instruction 8xy3 bitwise XOR on Vx and Vy, stores the result in Vx', () => {
    const prog = Uint8Array.from([0x8A, 0x93, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0b1100_1100;
    const value2 = 0b0110_1110;
    chip8.generalRegisters[0xA] = value1;
    chip8.generalRegisters[0x9] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xA]).toBe(value1 ^ value2);
});

test('instruction 8xy4 ADD Vx and Vy, stores the result in Vx, VF = carry', () => {
    const prog = Uint8Array.from([0x8A, 0x94, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0x1F;
    const value2 = 0x0F;
    chip8.generalRegisters[0xA] = value1;
    chip8.generalRegisters[0x9] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xA]).toBe(value1 + value2);
    expect(chip8.generalRegisters[0xF]).toBe(0);
});

test('instruction 8xy5 SUB Vy from Vx, stores the result in Vx, if Vx > Vy VF = 1', () => {
    const prog = Uint8Array.from([0x87, 0x85, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0x1F;
    const value2 = 0x0F;
    chip8.generalRegisters[0x7] = value1;
    chip8.generalRegisters[0x8] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x7]).toBe(value1 - value2);
    expect(chip8.generalRegisters[0xF]).toBe(1);
});

test('instruction 8xy5 SUB Vy from Vx, stores the result in Vx, if Vx > Vy VF = 1', () => {
    const prog = Uint8Array.from([0x87, 0x85, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0x1F;
    const value2 = 0x2F;
    chip8.generalRegisters[0x7] = value1;
    chip8.generalRegisters[0x8] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x7]).toBe((value1 - value2) & 0xFF);
    expect(chip8.generalRegisters[0xF]).toBe(0);
});

test('instruction 8xy6 SHR If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2', () => {
    const prog = Uint8Array.from([0x83, 0x06, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value = 0b0100_000;
    chip8.generalRegisters[0x3] = value;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x3]).toBe(value >>> 1);
    expect(chip8.generalRegisters[0xF]).toBe(0);
});

test('instruction 8xy6 SHR If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2', () => {
    const prog = Uint8Array.from([0x83, 0x06, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value = 0b0100_0011;
    chip8.generalRegisters[0x3] = value;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x3]).toBe(value >>> 1);
    expect(chip8.generalRegisters[0xF]).toBe(1);
});

test('instruction 8xy7 SUB Vx from Vy, stores the result in Vx, if Vy > Vx VF = 1', () => {
    const prog = Uint8Array.from([0x87, 0x87, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0x1F;
    const value2 = 0x0F;
    chip8.generalRegisters[0x7] = value1;
    chip8.generalRegisters[0x8] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x7]).toBe((value2 - value1) & 0xFF);
    expect(chip8.generalRegisters[0xF]).toBe(0);
});

test('instruction 8xy7 SUB Vx from Vy, stores the result in Vx, if Vy > Vx VF = 1', () => {
    const prog = Uint8Array.from([0x87, 0x87, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value1 = 0x1F;
    const value2 = 0x2F;
    chip8.generalRegisters[0x7] = value1;
    chip8.generalRegisters[0x8] = value2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x7]).toBe(value2 - value1);
    expect(chip8.generalRegisters[0xF]).toBe(1);
});

test('instruction 8xyE SHL If the most-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is mul by 2', () => {
    const prog = Uint8Array.from([0x83, 0x0E, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value = 0b0100_0000;
    chip8.generalRegisters[0x3] = value;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x3]).toBe(value << 1);
    expect(chip8.generalRegisters[0xF]).toBe(0);
});

test('instruction 8xyE SHL If the most-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is mul by 2', () => {
    const prog = Uint8Array.from([0x83, 0x0E, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const value = 0b1100_0011;
    chip8.generalRegisters[0x3] = value;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x3]).toBe((value << 1) & 0xFF);
    expect(chip8.generalRegisters[0xF]).toBe(1);
});

test('instruction 9xy0 Skip next instruction if Vx != Vy', () => {
    const prog = Uint8Array.from([0x9B, 0xC0, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xB] = 0xF1;
    chip8.generalRegisters[0xC] = 0xF2;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction 9xy0 Skip next instruction if Vx != Vy', () => {
    const prog = Uint8Array.from([0x9B, 0xC0, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xB] = 0xF1;
    chip8.generalRegisters[0xC] = 0xF1;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction Annn LD nnn to I', () => {
    const prog = Uint8Array.from([0xA2, 0x04, 0x00, 0x00, 0x00, 0xE0]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.addressRegister).toBe(0x204);
});

test('instruction Bnnn JP V0, addr: Jump to location nnn + V0', () => {
    const prog = Uint8Array.from([0xB2, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0] = 0x4;
    chip8.execute();

    expect(chip8.programCounter).toBe(0x202 + 0x4);
});

test('instruction Cxnn, RND Vx, byte: random number 0 to 255, ANDed kk. Result stored in Vx', () => {
    const prog = Uint8Array.from([0xC0, 0xFF]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.execute();

    expect(chip8.generalRegisters[0]).toBeLessThanOrEqual(255);
    expect(chip8.generalRegisters[0]).toBeGreaterThanOrEqual(0);
});

test('instruction Cxnn, RND Vx, byte: random number 0 to 255, ANDed kk. Result stored in Vx', () => {
    const prog = Uint8Array.from([0xC0, 0xF]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.execute();

    expect(chip8.generalRegisters[0]).toBeLessThanOrEqual(16);
    expect(chip8.generalRegisters[0]).toBeGreaterThanOrEqual(0);
});

test('instruction Dxyn', () => {
    /**
     * ROM
     * Dxyn with x = 7, y = 8, n = 2
     * Draw a 2-byte sprite at (V7, V8)
     * the sprite bytes start at I = programStart + 2
     * sprite:
     * ----------
     * |****    |
     * |    ****|
     * ----------
     */
    const prog = Uint8Array.from([0xD7, 0x82, 0xF0, 0x0F]);
    const chip8 = Chip8.create();
    const setPixel = jest.fn();
    const getPixel = jest.fn(() => 0);
    chip8.setScreen({
        width: 64,
        height: 32,
        setPixel: setPixel,
        getPixel: getPixel,
    });
    chip8.loadProgram(prog);
    /**
     * set V7 to 28, V8 = 12 for coordinates (28, 12)
     * set I = programStart + 2 to locate sprite bytes
     */
    chip8.generalRegisters[0x7] = 28;
    chip8.generalRegisters[0x8] = 12;
    chip8.addressRegister = chip8.programStart + 2;
    const previousPC = chip8.programCounter;

    chip8.execute();
    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xF]).toBe(0x0);

    expect(setPixel).toHaveBeenCalledTimes(16);

    expect(setPixel).toHaveBeenCalledWith(28, 12, 1);
    expect(setPixel).toHaveBeenCalledWith(29, 12, 1);
    expect(setPixel).toHaveBeenCalledWith(30, 12, 1);
    expect(setPixel).toHaveBeenCalledWith(31, 12, 1);
    expect(setPixel).toHaveBeenCalledWith(32, 12, 0);
    expect(setPixel).toHaveBeenCalledWith(33, 12, 0);
    expect(setPixel).toHaveBeenCalledWith(34, 12, 0);
    expect(setPixel).toHaveBeenCalledWith(35, 12, 0);

    expect(setPixel).toHaveBeenCalledWith(28, 13, 0);
    expect(setPixel).toHaveBeenCalledWith(29, 13, 0);
    expect(setPixel).toHaveBeenCalledWith(30, 13, 0);
    expect(setPixel).toHaveBeenCalledWith(31, 13, 0);
    expect(setPixel).toHaveBeenCalledWith(32, 13, 1);
    expect(setPixel).toHaveBeenCalledWith(33, 13, 1);
    expect(setPixel).toHaveBeenCalledWith(34, 13, 1);
    expect(setPixel).toHaveBeenCalledWith(35, 13, 1);
});

test('instruction Dxyn x and y must be modulo of the width and height', () => {
    /**
     * ROM
     * Dxyn with x = 7, y = 8, n = 1
     * Draw a 7-byte sprite at (V7, V8)
     * the sprite bytes are located at I = programStart + 2
     * sprite:
     * ----------
     * |****    |
     * ----------
     */
    const rom = Uint8Array.from([0xD7, 0x81, 0xF0, 0x0F]);
    const chip8 = Chip8.create();
    const setPixel = jest.fn();
    const getPixel = jest.fn(() => 0);
    chip8.setScreen({
        width: 64,
        height: 32,
        setPixel: setPixel,
        getPixel: getPixel,
    });
    chip8.loadProgram(rom);
    /**
     * set V7 to 64, V8 = 34 for coordinates (64, 34) --> (0, 2)
     * set I = programStart + 2 to locate sprite bytes
     */
    chip8.generalRegisters[0x7] = 64;
    chip8.generalRegisters[0x8] = 34;
    chip8.addressRegister = chip8.programStart + 2;
    const previousPC = chip8.programCounter;

    chip8.execute();
    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xF]).toBe(0x0);

    expect(setPixel).toHaveBeenCalledTimes(8);

    expect(setPixel).toHaveBeenCalledWith(0, 2, 1);
    expect(setPixel).toHaveBeenCalledWith(1, 2, 1);
    expect(setPixel).toHaveBeenCalledWith(2, 2, 1);
    expect(setPixel).toHaveBeenCalledWith(3, 2, 1);
    expect(setPixel).toHaveBeenCalledWith(4, 2, 0);
    expect(setPixel).toHaveBeenCalledWith(5, 2, 0);
    expect(setPixel).toHaveBeenCalledWith(6, 2, 0);
    expect(setPixel).toHaveBeenCalledWith(7, 2, 0);
});

test('instruction Dxyn with already set pixels', () => {
    /**
     * ROM
     * Dxyn with x = 0, y = 5, n = 1
     * Draw a 7-byte sprite at (V0, V5)
     * the sprite bytes are located at I = programStart + 4
     * sprite:
     * ----------
     * |    ****|
     * ----------
     */
    const prog = Uint8Array.from([0xD0, 0x51, 0xF0, 0x0F, 0x0F]);
    const setPixel = jest.fn();
    /* pixels (2, 1) and (6, 1) are already set on the screen */
    const getPixel = jest.fn((x, y) => {
        if ((x === 2 || x === 6) && (y === 1)) return 1;
        return 0;
    });
    const chip8 = Chip8.create();
    chip8.setScreen({
        width: 64,
        height: 32,
        setPixel: setPixel,
        getPixel: getPixel,
    });
    chip8.loadProgram(prog);
    /**
     * set V0 to 1, V5 to 1 for coordinates (1, 1)
     * set I = programStart + 4 to locate sprite bytes
     */
    chip8.generalRegisters[0x0] = 1;
    chip8.generalRegisters[0x5] = 1;
    chip8.addressRegister = chip8.programStart + 4;
    const previousPC = chip8.programCounter;

    chip8.execute();
    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0xF]).toBe(0x1);

    expect(setPixel).toHaveBeenCalledTimes(8);
    expect(getPixel).toHaveBeenCalledTimes(8);

    expect(setPixel).toHaveBeenCalledWith(1, 1, 0);
    expect(setPixel).toHaveBeenCalledWith(2, 1, 1);
    expect(setPixel).toHaveBeenCalledWith(3, 1, 0);
    expect(setPixel).toHaveBeenCalledWith(4, 1, 0);
    expect(setPixel).toHaveBeenCalledWith(5, 1, 1);
    expect(setPixel).toHaveBeenCalledWith(6, 1, 0);
    expect(setPixel).toHaveBeenCalledWith(7, 1, 1);
    expect(setPixel).toHaveBeenCalledWith(8, 1, 1);
});

test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
    const prog = Uint8Array.from([0xE1, 0x9E]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    const key = 0x0;
    chip8.generalRegisters[0x1] = key;
    chip8.pressKey(key);
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
    const prog = Uint8Array.from([0xE3, 0x9E]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    const key = 0xF;
    chip8.generalRegisters[0x3] = key;
    chip8.pressKey(key);
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction Ex9E - SKP Vx: Skip next instruction if key with the value of Vx is pressed', () => {
    const prog = Uint8Array.from([0xE7, 0x9E]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    const key = 0xF;
    chip8.generalRegisters[0x7] = key;
    chip8.pressKey(key);
    chip8.releaseKey(key);
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction ExA1 - SKNP Vx: Skip next instruction if key with the value of Vx is not pressed', () => {
    const prog = Uint8Array.from([0xEB, 0xA1]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    const key = 0x9;
    chip8.generalRegisters[0xB] = key;
    chip8.pressKey(key);
    chip8.releaseKey(key);
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 4);
});

test('instruction ExA1 - SKNP Vx: Skip next instruction if key with the value of Vx is not pressed', () => {
    const prog = Uint8Array.from([0xEE, 0xA1]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    const key = 0x9;
    chip8.generalRegisters[0xE] = key;
    chip8.pressKey(key);
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction Fx07 - LD Vx, DT: Set Vx = delay timer value', () => {
    const prog = Uint8Array.from([0xF6, 0x07]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.delayTimer = 0x1F;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.generalRegisters[0x6]).toBe(0x1F);
});

test('instruction Fx0A - LD Vx, K: Wait for a key press, store the value of the key in Vx', () => {
    const prog = Uint8Array.from([0xF8, 0x0A]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    const previousPC = chip8.programCounter;
    chip8.execute();
    expect(chip8.waitingKey).toBe(true);

    const key = 0xA;
    chip8.pressKey(key);

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.waitingKey).toBe(false);
    expect(chip8.generalRegisters[0x8]).toBe(key);
});

test('instruction Fx15 - LD DT, Vx: Set delay timer = Vx', () => {
    const prog = Uint8Array.from([0xF6, 0x15]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x6] = 0x1F;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.delayTimer).toBe(0x1F);
});

test('instruction Fx18 - LD ST, Vx: Set sound timer = Vx', () => {
    const prog = Uint8Array.from([0xF6, 0x18]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x6] = 0x1F;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.soundTimer).toBe(0x1F);
});

test('instruction Fx1E - ADD I, Vx: Set I = I + Vx', () => {
    const prog = Uint8Array.from([0xF7, 0x1E]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x7] = 0x1F;
    chip8.addressRegister = 0x20;
    const previousPC = chip8.programCounter;
    chip8.execute();

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(chip8.addressRegister).toBe(0x1F + 0x20);
});

test('instruction Fx29 - LD F, Vx: Set I = location of sprite for digit Vx', () => {
    const prog = Uint8Array.from([0xF9, 0x29]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x9] = 0x0;
    const previousPC = chip8.programCounter;
    chip8.execute();

    const sprite = Uint8Array.from([
        0b11110000,
        0b10010000,
        0b10010000,
        0b10010000,
        0b11110000,
    ]);
    const ram = chip8.ram.subarray(chip8.addressRegister, chip8.addressRegister + sprite.length);

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(ram).toEqual(sprite);
});

test('instruction Fx29 - LD F, Vx: Set I = location of sprite for digit Vx', () => {
    const prog = Uint8Array.from([0xF9, 0x29]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0x9] = 0xF;
    const previousPC = chip8.programCounter;
    chip8.execute();

    const sprite = Uint8Array.from([
        0b11110000,
        0b10000000,
        0b11110000,
        0b10000000,
        0b10000000,
    ]);
    const ram = chip8.ram.subarray(chip8.addressRegister, chip8.addressRegister + sprite.length);

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(ram).toEqual(sprite);
});

test('instruction Fx33 - LD B, Vx: Store BCD representation of Vx in memory locations I, I+1, and I+2', () => {
    const prog = Uint8Array.from([0xFE, 0x33]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.generalRegisters[0xE] = 123;
    chip8.addressRegister = 0x204;
    const previousPC = chip8.programCounter;
    chip8.execute();

    const bcd = Uint8Array.from([1, 2, 3]);
    const ram = chip8.ram.subarray(0x204, 0x204 + bcd.length);

    expect(chip8.programCounter).toBe(previousPC + 2);
    expect(ram).toEqual(bcd);
});

test('instruction Fx55 - LD [I], Vx, Vx: Store registers V0 through Vx in memory starting at location I', () => {
    const prog = Uint8Array.from([0xFF, 0x55]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.addressRegister = 0x204;
    chip8.generalRegisters[0x0] = 0xF0;
    chip8.generalRegisters[0x1] = 0xF1;
    chip8.generalRegisters[0x2] = 0xF2;
    chip8.generalRegisters[0x3] = 0xF3;
    chip8.generalRegisters[0x4] = 0xF4;
    chip8.generalRegisters[0x5] = 0xF5;
    chip8.generalRegisters[0x6] = 0xF6;
    chip8.generalRegisters[0x7] = 0xF7;
    chip8.generalRegisters[0x8] = 0xF8;
    chip8.generalRegisters[0x9] = 0xF9;
    chip8.generalRegisters[0xA] = 0xFA;
    chip8.generalRegisters[0xB] = 0xFB;
    chip8.generalRegisters[0xC] = 0xFC;
    chip8.generalRegisters[0xD] = 0xFD;
    chip8.generalRegisters[0xE] = 0xFE;
    chip8.generalRegisters[0xF] = 0xFF;
    const previousPC = chip8.programCounter;
    chip8.execute();

    const ram = chip8.ram.subarray(0x204, 0x204 + 16);
    expect(ram).toEqual(chip8.generalRegisters);
    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('instruction Fx65 - LD Vx, [I]: Read registers V0 through Vx from memory starting at location I', () => {
    const prog = Uint8Array.from([0xFF, 0x65, 0x00, 0x00, 0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
        0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF]);
    const chip8 = Chip8.create();
    chip8.loadProgram(prog);
    chip8.addressRegister = 0x204;
    const previousPC = chip8.programCounter;
    chip8.execute();

    const ram = prog.subarray(4, 4 + 16);
    expect(chip8.generalRegisters).toEqual(ram);
    expect(chip8.programCounter).toBe(previousPC + 2);
});

test('run', () => {

});

