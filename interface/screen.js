const WIDTH = 64;
const HEIGHT = 32;

function createScreenBuffer(width, height) {
    const buffer = new Array();
    for (let x = 0; x < width; x++) {
        buffer.push(new Array());
    }
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            buffer[x].push(false);
        }
    }
    return buffer;
}

export default class Screen {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.context = canvas.getContext('2d');
        this.context.fillStyle = 'white';

        this.width = width;
        this.height = height;

        this.pixelWidth = this.canvasWidth / this.width;
        this.pixelHeight = this.canvasHeight / this.height;

        this.buffer = createScreenBuffer(width, height);
    }

    static create(canvas, width = WIDTH, height = HEIGHT) {
        return new Screen(canvas, width, height);
    }

    getPixel(x, y) {
        return x < this.width && y < this.height && this.buffer[x][y];
    }

    setPixel(x, y, state) {
        if (x < this.width && y < this.height) this.buffer[x][y] = state;
    }

    clear() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.buffer[x][y] = false;
            }
        }
    }

    render() {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.buffer[x][y]) {
                    this.context.fillRect(x * this.pixelWidth, y * this.pixelHeight,
                        this.pixelWidth, this.pixelHeight);
                }
            }
        }
    }

    update() { }
}
