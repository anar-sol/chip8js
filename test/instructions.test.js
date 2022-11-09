import { Registers } from "../src/registers.js";
import CLS from "../src/instructions/cls.js";
import RET from "../src/instructions/ret.js";
import JP from "../src/instructions/jp.js";
import CALL from "../src/instructions/call.js";
import SEByte from "../src/instructions/se-byte.js";
import SNEByte from "../src/instructions/sen-byte.js";
import SERegisters from "../src/instructions/se-registers.js";
import LDByte from "../src/instructions/ld-byte.js";
import ADDByte from "../src/instructions/add-byte.js";

describe("Instructions", () => {

    test("execute 00E0 - CLS instruction", () => {
        const CLS_INSTRUCTION = 0x00E0;
        const instruction = new CLS(CLS_INSTRUCTION);

        const chip8 = {
            screen: {
                clear: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.screen.clear).toHaveBeenCalledTimes(1);
    });

    test("execute 00EE - RET", () => {
        const RET_INSTRUCTION = 0x00EE;
        const instruction = new RET(RET_INSTRUCTION);
        const ADDRESS = 0xFFF;

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
            stack: {
                pop: jest.fn(() => ADDRESS),
            }
        };

        instruction.execute(chip8);

        expect(chip8.stack.pop).toHaveBeenCalledTimes(1);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, ADDRESS);
    });

    test("execute 1nnn - JP addr", () => {
        const JP_INSTRUCTION = 0x1AAA;
        const ADDRESS = 0xAAA;
        const instruction = new JP(JP_INSTRUCTION);

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, ADDRESS);
    });

    test("execute 2nnn - CALL addr", () => {
        const CALL_INSTRUCTION = 0x2BBB;
        const ADDRESS = 0xBBB;
        const CURRENT_PC = 0x111;
        const instruction = new CALL(CALL_INSTRUCTION);


        const chip8 = {
            registers: {
                read: jest.fn(() => CURRENT_PC),
                write: jest.fn(),
            },
            stack: {
                push: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledTimes(1);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.PC);

        expect(chip8.stack.push).toHaveBeenCalledTimes(1);
        expect(chip8.stack.push).toHaveBeenCalledWith(CURRENT_PC);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, ADDRESS);
    });

    test("execute 3xkk - SE Vx, byte instruction (Vx == byte)", () => {
        const SE_INSTRUCTION = 0x30FF;
        const BYTE_VALUE = 0xFF;
        const CURRENT_PC = 0x222;
        const instruction = new SEByte(SE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V0:
                            return BYTE_VALUE;
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V0);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.PC);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute 3xkk - SE Vx, byte instruction (Vx !== byte)", () => {
        const SE_INSTRUCTION = 0x30EE;
        const BYTE_VALUE = 0xEE;
        const CURRENT_PC = 0x333;
        const instruction = new SEByte(SE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V0:
                            return BYTE_VALUE + 1;
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V0);
        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute 4xkk - SNE Vx, byte instruction (Vx !== byte)", () => {
        const SNE_INSTRUCTION = 0x41DD;
        const BYTE_VALUE = 0xDD;
        const CURRENT_PC = 0x333;
        const instruction = new SNEByte(SNE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V1:
                            return BYTE_VALUE + 1;
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V1);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.PC);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute 4xkk - SNE Vx, byte instruction (Vx === byte)", () => {
        const SNE_INSTRUCTION = 0x42CC;
        const BYTE_VALUE = 0xCC;
        const CURRENT_PC = 0x333;
        const instruction = new SNEByte(SNE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V2:
                            return BYTE_VALUE
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V2);
        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute 5xy0 - SE Vx, Vy instruction (Vx == Vy)", () => {
        const SE_REGISTERS_INSTRUCTION = 0x5340;
        const CURRENT_PC = 0x444;
        const REGISTER_X_VALUE = 0x1;
        const REGISTER_Y_VALUE = REGISTER_X_VALUE;
        const instruction = new SERegisters(SE_REGISTERS_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V3:
                            return REGISTER_X_VALUE;
                        case Registers.V4:
                            return REGISTER_Y_VALUE;
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V3);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V4);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.PC);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute 5xy0 - SE Vx, Vy instruction (Vx !== Vy)", () => {
        const SE_REGISTERS_INSTRUCTION = 0x5580;
        const CURRENT_PC = 0x444;
        const REGISTER_X_VALUE = 0x1;
        const REGISTER_Y_VALUE = REGISTER_X_VALUE + 1;
        const instruction = new SERegisters(SE_REGISTERS_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V5:
                            return REGISTER_X_VALUE;
                        case Registers.V8:
                            return REGISTER_Y_VALUE;
                        case Registers.PC:
                            return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V5);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute 6xkk - LD Vx, byte instruction", () => {
        const LD_BYTE_INSTRUCTION = 0x6681;
        const BYTE_VALUE = 0x81;
        const instruction = new LDByte(LD_BYTE_INSTRUCTION);

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, BYTE_VALUE);
    });

    test("execute 7xkk - ADD Vx, byte instruction", () => {
        const ADD_BYTE_INSTRUCTION = 0x775E;
        const BYTE_VALUE = 0x5E;
        const REGISTER_X_VALUE = 0x5;
        const instruction = new ADDByte(ADD_BYTE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(() => REGISTER_X_VALUE),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V7);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V7, REGISTER_X_VALUE + BYTE_VALUE);
    });
});
