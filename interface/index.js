import Chip8 from "../src/chip8.js";
import Screen from './screen.js';
import Keyboard from './keyboard.js';

const roms = new Map([
    ['IBM Logo', 'IBM Logo.ch8'],
    ['Breakout', 'Breakout (Brix hack) [David Winter, 1997].ch8'],
]);
const romDirectory = 'roms/';

(() => {
    const canvas = document.querySelector('.chip8__screen');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvas.getContext('2d').fillStyle = '#ffffff';

    const loadButton = document.querySelector('.chip8__button--load');
    const startButton = document.querySelector('.chip8__button--start');
    const romSelect = document.querySelector('.chip8__select--rom');

    (() => {
        for (const [text, value] of roms) {
            const option = new Option(text, value);
            romSelect.add(option);
        }
    })();
    romSelect.addEventListener('change', (e) => {
        console.log(romSelect.selectedIndex);
        console.log(romSelect.value);
        console.log(new URL(romDirectory + romSelect.value, document.documentURI).href);
    });

    const chip8 = Chip8.create();
    const screen = Screen.create(canvas);
    chip8.setScreen(screen);
    const keyboard = Keyboard.create(chip8);

    document.addEventListener('keydown', e => { keyboard.handle(e); });
    document.addEventListener('keyup', e => { keyboard.handle(e); });

    loadButton.addEventListener('click', async () => {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const prog = new Uint8Array(await file.arrayBuffer());
        chip8.loadProgram(prog);
    });

    startButton.addEventListener('click', async () => {
        chip8.run(700);
    });

    (function draw() {
        window.requestAnimationFrame(draw);
        screen.render();
    })();
})();
