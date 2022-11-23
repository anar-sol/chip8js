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
import SNE from "../src/instructions/sne-registers.js";
import LDAddress from "../src/instructions/ld-address.js";
import JPRegister from "../src/instructions/jp-register.js";
import RND from "../src/instructions/rnd.js";
import DRW from "../src/instructions/drw.js";
import SKP from "../src/instructions/skp.js";
import SKNP from "../src/instructions/sknp.js";
import LDDelay from "../src/instructions/ld-delay.js";
import SETDelay from "../src/instructions/set-delay.js";
import SETSound from "../src/instructions/set-sound.js";
import ADDAddress from "../src/instructions/add-address.js";
import BCD from "../src/instructions/bcd.js";
import WriteRange from "../src/instructions/write-range.js";
import ReadRange from "../src/instructions/read-range.js";

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

    test("execute 9xy0 - SNE Vx, Vy, registers instruction", () => {
        const SNE_INSTRUCTION = 0x93F0;
        const REGISTER_X_VALUE = 0x4A;
        const REGISTER_Y_VALUE = 0x4B;
        const CURRENT_PC = 0x200;
        const instruction = new SNE(SNE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V3: return REGISTER_X_VALUE;
                        case Registers.VF: return REGISTER_Y_VALUE;
                        case Registers.PC: return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute 9xy0 - SNE Vx, Vy, registers instruction (equal)", () => {
        const SNE_INSTRUCTION = 0x93F0;
        const REGISTER_X_VALUE = 0x4A;
        const REGISTER_Y_VALUE = 0x4A;
        const CURRENT_PC = 0x200;
        const instruction = new SNE(SNE_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.V3: return REGISTER_X_VALUE;
                        case Registers.VF: return REGISTER_Y_VALUE;
                        case Registers.PC: return CURRENT_PC;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute Annn - LD I, addr, instruction", () => {
        const SNE_INSTRUCTION = 0xA923;
        const EXPECTED_VALUE = 0x923;
        const instruction = new LDAddress(SNE_INSTRUCTION);

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.I, EXPECTED_VALUE);
    });

    test("execute Bnnn - JP V0, addr instruction", () => {
        const JP_REGISTER_INSTRUCTION = 0xB400;
        const ADDRESS = 0x400;
        const V0_VALUE = 0x1FF;
        const EXPECTED_VALUE = ADDRESS + V0_VALUE;
        const instruction = new JPRegister(JP_REGISTER_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(() => V0_VALUE),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V0);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, EXPECTED_VALUE);
    });

    test("execute Cxkk - RND Vx, byte instruction", () => {
        const RND_INSTRUCTION = 0xC8FF;
        const instruction = new RND(RND_INSTRUCTION);

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V8, expect.any(Number));

        expect(chip8.registers.write.mock.calls[0][1]).toBeGreaterThanOrEqual(0);
        expect(chip8.registers.write.mock.calls[0][1]).toBeLessThanOrEqual(0xFF);
    });

    test("execute Cxkk - RND Vx, byte instruction (0x0F mask)", () => {
        const RND_INSTRUCTION = 0xC80F;
        const instruction = new RND(RND_INSTRUCTION);

        const chip8 = {
            registers: {
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V8, expect.any(Number));

        expect(chip8.registers.write.mock.calls[0][1]).toBeGreaterThanOrEqual(0);
        expect(chip8.registers.write.mock.calls[0][1]).toBeLessThanOrEqual(0xF);
    });

    test("execute Dxyn - DRW Vx, Vy, nibble instruction", () => {
        /**
         * Dxyn with x = 7, y = 8, n = 2
         * Draw a 2-byte sprite at (V7, V8)
         * the sprite bytes start at I = 0x202
         * sprite:
         * ----------
         * |****    |
         * |    ****|
         * ----------
         */
        /**
         * set V7 to 28, V8 = 12 for coordinates (28, 12)
         * set I = 0x202 to locate sprite bytes
         */
        const DRW_INSTRUCTION = 0xD782;
        const REGISTER_X_VALUE = 28;
        const REGISTER_Y_VALUE = 12;
        const ADDRESS = 0x202;
        const instruction = new DRW(DRW_INSTRUCTION);

        const chip8 = {
            screen: {
                width: 64,
                height: 32,
                getPixel: jest.fn(() => 0),
                setPixel: jest.fn(),
            },
            ram: {
                readRange: jest.fn(() => Uint8Array.from([0xF0, 0x0F]) ),
            },
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.I: return ADDRESS;
                        case Registers.V7: return REGISTER_X_VALUE;
                        case Registers.V8: return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V7);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V8);
        expect(chip8.ram.readRange).toHaveBeenCalledWith(ADDRESS, 2);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, 0);

        expect(chip8.screen.setPixel).toHaveBeenCalledTimes(16);

        expect(chip8.screen.setPixel).toHaveBeenCalledWith(28, 12, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(29, 12, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(30, 12, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(31, 12, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(32, 12, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(33, 12, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(34, 12, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(35, 12, 0);

        expect(chip8.screen.setPixel).toHaveBeenCalledWith(28, 13, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(29, 13, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(30, 13, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(31, 13, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(32, 13, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(33, 13, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(34, 13, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(35, 13, 1);
    });

    test("execute Dxyn - DRW Vx, Vy, nibble instruction (x and y must be modulo of the width and height)", () => {
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
        /**
         * set V7 to 64, V8 = 34 for coordinates (64, 34) --> (0, 2)
         * set I = programStartAddress + 2 to locate sprite bytes
         */
        const DRW_INSTRUCTION = 0xD781;
        const REGISTER_X_VALUE = 64;
        const REGISTER_Y_VALUE = 34;
        const ADDRESS = 0x202;
        const instruction = new DRW(DRW_INSTRUCTION);

        const chip8 = {
            screen: {
                width: 64,
                height: 32,
                getPixel: jest.fn(() => 0),
                setPixel: jest.fn(),
            },
            ram: {
                readRange: jest.fn(() => Uint8Array.from([0xF0]) ),
            },
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.I: return ADDRESS;
                        case Registers.V7: return REGISTER_X_VALUE;
                        case Registers.V8: return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V7);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V8);
        expect(chip8.ram.readRange).toHaveBeenCalledWith(ADDRESS, 1);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.VF, 0);

        expect(chip8.screen.setPixel).toHaveBeenCalledTimes(8);

        expect(chip8.screen.setPixel).toHaveBeenCalledWith(0, 2, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(1, 2, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(2, 2, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(3, 2, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(4, 2, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(5, 2, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(6, 2, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(7, 2, 0);
    });

    test("execute Dxyn - DRW Vx, Vy, nibble instruction (with already set pixels)", () => {
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
        /**
         * set V0 to 1, V5 to 1 for coordinates (1, 1)
         * set I = programStartAddress + 4 to locate sprite bytes
         */
        const DRW_INSTRUCTION = 0xD051;
        const REGISTER_X_VALUE = 1;
        const REGISTER_Y_VALUE = 1;
        const ADDRESS = 0x204;
        const instruction = new DRW(DRW_INSTRUCTION);

        const chip8 = {
            screen: {
                width: 64,
                height: 32,
                getPixel: jest.fn((x, y) => (x === 2 || x === 6) && (y === 1)),
                setPixel: jest.fn(),
            },
            ram: {
                readRange: jest.fn(() => Uint8Array.from([0x0F]) ),
            },
            registers: {
                read: jest.fn((register) => {
                    switch (register) {
                        case Registers.I: return ADDRESS;
                        case Registers.V0: return REGISTER_X_VALUE;
                        case Registers.V5: return REGISTER_Y_VALUE;
                    }
                }),
                write: jest.fn(),
            },
        };

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V0);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.V5);
        expect(chip8.ram.readRange).toHaveBeenCalledWith(ADDRESS, 1);

        expect(chip8.registers.write).toHaveBeenLastCalledWith(Registers.VF, 1);

        expect(chip8.screen.setPixel).toHaveBeenCalledTimes(8);

        expect(chip8.screen.setPixel).toHaveBeenCalledWith(1, 1, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(2, 1, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(3, 1, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(4, 1, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(5, 1, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(6, 1, 0);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(7, 1, 1);
        expect(chip8.screen.setPixel).toHaveBeenCalledWith(8, 1, 1);
    });

    test("execute Ex9E - SKP Vx instruction", () => {
        const SKP_INSTRUCTION = 0xEB9E;
        const REGISTER_X_VALUE = 0;
        const CURRENT_PC = 0x300;
        const instruction = new SKP(SKP_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.PC: return CURRENT_PC;
                        case Registers.VB: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            },
            keyboard: {
                isPressed: jest.fn(() => true),
            }
        }

        instruction.execute(chip8);

        expect(chip8.keyboard.isPressed).toHaveBeenCalledWith(REGISTER_X_VALUE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute Ex9E - SKP Vx instruction", () => {
        const SKP_INSTRUCTION = 0xE29E;
        const REGISTER_X_VALUE = 0xF;
        const CURRENT_PC = 0x3FB;
        const instruction = new SKP(SKP_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.PC: return CURRENT_PC;
                        case Registers.V2: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            },
            keyboard: {
                isPressed: jest.fn(() => true),
            }
        }

        instruction.execute(chip8);

        expect(chip8.keyboard.isPressed).toHaveBeenCalledWith(REGISTER_X_VALUE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute Ex9E - SKP Vx instruction (not pressed)", () => {
        const SKP_INSTRUCTION = 0xE29E;
        const REGISTER_X_VALUE = 0xF;
        const CURRENT_PC = 0x3FB;
        const instruction = new SKP(SKP_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.PC: return CURRENT_PC;
                        case Registers.V2: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            },
            keyboard: {
                isPressed: jest.fn(() => false),
            }
        }

        instruction.execute(chip8);

        expect(chip8.keyboard.isPressed).toHaveBeenCalledWith(REGISTER_X_VALUE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute ExA1 - SKNP Vx instruction", () => {
        const SKNP_INSTRUCTION = 0xE8A1;
        const REGISTER_X_VALUE = 0xA;
        const CURRENT_PC = 0x411;
        const instruction = new SKNP(SKNP_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.PC: return CURRENT_PC;
                        case Registers.V8: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            },
            keyboard: {
                isPressed: jest.fn(() => false),
            }
        }

        instruction.execute(chip8);

        expect(chip8.keyboard.isPressed).toHaveBeenCalledWith(REGISTER_X_VALUE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.PC, CURRENT_PC + 2);
    });

    test("execute ExA1 - SKNP Vx instruction (pressed)", () => {
        const SKNP_INSTRUCTION = 0xE8A1;
        const REGISTER_X_VALUE = 0x7;
        const CURRENT_PC = 0x411;
        const instruction = new SKNP(SKNP_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.PC: return CURRENT_PC;
                        case Registers.V8: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            },
            keyboard: {
                isPressed: jest.fn(() => true),
            }
        }

        instruction.execute(chip8);

        expect(chip8.keyboard.isPressed).toHaveBeenCalledWith(REGISTER_X_VALUE);

        expect(chip8.registers.write).toHaveBeenCalledTimes(0);
    });

    test("execute Fx07 - LD Vx, DT instruction", () => {
        const LD_DELAY_INSTRUCTION = 0xF407;
        const DELAY_VALUE = 0x1F;
        const instruction = new LDDelay(LD_DELAY_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.DELAY: return DELAY_VALUE;
                    }
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.V4, DELAY_VALUE);
    });

    test.todo("Fx0A - LD Vx, K");

    test("execute Fx15 - LD DT, Vx instruction", () => {
        const SET_DELAY_INSTRUCTION = 0xF815;
        const REGISTER_X_VALUE = 0x2B;
        const instruction = new SETDelay(SET_DELAY_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.V8: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.DELAY, REGISTER_X_VALUE);
    });

    test("execute Fx18 - LD ST, Vx instruction", () => {
        const SET_SOUND_INSTRUCTION = 0xF815;
        const REGISTER_X_VALUE = 0x2B;
        const instruction = new SETSound(SET_SOUND_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.V8: return REGISTER_X_VALUE;
                    }
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.SOUND, REGISTER_X_VALUE);
    });

    test("execute Fx1E - ADD I, Vx instruction", () => {
        const ADD_ADDRESS_INSTRUCTION = 0xFC1E;
        const REGISTER_X_VALUE = 0x11;
        const CURRENT_I = 0x200;
        const EXPECTED_RESULT = REGISTER_X_VALUE + CURRENT_I;
        const instruction = new ADDAddress(ADD_ADDRESS_INSTRUCTION);

        const chip8 = {
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.VC: return REGISTER_X_VALUE;
                        case Registers.I: return CURRENT_I;
                    }
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.write).toHaveBeenCalledTimes(1);
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.I, EXPECTED_RESULT);
    });

    test.todo("Fx29 - LD F, Vx");

    test("Fx33 - LD B, Vx", () => {
        const BCD_INSTRUCTION = 0xFC33;
        const REGISTER_X_VALUE = 123;
        const REGISTER_I_VALUE = 0x400;

        const instruction = new BCD(BCD_INSTRUCTION);

        const chip8 = {
            ram: {
                writeRange: jest.fn(),
            },
            registers: {
                read: jest.fn(register => {
                    switch (register) {
                        case Registers.I: return REGISTER_I_VALUE;
                        case Registers.VC: return REGISTER_X_VALUE;
                    }
                }),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.VC);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);

        expect(chip8.ram.writeRange).toHaveBeenCalledWith(REGISTER_I_VALUE, [3, 2, 1]);
    });

    test("execute Fx55 - LD I, Vx instruction", () => {
        const WRITE_RANGE_INSTRUCTION = 0xFF55;
        const REGISTER_X = 0xF;
        const REGISTER_I_VALUE = 0x400;

        const instruction = new WriteRange(WRITE_RANGE_INSTRUCTION);

        const chip8 = {
            ram: {
                writeRange: jest.fn(),
            },
            registers: {
                readRange: jest.fn(() => {
                    return Uint8Array.from([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xFA , 0xFB , 0x1C , 0x1D, 0x1E ,0x1F]);
                }),
                read: jest.fn(() => {
                    return REGISTER_I_VALUE;
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.readRange).toHaveBeenCalledWith(Registers.V0, REGISTER_X + 1);
        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);

        expect(chip8.ram.writeRange).toHaveBeenCalledWith(REGISTER_I_VALUE, chip8.registers.readRange());
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.I, REGISTER_I_VALUE + REGISTER_X + 1);
    });

    test("execute Fx65 - LD Vx, I instruction", () => {
        const READ_RANGE_INSTRUCTION = 0xFF65;
        const REGISTER_X = 0xF;
        const REGISTER_I_VALUE = 0x400;

        const instruction = new ReadRange(READ_RANGE_INSTRUCTION);

        const chip8 = {
            ram: {
                readRange: jest.fn(() => {
                    return Uint8Array.from([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xFA , 0xFB , 0x1C , 0x1D, 0x1E ,0x1F]);
                }),
            },
            registers: {
                writeRange: jest.fn(),
                read: jest.fn(() => {
                    return REGISTER_I_VALUE;
                }),
                write: jest.fn(),
            }
        }

        instruction.execute(chip8);

        expect(chip8.registers.read).toHaveBeenCalledWith(Registers.I);
        expect(chip8.ram.readRange).toHaveBeenCalledWith(REGISTER_I_VALUE, REGISTER_X + 1);

        expect(chip8.registers.writeRange).toHaveBeenCalledWith(Registers.V0, chip8.ram.readRange());
        expect(chip8.registers.write).toHaveBeenCalledWith(Registers.I, REGISTER_I_VALUE + REGISTER_X + 1);
    });
});
