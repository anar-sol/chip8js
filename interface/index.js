import Chip8 from "../src/chip8.js";
import Screen from './screen.js';
import Keyboard from './keyboard.js';

(() => {
    const canvas = document.querySelector('.chip8__screen');
    const loadButton = document.getElementById('loadBtn');
    const startButton = document.getElementById('startBtn');

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
