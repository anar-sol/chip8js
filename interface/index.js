import Chip8 from "../src/chip8.js";
import Screen from './screen.js';
import Keyboard from './keyboard.js';

(() => {
    const roms = new Map([
        ['Breakout', 'Breakout (Brix hack) [David Winter, 1997].ch8'],
        ['IBM Logo', 'IBM Logo.ch8'],
        ['Pong', 'Pong (1 player).ch8'],
        ['Tetris', 'Tetris [Fran Dachille, 1991].ch8'],
    ]);
    const romDirectory = 'roms/';
    let rom = null;

    const helpControls = document.querySelector('.chip8__help--controls');
    const helpLoading = document.querySelector('.chip8__help--loading');
    const helpError = document.querySelector('.chip8__help--error');
    helpControls.classList.add('chip8__help--active');
    
    const canvas = document.querySelector('.chip8__screen');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvas.getContext('2d').fillStyle = '#ffffff';

    const romSelect = document.querySelector('.chip8__select--rom');
    const startButton = document.querySelector('.chip8__button--start');
    const stopButton = document.querySelector('.chip8__button--stop');

    const keyboardButtons = document.querySelectorAll('.chip8__key');

    (function initROMSelect() {
        for (const [text, value] of roms) {
            const option = new Option(text, value);
            romSelect.add(option);
        }
    })();

    const chip8 = Chip8.newChip8();
    const screen = Screen.create(canvas);
    chip8.screen = screen;
    const keyboard = Keyboard.create(chip8);

    document.addEventListener('keydown', e => { keyboard.handle(e); });
    document.addEventListener('keyup', e => { keyboard.handle(e); });

    for (const button of keyboardButtons) {
        button.addEventListener('mousedown', e => { keyboard.handle(e); });
        button.addEventListener('pointerdown', e => { keyboard.handle(e); });
        button.addEventListener('mouseup', e => { keyboard.handle(e); });
        button.addEventListener('pointerup', e => { keyboard.handle(e); });
    }

    romSelect.addEventListener('change', (e) => {
        if (romSelect.value !== '') {
            rom = null;
            helpError.classList.remove('chip8__help--active');
            helpControls.classList.remove('chip8__help--active');
            helpLoading.classList.add('chip8__help--active');
            const romURL = new URL(romDirectory + romSelect.value, document.documentURI);
            fetch(romURL).then(response => {
                if (!response.ok) {
                    helpLoading.classList.remove('chip8__help--active');
                    helpError.classList.add('chip8__help--active');
                    throw new Error('HTTP error ', response.status);
                }
                return response.arrayBuffer();
            }).then(arrayBuffer => {
                rom = new Uint8Array(arrayBuffer);
                chip8.exit();
                chip8.loadROM(rom);
                helpLoading.classList.remove('chip8__help--active');
                helpControls.classList.add('chip8__help--active');
            });
        }
    });

    startButton.addEventListener('click', async () => {
        if (!chip8.isRunning && rom !== null) {
            helpError.classList.remove('chip8__help--active');
            helpControls.classList.remove('chip8__help--active');
            chip8.exit();
            chip8.loadROM(rom);
            chip8.run(700);
        }
    });

    stopButton.addEventListener('click', () => {
        if (chip8.isRunning) {
            helpControls.classList.add('chip8__help--active');
            chip8.exit();
        }
    });

    (function draw() {
        window.requestAnimationFrame(draw);
        screen.render();
    })();
})();
