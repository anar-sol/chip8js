import { Registers } from "../src/registers";

describe("Registers", () => {
    const BYTE_VALUE = 127;
    const DOUBLE_BYTE_VALUE = 32767;
    const BYTE_ARRAY = new Uint8Array([64, 127, 255]);

    let registers;

    beforeEach(() => {
        registers = Registers.newRegisters();
    });

    test("write and read general register V0", () => {
        registers.write(Registers.V0, BYTE_VALUE);
        expect(registers.read(Registers.V0)).toBe(BYTE_VALUE);
    });

    test("write and read general register V1", () => {
        registers.write(Registers.V1, BYTE_VALUE);
        expect(registers.read(Registers.V1)).toBe(BYTE_VALUE);
    });

    test("write and read general register V2", () => {
        registers.write(Registers.V2, BYTE_VALUE);
        expect(registers.read(Registers.V2)).toBe(BYTE_VALUE);
    });

    test("write and read general register V3", () => {
        registers.write(Registers.V3, BYTE_VALUE);
        expect(registers.read(Registers.V3)).toBe(BYTE_VALUE);
    });

    test("write and read general register V4", () => {
        registers.write(Registers.V4, BYTE_VALUE);
        expect(registers.read(Registers.V4)).toBe(BYTE_VALUE);
    });

    test("write and read general register V5", () => {
        registers.write(Registers.V5, BYTE_VALUE);
        expect(registers.read(Registers.V5)).toBe(BYTE_VALUE);
    });

    test("write and read general register V6", () => {
        registers.write(Registers.V6, BYTE_VALUE);
        expect(registers.read(Registers.V6)).toBe(BYTE_VALUE);
    });

    test("write and read general register V7", () => {
        registers.write(Registers.V7, BYTE_VALUE);
        expect(registers.read(Registers.V7)).toBe(BYTE_VALUE);
    });

    test("write and read general register V8", () => {
        registers.write(Registers.V8, BYTE_VALUE);
        expect(registers.read(Registers.V8)).toBe(BYTE_VALUE);
    });

    test("write and read general register V9", () => {
        registers.write(Registers.V9, BYTE_VALUE);
        expect(registers.read(Registers.V9)).toBe(BYTE_VALUE);
    });

    test("write and read general register VA", () => {
        registers.write(Registers.VA, BYTE_VALUE);
        expect(registers.read(Registers.VA)).toBe(BYTE_VALUE);
    });

    test("write and read general register VB", () => {
        registers.write(Registers.VB, BYTE_VALUE);
        expect(registers.read(Registers.VB)).toBe(BYTE_VALUE);
    });

    test("write and read general register VC", () => {
        registers.write(Registers.VC, BYTE_VALUE);
        expect(registers.read(Registers.VC)).toBe(BYTE_VALUE);
    });

    test("write and read general register VD", () => {
        registers.write(Registers.VD, BYTE_VALUE);
        expect(registers.read(Registers.VD)).toBe(BYTE_VALUE);
    });

    test("write and read general register VE", () => {
        registers.write(Registers.VE, BYTE_VALUE);
        expect(registers.read(Registers.VE)).toBe(BYTE_VALUE);
    });

    test("write and read general register VF", () => {
        registers.write(Registers.VF, BYTE_VALUE);
        expect(registers.read(Registers.VF)).toBe(BYTE_VALUE);
    });

    test("write and read a range of general registers", () => {
        registers.writeRange(Registers.V0, BYTE_ARRAY);
        expect(registers.readRange(Registers.V0, BYTE_ARRAY.length)).toEqual(BYTE_ARRAY);
    });

    test("write and read delay register", () => {
        registers.write(Registers.DELAY, BYTE_VALUE);
        expect(registers.read(Registers.DELAY)).toBe(BYTE_VALUE);
    });

    test("write and read sound register", () => {
        registers.write(Registers.SOUND, BYTE_VALUE);
        expect(registers.read(Registers.SOUND)).toBe(BYTE_VALUE);
    });

    test("write and read stack pointer register", () => {
        registers.write(Registers.SP, BYTE_VALUE);
        expect(registers.read(Registers.SP)).toBe(BYTE_VALUE);
    });

    test("write and read address register", () => {
        registers.write(Registers.I, DOUBLE_BYTE_VALUE);
        expect(registers.read(Registers.I)).toBe(DOUBLE_BYTE_VALUE);
    });

    test("write and read program counter register", () => {
        registers.write(Registers.PC, DOUBLE_BYTE_VALUE);
        expect(registers.read(Registers.PC)).toBe(DOUBLE_BYTE_VALUE);
    });

});