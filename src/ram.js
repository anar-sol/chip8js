class RAMException extends Error {
    constructor(message) {
        super(message);
        this.name = "RAMException";
    }
}

class RAM {
    #array;

    constructor(size) {
        this.#array = new Uint8Array(size);
    }

    static newRAM(size) {
        return new RAM(size);
    }

    readByte(address) {
        if (address < 0 || address >= this.#array.length) throw new RAMException(`RAM address ${address} is out of bound`);
        return this.#array[address];
    }

    writeByte(address, value) {
        if (address < 0 || address >= this.#array.length) throw new RAMException(`RAM address ${address} is out of bound`);
        this.#array[address] = value;
    }

    readDoubleByte(address) {
        return (this.readByte(address) << 8) | this.readByte(address + 1);
    }

    writeRange(address, array) {
        if (address < 0) throw new RAMException(`RAM address ${address} is out of bound`);
        if (address + array.length > this.#array.length) throw new RAMException(`RAM address ${address + array.length - 1} is out of bound`);
        for (let i = 0; i < array.length; i++) this.writeByte(address + i, array[i]);
    }

    readRange(address, length) {
        if (address < 0) throw new RAMException(`RAM address ${address} is out of bound`);
        if (address + length > this.#array.length) throw new RAMException(`RAM address ${address + length - 1} is out of bound`);
        return this.#array.subarray(address, address + length);
    }
}

export { RAM, RAMException };
