import InstructionDecoder from "../src/instructions/index.js";

describe("InstructionDecoder", () => {

    console.log(InstructionDecoder);
    
    test("decode 00E0 - CLS instruction", () => {
        const CLS_INSTRUCTION = 0x00E0;

        expect(InstructionDecoder.decode(CLS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
            })
        );
    });

    test("decode 00EE - RET instruction", () => {
        const RET_INSTRUCTION = 0x00EE;

        expect(InstructionDecoder.decode(RET_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
            })
        );
    });

    test("decode 1nnn - JP addr instruction", () => {
        const JP_INSTRUCTION = 0x1FFF;
        const NNN = 0xFFF;

        expect(InstructionDecoder.decode(JP_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                address: NNN,
            })
        );
    });

    test("decode 2nnn - CALL addr instruction", () => {
        const CALL_INSTRUCTION = 0x2111;
        const NNN = 0x111;

        expect(InstructionDecoder.decode(CALL_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                address: NNN,
            })
        );
    });

    test("decode 3xkk - SE Vx, byte instruction", () => {
        const SE_INSTRUCTION = 0x31FF;
        const X = 0x1;
        const KK = 0xFF;

        expect(InstructionDecoder.decode(SE_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                byte: KK
            })
        );
    });

    test("decode 4xkk - SNE Vx, byte instruction", () => {
        const SNE_INSTRUCTION = 0x4F11;
        const X = 0xF;
        const KK = 0x11;

        expect(InstructionDecoder.decode(SNE_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                byte: KK
            })
        );
    });

    test("decode 5xy0 - SE Vx, Vy instruction", () => {
        const SE_REGISTERS_INSTRUCTION = 0x51F0;
        const X = 0x1;
        const Y = 0xF;

        expect(InstructionDecoder.decode(SE_REGISTERS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 6xkk - LD Vx, byte instruction", () => {
        const LD_INSTRUCTION = 0x6F11;
        const X = 0xF;
        const KK = 0x11;

        expect(InstructionDecoder.decode(LD_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                byte: KK
            })
        );
    });

    test("decode 7xkk - ADD Vx, byte instruction", () => {
        const ADD_INSTRUCTION = 0x71FF;
        const X = 0x1;
        const KK = 0xFF;

        expect(InstructionDecoder.decode(ADD_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                byte: KK
            })
        );
    });
    
    test("decode 8xy0 - LD Vx, Vy instruction", () => {
        const LD_REGISTERS_INSTRUCTION = 0x81F0;
        const X = 0x1;
        const Y = 0xF;

        expect(InstructionDecoder.decode(LD_REGISTERS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy1 - OR Vx, Vy instruction", () => {
        const OR_INSTRUCTION = 0x8F11;
        const X = 0xF;
        const Y = 0x1;

        expect(InstructionDecoder.decode(OR_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy2 - AND Vx, Vy instruction", () => {
        const AND_INSTRUCTION = 0x8F12;
        const X = 0xF;
        const Y = 0x1;

        expect(InstructionDecoder.decode(AND_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy3 - XOR Vx, Vy instruction", () => {
        const XOR_INSTRUCTION = 0x8F13;
        const X = 0xF;
        const Y = 0x1;

        expect(InstructionDecoder.decode(XOR_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy4 - ADD Vx, Vy instruction", () => {
        const ADD_REGISTERS_INSTRUCTION = 0x8F14;
        const X = 0xF;
        const Y = 0x1;

        expect(InstructionDecoder.decode(ADD_REGISTERS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy5 - SUB Vx, Vy instruction", () => {
        const SUB_REGISTERS_INSTRUCTION = 0x8F15;
        const X = 0xF;
        const Y = 0x1;

        expect(InstructionDecoder.decode(SUB_REGISTERS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y
            })
        );
    });

    test("decode 8xy6 - SHR Vx {, Vy} instruction", () => {
        const SHR_INSTRUCTION = 0x8106;
        const X = 0x1;

        expect(InstructionDecoder.decode(SHR_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
            })
        );
    });

    test("decode 8xy7 - SUBN Vx, Vy instruction", () => {
        const SUBN_INSTRUCTION = 0x8567;
        const X = 0x5;
        const Y = 0x6;

        expect(InstructionDecoder.decode(SUBN_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y,
            })
        );
    });

    test("decode 8xyE - SHL Vx {, Vy} instruction", () => {
        const SHL_INSTRUCTION = 0x856E;
        const X = 0x5;

        expect(InstructionDecoder.decode(SHL_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
            })
        );
    });

    test("decode 9xy0 - SNE Vx, Vy instruction", () => {
        const SHL_REGISTERS_INSTRUCTION = 0x9AE0;
        const X = 0xA;
        const Y = 0xE;

        expect(InstructionDecoder.decode(SHL_REGISTERS_INSTRUCTION)).toEqual(
            expect.objectContaining({
                execute: expect.any(Function),
                registerX: X,
                registerY: Y,
            })
        );
    });
});
