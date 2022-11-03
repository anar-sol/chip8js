class RAMException extends Error {
    constructor(message) {
        super(message);
        this.name = "RAMException";
    }
}

class Registers {
    static V0 = 0x0;
    static V1 = 0x1;
    static V2 = 0x2;
    static V3 = 0x3;
    static V4 = 0x4;
    static V5 = 0x5;
    static V6 = 0x6;
    static V7 = 0x7;
    static V8 = 0x8;
    static V9 = 0x9;
    static VA = 0xA;
    static VB = 0xB;
    static VC = 0xC;
    static VD = 0xD;
    static VE = 0xE;
    static VF = 0xF;
    static DELAY = 0x10;
    static SOUND = 0x11;
    static SP = 0x12;
    static I = 0x13;
    static PC = 0x14;

    static #NB_8BIT_REGISTERS = 19;
    static #NB_16BIT_REGISTERS = 2;

    #registers8bit;
    #registers16bit;

    constructor() {
        this.#initialize();
    }

    static newRegisters() {
        return new Registers();
    }

    #initialize() {
        this.#registers8bit = new Uint8Array(Registers.#NB_8BIT_REGISTERS);
        this.#registers16bit = new Uint16Array(Registers.#NB_16BIT_REGISTERS);
    }

    write(register, value) {
        if (register < Registers.#NB_8BIT_REGISTERS) this.#registers8bit[register] = value;
        else this.#registers16bit[register - Registers.#NB_8BIT_REGISTERS] = value;
    }

    read(register) {
        if (register < Registers.#NB_8BIT_REGISTERS) return this.#registers8bit[register];
        return this.#registers16bit[register - Registers.#NB_8BIT_REGISTERS];
    }

    writeRange(register = Registers.V0, array) {
        for (const value of array) this.write(register++, value);
    }

    readRange(register, length) {
        return this.#registers8bit.subarray(register, register + length);
    }
}

export { Registers };
