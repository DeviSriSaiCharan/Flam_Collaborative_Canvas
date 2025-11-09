import { URLSearchParams } from "url";
import { initSocket } from "./socket.js";
import { initCanvas } from "./canvas.js";
import { on } from "events";
const statusEl = document.getElementById('status');
const usersListEl = document.getElementById('userList');
const canvasEl = document.getElementById('drawCanvas');
const colorPickerEl = document.getElementById('colorPicker');
const widthSliderEl = document.getElementById('widthSlider');
const btnClearEl = document.getElementById('btnClearLocal');
colorPickerEl.value = '#000000';
widthSliderEl.value = '3';
canvasEl.width = innerWidth;
canvasEl.height = innerHeight;
const ctx = canvasEl.getContext('2d');
const room = new URLSearchParams(window.location.pathname).get('room') || 'defaultRoom';
const socket = initSocket(room);
const { clearCanvas, handleRemoteStroke, onUserChange } = initCanvas(canvasEl, socket, room, colorPickerEl, widthSliderEl, usersListEl);
socket.on('changeInUsers', onUserChange);
socket.on('clear', clearCanvas);
socket.on('stroke', handleRemoteStroke);
btnClearEl.addEventListener('click', () => {
    clearCanvas();
    socket.emit('clear', { room });
});
//# sourceMappingURL=main.js.map