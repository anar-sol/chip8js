function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getBCD(n) {
    const bcd = new Array();
    do {
        const r = n % 10;
        bcd.push(r);
        n = Math.floor(n / 10);
    } while (n > 0);
    return bcd;
}

function getNibble(instruction, n) {
    const mask = 0xF << (4 * n);
    return (instruction & mask) >>> (4 * n);
}

export { timeout, getBCD, getNibble };