const canvas = document.getElementById('drawingCanvas');
        const context = canvas.getContext('2d');
        let drawing = false; 
        let eraser = false;   
        let lastX = 0;
        let lastY = 0;
        const colorInput = document.getElementById('colorInput');
        const strokeWidthInput = document.getElementById('strokeWidthInput');
        const eraserButton = document.getElementById('eraserButton');

        // const socket = new WebSocket('ws://localhost:8080');

        // socket.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     context.beginPath();
        //     context.moveTo(data.lastX, data.lastY);
        //     context.lineTo(data.x, data.y);
        //     context.stroke();
        // };

        canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;

            const x = e.offsetX;
            const y = e.offsetY;
            console.log(x, y);
            context.beginPath();
            context.moveTo(lastX, lastY);
            context.lineTo(x, y);
            context.stroke();
            lastX = x;
            lastY = y;

            // socket.send(JSON.stringify({ x, y, lastX, lastY }));
        });

        canvas.addEventListener('mouseup', () => {
            drawing = false;
        });

        canvas.addEventListener('mouseout', () => {
            drawing = false;
        });

        // Change brush color color according to the input value
        colorInput.addEventListener('change', (e) => {
            context.strokeStyle = e.target.value;
        })

        strokeWidthInput.addEventListener('change', (e) => {
            context.lineWidth = e.target.value;
        })

        eraserButton.addEventListener('click',() => {
            eraser = !eraser;
            if(eraser) context.strokeStyle = '#FFFFFF';
            else context.strokeStyle = colorInput.value;
        })