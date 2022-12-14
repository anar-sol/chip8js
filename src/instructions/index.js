import { getNibble } from "../utils.js";
import CLS from "./cls.js";
import RET from "./ret.js";
import JP from "./jp.js";
import CALL from "./call.js";
import SEByte from "./se-byte.js";
import SNEByte from "./sen-byte.js";
import SERegisters from "./se-registers.js";
import LDByte from "./ld-byte.js";
import ADDByte from "./add-byte.js";
import LDRegisters from "./ld-registers.js";
import ORRegisters from "./or-registers.js";
import ANDRegisters from "./and-registers.js";
import XORRegisters from "./xor-registers.js";
import ADDRegisters from "./add-registers.js";
import SUBRegisters from "./sub-registers.js";
import SHR from "./shr.js";
import SUBNRegisters from "./subn-registers.js";
import SHL from "./shl.js";
import SNERegisters from "./sne-registers.js";
import LDAddress from "./ld-address.js";
import RND from "./rnd.js";
import DRW from "./drw.js";
import JPRegister from "./jp-register.js";
import SKP from "./skp.js";
import SKNP from "./sknp.js";
import SETDelay from "./set-delay.js";
import WaitKey from "./wait-key.js";
import LDDelay from "./ld-delay.js";
import SETSound from "./set-sound.js";
import ADDAddress from "./add-address.js";
import LDSprite from "./ld-sprite.js";
import BCD from "./bcd.js";
import WriteRange from "./write-range.js";
import ReadRange from "./read-range.js";

export default class InstructionDecoder {

    static decode(instruction) {
        switch (InstructionDecoder.#getOpcode(instruction)) {
            case 0x0:
                switch (getNibble(instruction, 0)) {
                    case 0x0:
                        return new CLS();
                    case 0xE:
                        return new RET();
                }
                break;
            case 0x1:
                return new JP(instruction);
            case 0x2:
                return new CALL(instruction);
            case 0x3:
                return new SEByte(instruction);
            case 0x4:
                return new SNEByte(instruction);
            case 0x5:
                return new SERegisters(instruction);
            case 0x6:
                return new LDByte(instruction);
            case 0x7:
                return new ADDByte(instruction);
            case 0x8:
                switch (getNibble(instruction, 0)) {
                    case 0x0:
                        return new LDRegisters(instruction);
                    case 0x1:
                        return new ORRegisters(instruction);
                    case 0x2:
                        return new ANDRegisters(instruction);
                    case 0x3:
                        return new XORRegisters(instruction);
                    case 0x4:
                        return new ADDRegisters(instruction);
                    case 0x5:
                        return new SUBRegisters(instruction);
                    case 0x6:
                        return new SHR(instruction);
                    case 0x7:
                        return new SUBNRegisters(instruction);
                    case 0xE:
                        return new SHL(instruction);
                }
            case 0x9:
                return new SNERegisters(instruction);
            case 0xA:
                return new LDAddress(instruction);
            case 0xB:
                return new JPRegister(instruction);
            case 0xC:
                return new RND(instruction);
            case 0xD:
                return new DRW(instruction);
            case 0xE:
                switch (this.#getByte(instruction)) {
                    case 0x9E:
                        return new SKP(instruction);
                    case 0xA1:
                        return new SKNP(instruction);
                }
            case 0xF:
                switch (this.#getByte(instruction)) {
                    case 0x07:
                        return new LDDelay(instruction);
                    case 0x0A:
                        return new WaitKey(instruction);
                    case 0x15:
                        return new SETDelay(instruction);
                    case 0x18:
                        return new SETSound(instruction);
                    case 0x1E:
                        return new ADDAddress(instruction);
                    case 0x29:
                        return new LDSprite(instruction);
                    case 0x33:
                        return new BCD(instruction);
                    case 0x55:
                        return new WriteRange(instruction);
                    case 0x65:
                        return new ReadRange(instruction);
                }
        }
    }

    static #getOpcode(instruction) {
        return getNibble(instruction, 3);
    }

    static #getByte(instruction) {
        return instruction & 0x00FF;
    }
}