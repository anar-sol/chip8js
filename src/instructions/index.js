import { getNibble } from "../utils.js";
import InstructionCLS from "./instruction-cls.js";
import InstructionRET from "./instruction-ret.js";
import InstructionJP from "./instruction-jp.js";
import InstructionCALL from "./instruction-call.js";
import InstructionSE from "./instruction-se.js";
import InstructionSNE from "./instruction-sen.js";
import InstructionSERegisters from "./instruction-se-registers.js";
import InstructionLD from "./instruction-ld.js";
import InstructionADD from "./instruction-add-byte.js";
import InstructionLDRegisters from "./instruction-ld-registers.js";
import InstructionOR from "./instruction-or.js";
import InstructionAND from "./instruction-and.js";
import InstructionXOR from "./instruction-xor.js";
import InstructionADDRegisters from "./instruction-add-registers.js";
import InstructionSUBRegisters from "./instruction-sub-registers.js";
import InstructionSHR from "./instruction-shr.js";
import InstructionSUBN from "./instruction-subn.js";
import InstructionSHL from "./instruction-shl.js";
import InstructionSNERegisters from "./instruction-sne-registers.js";

export default class InstructionDecoder {

    static decode(instruction) {
        switch (InstructionDecoder.#getOpcode(instruction)) {
            case 0x0:
                switch (getNibble(instruction, 0)) {
                    case 0x0:
                        return new InstructionCLS();
                    case 0xE:
                        return new InstructionRET();
                }
                break;
            case 0x1:
                return new InstructionJP(instruction);
            case 0x2:
                return new InstructionCALL(instruction);
            case 0x3:
                return new InstructionSE(instruction);
            case 0x4:
                return new InstructionSNE(instruction);
            case 0x5:
                return new InstructionSERegisters(instruction);
            case 0x6:
                return new InstructionLD(instruction);
            case 0x7:
                return new InstructionADD(instruction);
            case 0x8:
                switch (getNibble(instruction, 0)) {
                    case 0x0:
                        return new InstructionLDRegisters(instruction);
                    case 0x1:
                        return new InstructionOR(instruction);
                    case 0x2:
                        return new InstructionAND(instruction);
                    case 0x3:
                        return new InstructionXOR(instruction);
                    case 0x4:
                        return new InstructionADDRegisters(instruction);
                    case 0x5:
                        return new InstructionSUBRegisters(instruction);
                    case 0x6:
                        return new InstructionSHR(instruction);
                    case 0x7:
                        return new InstructionSUBN(instruction);
                    case 0xE:
                        return new InstructionSHL(instruction);
                }
                break;
            case 0x9:
                return new InstructionSNERegisters(instruction);
        }
    }

    static #getOpcode(instruction) {
        return getNibble(instruction, 3);
    }
}