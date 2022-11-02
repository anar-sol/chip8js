class RAMException extends Error {
    constructor(message) {
        super(message);
        this.name = "RAMException";
    }
}

class Registers {
    #NB_GENERAL_REGISTERS = 16;

    #generalRegisters;
    #addressRegister;
    #soundRegister;
    #delayRegister;
    #programCounter;

    constructor() {
        this.#initialize();
    }

    static newRegisters() {
        return new Registers();
    }

    #initialize() {
        this.#generalRegisters = new Uint8Array(this.#NB_GENERAL_REGISTERS);
    }

    write(register, value) {
        this.#generalRegisters[register] = value;
    }

    read(register) {
        return this.#generalRegisters[register];
    }

    writeRange(register, array) {
        for (const value of array) this.write(register++, value);
    }

    readRange(register, length) {
        return this.#generalRegisters.subarray(register, register + length);
    }
}

export { Registers };
