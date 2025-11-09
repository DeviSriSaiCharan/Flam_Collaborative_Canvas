
(() => {
  const socket = io();

  const statusEl = document.getElementById('status');
  const usersListEl = document.getElementById('userList');
  const canvas = document.getElementById('drawCanvas');
  const colorPickerEl = document.getElementById('colorPicker');
  const widthSliderEl = document.getElementById('widthSlider');
  const btnClearEl = document.getElementById('btnClearLocal');

  colorPickerEl.value = '#000000';
  widthSliderEl.value = 3;

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const ctx = canvas.getContext('2d');
  
  function log(...args) {
    console.debug(...args);
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    // logEl.textContent = `${new Date().toLocaleTimeString()} - ${msg}\n` + logEl.textContent;
  }
  
  // === Socket Connection Logic ===
  const room = new URLSearchParams(window.location.search).get('room') || 'default';
  
  socket.on("connect", () => {
    statusEl.textContent = `Connected (id: ${socket.id})`;
    // log('socket connected', { id: socket.id });
    socket.emit("joinRoom", { room });
  })
  
  socket.on('disconnect', (reason) => {
    statusEl.textContent = `Disconnected (${reason})`
    console.log("Disconnected");
  })
  


  socket.on('pong', (payload) => {
    log('pong', payload);
  })

  socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  })

  socket.on('stroke', (data) => {
    const {color, width} = data;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    // ctx.lineJoin = 'round';

    const pts = data.points;

    ctx.beginPath();
    for(let i=1 ; i<pts.length ; i++) {
      const p1 = pts[i-1];
      const p2 = pts[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      const steps = Math.ceil(dist/2);
      for(let s=0 ; s<=steps ; s++) {
        const t = s/steps;
        const x = p1.x + dx*t;
        const y = p1.y + dy*t;
        
        if(s == 0 && i == 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // ctx.moveTo(p1.x, p2.y);
      // ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  })

  socket.on('changeInUsers', (data) => {
    const {userId, message, users} = data;

    usersListEl.innerHTML = '';

    users.forEach(user => {
      console.log(user);
      const li = document.createElement('li');
      li.textContent = user.user;
      li.style.color = user.color;

      if(user.user == socket.id) {
        li.style.fontWeight = 'bold';
        li.textContent += " (You)";
      }

      usersListEl.appendChild(li);
    })
  })

  // === Drawing logic ===

  let drawing  = false;
  let prevX, prevY;
  let pointsBuffer = [];

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x : e.clientX - rect.left,
      y : e.clientY - rect.top
    };
  }; 

  const startDraw = (e) => {
    log("Start drawing");
    drawing = true;
    const {x, y} = getPos(e);
    prevX = x;
    prevY = y;

    pointsBuffer.push({x, y});
  }

  const draw = (e) => {
    if(!drawing) return;
    const {x, y} = getPos(e);

    ctx.strokeStyle = colorPickerEl.value;
    ctx.lineWidth = widthSliderEl.value;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();

    prevX = x;
    prevY = y;

    // socket.emit("stroke", {room, x, y, prevX, prevY, color: ctx.strokeStyle, width: ctx.lineWidth});
    pointsBuffer.push({x, y});
  }

  const endDraw = () => {
    drawing = false;
  }

  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointerleave', endDraw);

  // === Send pointsBuffer to the server for every 20ms ===

  setInterval(() => {
    if(pointsBuffer.length > 0) {
      socket.emit("stroke",{
        room,
        color: ctx.strokeStyle,
        width: ctx.lineWidth,
        points: pointsBuffer.splice(0, pointsBuffer.length)
      });
    }
  },40);
  

  btnClearEl.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("clear", { room });
  })

})();
