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
import LDRegisters from "../src/instructions/ld-registers.js";
import ORRegisters from "../src/instructions/or-registers.js";
import ANDRegisters from "../src/instructions/and-registers.js";
import XORRegisters from "../src/instructions/xor-registers.js";
import ADDRegisters from "../src/instructions/add-registers.js";
import SUBRegisters from "../src/instructions/sub-registers.js";
import SHR from "../src/instructions/shr.js";
import SUBNRegisters from "../src/instructions/subn-registers.js";
import SHL from "../src/instructions/shl.js";

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

    test("execute 8xy0 - LD Vx, Vy, registers instructions", () => {
        const LD_REGISTERS_INSTRUCTIONS = 0x84B0;
        const REGISTER_Y_VALUE = 0x1F;
        const instruction = new LDRegisters(LD_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn(() => REGISTER_Y_VALUE),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.VB);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V4, REGISTER_Y_VALUE);
    });

    test("execute 8xy1 - OR Vx, Vy, registers instructions", () => {
        const OR_REGISTERS_INSTRUCTIONS = 0x84B1;
        const REGISTER_X_VALUE = 0b1100_1010;
        const REGISTER_Y_VALUE = 0b0101_1100;
        const EXPECTED_RESULT = 0b1101_1110;
        const instruction = new ORRegisters(OR_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V4:
                            return REGISTER_X_VALUE;
                        case Registers.VB:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V4, EXPECTED_RESULT);
    });

    test("execute 8xy2 - AND Vx, Vy, registers instructions", () => {
        const AND_REGISTERS_INSTRUCTIONS = 0x85A2;
        const REGISTER_X_VALUE = 0b1100_1010;
        const REGISTER_Y_VALUE = 0b0101_1100;
        const EXPECTED_RESULT = 0b0100_1000;
        const instruction = new ANDRegisters(AND_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V5:
                            return REGISTER_X_VALUE;
                        case Registers.VA:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V5, EXPECTED_RESULT);
    });

    test("execute 8xy3 - XOR Vx, Vy, registers instructions", () => {
        const XOR_REGISTERS_INSTRUCTIONS = 0x85A3;
        const REGISTER_X_VALUE = 0b1100_1010;
        const REGISTER_Y_VALUE = 0b0101_1100;
        const EXPECTED_RESULT = 0b1001_0110;
        const instruction = new XORRegisters(XOR_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V5:
                            return REGISTER_X_VALUE;
                        case Registers.VA:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V5, EXPECTED_RESULT);
    });

    test("execute 8xy4 - ADD Vx, Vy, registers instructions", () => {
        const ADD_REGISTERS_INSTRUCTIONS = 0x86C4;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0x2E;
        const EXPECTED_RESULT = REGISTER_X_VALUE + REGISTER_Y_VALUE;
        const EXPECTED_FLAG = 0;
        const instruction = new ADDRegisters(ADD_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xy4 - ADD Vx, Vy, registers instructions (overflow)", () => {
        const ADD_REGISTERS_INSTRUCTIONS = 0x86C4;
        const REGISTER_X_VALUE = 0x1F;
        const REGISTER_Y_VALUE = 0xE2;
        const EXPECTED_RESULT = REGISTER_X_VALUE + REGISTER_Y_VALUE;
        const EXPECTED_FLAG = 1;
        const instruction = new ADDRegisters(ADD_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xy5 - SUB Vx, Vy, registers instructions", () => {
        const SUB_REGISTERS_INSTRUCTIONS = 0x86C5;
        const REGISTER_X_VALUE = 0x2F;
        const REGISTER_Y_VALUE = 0x1E;
        const EXPECTED_RESULT = REGISTER_X_VALUE - REGISTER_Y_VALUE;
        const EXPECTED_FLAG = 1;
        const instruction = new SUBRegisters(SUB_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xy5 - SUB Vx, Vy, registers instructions (underflow)", () => {
        const SUB_REGISTERS_INSTRUCTIONS = 0x86C5;
        const REGISTER_X_VALUE = 0x2F;
        const REGISTER_Y_VALUE = 0x3F;
        const EXPECTED_RESULT = REGISTER_X_VALUE - REGISTER_Y_VALUE;
        const EXPECTED_FLAG = 0;
        const instruction = new SUBRegisters(SUB_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xy6 - SHR Vx, Vy, instruction", () => {
        const SHR_INSTRUCTIONS = 0x82E6;
        const REGISTER_Y_VALUE = 0b1010_1010;
        const EXPECTED_RESULT = 0b0101_0101;
        const LEAST_SIGNIFICANT_BIT = 0;
        const instruction = new SHR(SHR_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn(() => REGISTER_Y_VALUE),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V2, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, LEAST_SIGNIFICANT_BIT);
    });

    test("execute 8xy7 - SUB Vx, Vy, registers instructions", () => {
        const SUB_REGISTERS_INSTRUCTIONS = 0x86C5;
        const REGISTER_X_VALUE = 0x10;
        const REGISTER_Y_VALUE = 0x1E;
        const EXPECTED_RESULT = REGISTER_Y_VALUE - REGISTER_X_VALUE;
        const EXPECTED_FLAG = 1;
        const instruction = new SUBNRegisters(SUB_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xy7 - SUB Vx, Vy, registers instructions (underflow)", () => {
        const SUB_REGISTERS_INSTRUCTIONS = 0x86C5;
        const REGISTER_X_VALUE = 0x2F;
        const REGISTER_Y_VALUE = 0x1E;
        const EXPECTED_RESULT = REGISTER_Y_VALUE - REGISTER_X_VALUE;
        const EXPECTED_FLAG = 0;
        const instruction = new SUBNRegisters(SUB_REGISTERS_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V6:
                            return REGISTER_X_VALUE;
                        case Registers.VC:
                            return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V6, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, EXPECTED_FLAG);
    });

    test("execute 8xyE - SHL Vx, Vy, instruction", () => {
        const SHL_INSTRUCTIONS = 0x82EE;
        const REGISTER_Y_VALUE = 0b1010_1010;
        const EXPECTED_RESULT = 0b1010_10100;
        const MOST_SIGNIFICANT_BIT = 1;
        const instruction = new SHL(SHL_INSTRUCTIONS);

        const chip8 = {
            registers: {
                read: jest.fn(() => REGISTER_Y_VALUE),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.VE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(2);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V2, EXPECTED_RESULT);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, MOST_SIGNIFICANT_BIT);
    });
});
