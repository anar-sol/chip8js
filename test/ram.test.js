import { RAM, RAMException } from '../src/ram.js';

describe("RAM", () => {

    const RAM_SIZE = 4096;
    const NEGATIVE_ADDRESS = -1;
    const FIRST_ADDRESS = 0;
    const MIDDLE_ADDRESS = Math.trunc(RAM_SIZE / 2);
    const LAST_ADDRESS = RAM_SIZE - 1;
    const OVERFLOW_ADDRESS = RAM_SIZE;
    const BYTE_VALUE = 127;
    const BYTE_ARRAY = new Uint8Array([64, 127, 255]);
    const DOUBLE_BYTE_VALUE = (BYTE_ARRAY[0] << 8) | BYTE_ARRAY[1];
    let ram;

    beforeEach(() => {
        ram = RAM.newRAM(RAM_SIZE);
    });

    test("write and read byte value", () => {
        ram.writeByte(MIDDLE_ADDRESS, BYTE_VALUE);
        expect(ram.readByte(MIDDLE_ADDRESS)).toBe(BYTE_VALUE);
    });

    test("write and read first address byte value", () => {
        ram.writeByte(FIRST_ADDRESS, BYTE_VALUE);
        expect(ram.readByte(FIRST_ADDRESS)).toBe(BYTE_VALUE);
    });

    test("write and read last address byte value", () => {
        ram.writeByte(LAST_ADDRESS, BYTE_VALUE);
        expect(ram.readByte(LAST_ADDRESS)).toBe(BYTE_VALUE);
    });

    test("write a negative out of bound address", () => {
        expect(() => { ram.writeByte(NEGATIVE_ADDRESS, BYTE_VALUE); }).toThrow(RAMException);
        try {
            ram.writeByte(NEGATIVE_ADDRESS, BYTE_VALUE);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${NEGATIVE_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("write a positive out of bound address", () => {
        expect(() => { ram.writeByte(OVERFLOW_ADDRESS, BYTE_VALUE); }).toThrow(RAMException);
        try {
            ram.writeByte(OVERFLOW_ADDRESS, BYTE_VALUE);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${OVERFLOW_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read a negative out of bound address", () => {
        expect(() => { ram.readByte(NEGATIVE_ADDRESS); }).toThrow(RAMException);
        try {
            ram.readByte(NEGATIVE_ADDRESS);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${NEGATIVE_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read a positive out of bound address", () => {
        expect(() => { ram.readByte(OVERFLOW_ADDRESS); }).toThrow(RAMException);
        try {
            ram.readByte(OVERFLOW_ADDRESS);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${OVERFLOW_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("write and read a range of bytes", () => {
        ram.writeRange(MIDDLE_ADDRESS, BYTE_ARRAY);
        expect(ram.readRange(MIDDLE_ADDRESS, BYTE_ARRAY.length)).toEqual(BYTE_ARRAY);
    });

    test("write and read a range of bytes from the first address", () => {
        ram.writeRange(FIRST_ADDRESS, BYTE_ARRAY);
        expect(ram.readRange(FIRST_ADDRESS, BYTE_ARRAY.length)).toEqual(BYTE_ARRAY);
    });

    test("write and read a range of bytes to the last address", () => {
        const address = RAM_SIZE - BYTE_ARRAY.length;
        ram.writeRange(address, BYTE_ARRAY);
        expect(ram.readRange(address, BYTE_ARRAY.length)).toEqual(BYTE_ARRAY);
    });

    test("write a range with negative out of bound address", () => {
        expect(() => { ram.writeRange(NEGATIVE_ADDRESS, BYTE_ARRAY); }).toThrow(RAMException);
        try {
            ram.writeRange(NEGATIVE_ADDRESS, BYTE_ARRAY);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${NEGATIVE_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("write a range with positive out of bound address", () => {
        expect(() => { ram.writeRange(LAST_ADDRESS, BYTE_ARRAY); }).toThrow(RAMException);
        try {
            ram.writeRange(LAST_ADDRESS, BYTE_ARRAY);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${LAST_ADDRESS + BYTE_ARRAY.length - 1} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read a range with negative out of bound address", () => {
        expect(() => { ram.readRange(NEGATIVE_ADDRESS, BYTE_ARRAY.length); }).toThrow(RAMException);
        try {
            ram.readRange(NEGATIVE_ADDRESS, BYTE_ARRAY.length);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${NEGATIVE_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read a range with positive out of bound address", () => {
        expect(() => { ram.readRange(LAST_ADDRESS, BYTE_ARRAY.length); }).toThrow(RAMException);
        try {
            ram.readRange(LAST_ADDRESS, BYTE_ARRAY.length);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${LAST_ADDRESS + BYTE_ARRAY.length - 1} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read double byte", () => {
        ram.writeRange(MIDDLE_ADDRESS, BYTE_ARRAY);
        expect(ram.readDoubleByte(MIDDLE_ADDRESS)).toBe(DOUBLE_BYTE_VALUE);
    });

    test("read double byte from a negative out of bound address", () => {
        expect(() => { ram.readDoubleByte(NEGATIVE_ADDRESS); }).toThrow(RAMException);
        try {
            ram.readDoubleByte(NEGATIVE_ADDRESS);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${NEGATIVE_ADDRESS} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

    test("read double byte from a positive out of bound address", () => {
        expect(() => { ram.readDoubleByte(LAST_ADDRESS); }).toThrow(RAMException);
        try {
            ram.readDoubleByte(LAST_ADDRESS);
        } catch (exception) {
            expect(exception).toHaveProperty("message", `RAM address ${LAST_ADDRESS + 1} is out of bound`);
            expect(exception).toHaveProperty("name", "RAMException");
        }
    });

});
