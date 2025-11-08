import { URLSearchParams } from "url";
import { initSocket } from "./socket.js";
import { initCanvas } from "./canvas.js";


const statusEl = document.getElementById('status');
const usersListEl = document.getElementById('userList') as HTMLUListElement;
const canvasEl = document.getElementById('drawCanvas') as HTMLCanvasElement;
const colorPickerEl = document.getElementById('colorPicker') as HTMLInputElement;
const widthSliderEl = document.getElementById('widthSlider') as HTMLInputElement;
const btnClearEl = document.getElementById('btnClearLocal') as HTMLButtonElement;

colorPickerEl.value = '#000000';
widthSliderEl.value = '3';

canvasEl.width = innerWidth;
canvasEl.height = innerHeight;

const ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

const room: string = new URLSearchParams(window.location.pathname).get('room') || 'defaultRoom';

const socket = initSocket(room);

const { clearCanvas, handleRemoteStroke, onUserChange } = initCanvas(canvasEl, socket, room, colorPickerEl, widthSliderEl, usersListEl);

socket.on('changeInUsers', onUserChange);
socket.on('clear', clearCanvas);
socket.on('stroke', handleRemoteStroke);

btnClearEl.addEventListener('click', () => {
    clearCanvas();
    socket.emit('clear', { room });
});
