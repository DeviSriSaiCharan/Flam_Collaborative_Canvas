import { clear } from "console";
import type { Socket } from "socket.io-client"

export const initCanvas = (
    canvas: HTMLCanvasElement,
    socket: Socket,
    room: string,
    colorPickerEl: HTMLInputElement,
    widthSliderEl: HTMLInputElement,
    usersListEl: HTMLUListElement
) => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let drawing = false;  
    let prevX = 0;
    let prevY = 0;
    let color = colorPickerEl.value;
    let lineWidth = parseInt(widthSliderEl.value);
    let pointsBuffer: Array<{x: number, y: number}> = [];

    const getPos = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

    }
    const startDraw = (e: PointerEvent) => {
        drawing = true;
        const pos = getPos(e);
        prevX = pos.x;
        prevY = pos.y;
        pointsBuffer.push({x: prevX, y: prevY});
    };

    const draw = (e: PointerEvent) => {
        if(!drawing) return;
        const pos = getPos(e);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        prevX = pos.x;
        prevY = pos.y;
        pointsBuffer.push({x: pos.x, y: pos.y});
    }

    const endDraw = () => {
        drawing = false;
        pointsBuffer = [];
    }

    const clearCanvas = () => (ctx.clearRect(0, 0, canvas.width, canvas.height));

    const handleRemoteStroke = (data: any) => {
        const {color, lineWidth, points} = data;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        for(let i=1 ; i<points.length; i++) {
            const p1 = points[i-1];
            const p2 = points[i];

            ctx.beginPath();

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.stroke();
        }
    }

    const onUserChange = (users: {userId: string, color: string}[]) => {
        usersListEl.innerHTML = '';

        users.forEach(u => {
            const li = document.createElement('li');
            li.innerText = `${u.userId} ${u.userId == socket.id ? '(You)' : ''}`;
            li.style.color = u.color;
            usersListEl.appendChild(li);
        });
    }

    colorPickerEl.addEventListener('change', (e) => {
        color = (e.target as HTMLInputElement).value;
    });

    widthSliderEl.addEventListener('change', (e) => {
        lineWidth = parseInt((e.target as HTMLInputElement).value);
    });

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointerout', endDraw);

    setInterval(() => {
        if (pointsBuffer.length > 0) {
            socket.emit('stroke', {
                room,
                color,
                lineWidth,
                points: pointsBuffer.splice(0, pointsBuffer.length)
            });
            pointsBuffer = [];
        }
    }, 300);

    return {
        clearCanvas,
        handleRemoteStroke,
        onUserChange
    }
}