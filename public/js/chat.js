const socket = io();
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"


socket.on('newPosition', (data) => {
    ctx.clearRect(0, 0, 500, 500);

    for (let i = 0; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y)
    }
    for (let i = 0; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10)
    }
})

document.addEventListener("keydown", (e) => {
    if (e.keyCode === 68)
        socket.emit('keyPress', {
            inputId: 'right',
            state: true
        })
    else if (e.keyCode === 83)
        socket.emit('keyPress', {
            inputId: 'down',
            state: true
        })
    else if (e.keyCode === 65)
        socket.emit('keyPress', {
            inputId: 'left',
            state: true
        })
    else if (e.keyCode === 87)
        socket.emit('keyPress', {
            inputId: 'up',
            state: true
        })

});

document.addEventListener("keyup", (e) => {
    if (e.keyCode === 68)
        socket.emit('keyPress', {
            inputId: 'right',
            state: false
        })
    else if (e.keyCode === 83)
        socket.emit('keyPress', {
            inputId: 'down',
            state: false
        })
    else if (e.keyCode === 65)
        socket.emit('keyPress', {
            inputId: 'left',
            state: false
        })
    else if (e.keyCode === 87)
        socket.emit('keyPress', {
            inputId: 'up',
            state: false
        })
});


document.addEventListener("mousedown", (e) => {
    socket.emit('keyPress', {
        inputId: 'attack',
        state: true
    })
})

document.addEventListener("mouseup", (e) => {
    socket.emit('keyPress', {
        inputId: 'attack',
        state: false
    })
})

document.addEventListener('mousemove', (e) => {
    console.log("lol")
    let x = -250 + e.clientX - 8;
    let y = -250 + e.clientY - 8;
    let angle = Math.atan2(y, x) / Math.PI * 180;
    console.log(angle);
    socket.emit('keyPress', {
        inputId: 'mouseAngle',
        state: angle
    })

})