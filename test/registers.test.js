import { Registers } from "../src/registers";

describe("Registers", () => {
    const BYTE_VALUE = 127;
    const BYTE_ARRAY = new Uint8Array([64, 127, 255]);

    let registers;

    beforeEach(() => {
        registers = Registers.newRegisters();
    });

    test("write and read general register 0x0", () => {
        const register = 0x0;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x1", () => {
        const register = 0x1;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x2", () => {
        const register = 0x2;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x3", () => {
        const register = 0x3;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x4", () => {
        const register = 0x4;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x5", () => {
        const register = 0x5;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x6", () => {
        const register = 0x6;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x7", () => {
        const register = 0x7;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x8", () => {
        const register = 0x8;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0x9", () => {
        const register = 0x9;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xA", () => {
        const register = 0xA;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xB", () => {
        const register = 0xB;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xC", () => {
        const register = 0xC;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xD", () => {
        const register = 0xD;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xE", () => {
        const register = 0xE;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read general register 0xF", () => {
        const register = 0xF;

        registers.write(register, BYTE_VALUE);
        expect(registers.read(register)).toBe(BYTE_VALUE);
    });

    test("write and read a range of general registers", () => {
        const register = 0x0;

        registers.writeRange(register, BYTE_ARRAY);
        expect(registers.readRange(register, BYTE_ARRAY.length)).toEqual(BYTE_ARRAY);
    });

});