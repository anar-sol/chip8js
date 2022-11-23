import ADDAddress from "../src/instructions/add-address.js";
import ADDByte from "../src/instructions/add-byte.js";
import ADDRegisters from "../src/instructions/add-registers.js";
import ANDRegisters from "../src/instructions/and-registers.js";
import BCD from "../src/instructions/bcd.js";
import CALL from "../src/instructions/call.js";
import CLS from "../src/instructions/cls.js";
import DRW from "../src/instructions/drw.js";
import InstructionDecoder from "../src/instructions/index.js";
import JPRegister from "../src/instructions/jp-register.js";
import JP from "../src/instructions/jp.js";
import LDAddress from "../src/instructions/ld-address.js";
import LDByte from "../src/instructions/ld-byte.js";
import LDDelay from "../src/instructions/ld-delay.js";
import LDRegisters from "../src/instructions/ld-registers.js";
import LDSprite from "../src/instructions/ld-sprite.js";
import ORRegisters from "../src/instructions/or-registers.js";
import ReadRange from "../src/instructions/read-range.js";
import RET from "../src/instructions/ret.js";
import RND from "../src/instructions/rnd.js";
import SEByte from "../src/instructions/se-byte.js";
import SERegisters from "../src/instructions/se-registers.js";
import SNEByte from "../src/instructions/sen-byte.js";
import SETDelay from "../src/instructions/set-delay.js";
import SETSound from "../src/instructions/set-sound.js";
import SHL from "../src/instructions/shl.js";
import SHR from "../src/instructions/shr.js";
import SKNP from "../src/instructions/sknp.js";
import SKP from "../src/instructions/skp.js";
import SNERegisters from "../src/instructions/sne-registers.js";
import SUBRegisters from "../src/instructions/sub-registers.js";
import SUBNRegisters from "../src/instructions/subn-registers.js";
import WaitKey from "../src/instructions/wait-key.js";
import WriteRange from "../src/instructions/write-range.js";
import XORRegisters from "../src/instructions/xor-registers.js";

describe("InstructionDecoder", () => {
    
    test("decode 00E0 - CLS instruction", () => {
        const CLS_INSTRUCTION = 0x00E0;

        expect(InstructionDecoder.decode(CLS_INSTRUCTION)).toBeInstanceOf(CLS);
    });

    test("decode 00EE - RET instruction", () => {
        const RET_INSTRUCTION = 0x00EE;

        expect(InstructionDecoder.decode(RET_INSTRUCTION)).toBeInstanceOf(RET);
    });

    test("decode 1nnn - JP addr instruction", () => {
        const JP_INSTRUCTION = 0x1FFF;

        expect(InstructionDecoder.decode(JP_INSTRUCTION)).toBeInstanceOf(JP);
    });

    test("decode 2nnn - CALL addr instruction", () => {
        const CALL_INSTRUCTION = 0x2111;

        expect(InstructionDecoder.decode(CALL_INSTRUCTION)).toBeInstanceOf(CALL);
    });

    test("decode 3xkk - SE Vx, byte instruction", () => {
        const SE_INSTRUCTION = 0x31FF;

        expect(InstructionDecoder.decode(SE_INSTRUCTION)).toBeInstanceOf(SEByte);
    });

    test("decode 4xkk - SNE Vx, byte instruction", () => {
        const SNE_INSTRUCTION = 0x4F11;

        expect(InstructionDecoder.decode(SNE_INSTRUCTION)).toBeInstanceOf(SNEByte);
    });

    test("decode 5xy0 - SE Vx, Vy instruction", () => {
        const SE_REGISTERS_INSTRUCTION = 0x51F0;

        expect(InstructionDecoder.decode(SE_REGISTERS_INSTRUCTION)).toBeInstanceOf(SERegisters);
    });

    test("decode 6xkk - LD Vx, byte instruction", () => {
        const LD_INSTRUCTION = 0x6F11;

        expect(InstructionDecoder.decode(LD_INSTRUCTION)).toBeInstanceOf(LDByte);
    });

    test("decode 7xkk - ADD Vx, byte instruction", () => {
        const ADD_INSTRUCTION = 0x71FF;

        expect(InstructionDecoder.decode(ADD_INSTRUCTION)).toBeInstanceOf(ADDByte);
    });
    
    test("decode 8xy0 - LD Vx, Vy instruction", () => {
        const LD_REGISTERS_INSTRUCTION = 0x81F0;

        expect(InstructionDecoder.decode(LD_REGISTERS_INSTRUCTION)).toBeInstanceOf(LDRegisters);
    });

    test("decode 8xy1 - OR Vx, Vy instruction", () => {
        const OR_INSTRUCTION = 0x8F11;

        expect(InstructionDecoder.decode(OR_INSTRUCTION)).toBeInstanceOf(ORRegisters);
    });

    test("decode 8xy2 - AND Vx, Vy instruction", () => {
        const AND_INSTRUCTION = 0x8F12;

        expect(InstructionDecoder.decode(AND_INSTRUCTION)).toBeInstanceOf(ANDRegisters);
    });

    test("decode 8xy3 - XOR Vx, Vy instruction", () => {
        const XOR_INSTRUCTION = 0x8F13;

        expect(InstructionDecoder.decode(XOR_INSTRUCTION)).toBeInstanceOf(XORRegisters);
    });

    test("decode 8xy4 - ADD Vx, Vy instruction", () => {
        const ADD_REGISTERS_INSTRUCTION = 0x8F14;

        expect(InstructionDecoder.decode(ADD_REGISTERS_INSTRUCTION)).toBeInstanceOf(ADDRegisters);
    });

    test("decode 8xy5 - SUB Vx, Vy instruction", () => {
        const SUB_REGISTERS_INSTRUCTION = 0x8F15;

        expect(InstructionDecoder.decode(SUB_REGISTERS_INSTRUCTION)).toBeInstanceOf(SUBRegisters);
    });

    test("decode 8xy6 - SHR Vx {, Vy} instruction", () => {
        const SHR_INSTRUCTION = 0x8106;

        expect(InstructionDecoder.decode(SHR_INSTRUCTION)).toBeInstanceOf(SHR);
    });

    test("decode 8xy7 - SUBN Vx, Vy instruction", () => {
        const SUBN_INSTRUCTION = 0x8567;

        expect(InstructionDecoder.decode(SUBN_INSTRUCTION)).toBeInstanceOf(SUBNRegisters);
    });

    test("decode 8xyE - SHL Vx {, Vy} instruction", () => {
        const SHL_INSTRUCTION = 0x856E;

        expect(InstructionDecoder.decode(SHL_INSTRUCTION)).toBeInstanceOf(SHL);
    });

    test("decode 9xy0 - SNE Vx, Vy instruction", () => {
        const SNE_REGISTERS = 0x9AE0;

        expect(InstructionDecoder.decode(SNE_REGISTERS)).toBeInstanceOf(SNERegisters);
    });

    test("decode Annn - LD I, addr instruction", () => {
        const LD_ADDRESS = 0xA111;

        expect(InstructionDecoder.decode(LD_ADDRESS)).toBeInstanceOf(LDAddress);
    });

    test("decode Bnnn - JP V0, addr instruction", () => {
        const JP_ADDRESS = 0xB111;

        expect(InstructionDecoder.decode(JP_ADDRESS)).toBeInstanceOf(JPRegister);
    });

    test("decode Cxkk - RND Vx, byte instruction", () => {
        const RND_INSTRUCTION = 0xC1AC;

        expect(InstructionDecoder.decode(RND_INSTRUCTION)).toBeInstanceOf(RND);
    });

    test("decode Dxyn - DRW Vx, Vy, nibble instruction", () => {
        const DRW_INSTRUCTION = 0xD782;

        expect(InstructionDecoder.decode(DRW_INSTRUCTION)).toBeInstanceOf(DRW);
    });

    test("decode Ex9E - SKP Vx instruction", () => {
        const SKP_INSTRUCTION = 0xE59E;

        expect(InstructionDecoder.decode(SKP_INSTRUCTION)).toBeInstanceOf(SKP);
    });

    test("decode ExA1 - SKNP Vx instruction", () => {
        const SKNP_INSTRUCTION = 0xE8A1;

        expect(InstructionDecoder.decode(SKNP_INSTRUCTION)).toBeInstanceOf(SKNP);
    });

    test("decode Fx07 - LD Vx, DT instruction", () => {
        const LD_DELAY_INSTRUCTION = 0xF407;

        expect(InstructionDecoder.decode(LD_DELAY_INSTRUCTION)).toBeInstanceOf(LDDelay);
    });

    test("decode Fx0A - LD Vx, K instruction", () => {
        const WAIT_KEY_INSTRUCTION = 0xF50A;

        expect(InstructionDecoder.decode(WAIT_KEY_INSTRUCTION)).toBeInstanceOf(WaitKey);
    });

    test("decode Fx15 - LD DT, Vx instruction", () => {
        const SET_DELAY_INSTRUCTION = 0xF815;

        expect(InstructionDecoder.decode(SET_DELAY_INSTRUCTION)).toBeInstanceOf(SETDelay);
    });

    test("decode Fx18 - LD ST, Vx instruction", () => {
        const SET_SOUND_INSTRUCTION = 0xF818;

        expect(InstructionDecoder.decode(SET_SOUND_INSTRUCTION)).toBeInstanceOf(SETSound);
    });

    test("decode Fx1E - ADD I, Vx instruction", () => {
        const ADD_ADDRESS_INSTRUCTION = 0xFC1E;

        expect(InstructionDecoder.decode(ADD_ADDRESS_INSTRUCTION)).toBeInstanceOf(ADDAddress);
    });

    test("decode Fx29 - LD F, Vx instruction", () => {
        const LD_SPRITE_INSTRUCTION = 0xF929;

        expect(InstructionDecoder.decode(LD_SPRITE_INSTRUCTION)).toBeInstanceOf(LDSprite);
    });

    test("decode Fx33 - LD B, Vx instruction", () => {
        const BCD_INSTRUCTION = 0xFC33;

        expect(InstructionDecoder.decode(BCD_INSTRUCTION)).toBeInstanceOf(BCD);
    });

    test("decode Fx55 - LD I, Vx instruction", () => {
        const WRITE_RANGE_INSTRUCTION = 0xFF55;

        expect(InstructionDecoder.decode(WRITE_RANGE_INSTRUCTION)).toBeInstanceOf(WriteRange);
    });

    test("decode Fx65 - LD Vx, I instruction", () => {
        const READ_RANGE_INSTRUCTION = 0xFF65;

        expect(InstructionDecoder.decode(READ_RANGE_INSTRUCTION)).toBeInstanceOf(ReadRange);
    });
});
