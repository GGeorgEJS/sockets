const socket = io();
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"

class Player {
    constructor(initPack) {
        const self = {};
        self.id = initPack.id;
        self.number = initPack.number;
        self.x = initPack.x;
        self.y = initPack.y;
        self.hp = initPack.hp;
        self.hpMax = initPack.hpMax;
        self.score = initPack.score;

        self.draw = () => {
            let hpWidth = 30 * self.hp / self.hpMax;
            ctx.fillRect(self.x - hpWidth / 2, self.y - 40, hpWidth, 4);
            ctx.fillText(self.number, self.x, self.y);

            ctx.fillText(self.score, self.x, self.y - 60);
        }

        Player.list[self.id] = self;
        return self;
    }
}

Player.list = {};

class Bullet {
    constructor(initPack) {
        const self = {};
        self.id = initPack.id;
        self.number = initPack.number;
        self.x = initPack.x;
        self.y = initPack.y;
        self.draw = () => {
            ctx.fillRect(self.x - 5, self.y - 5, 10, 10);
        }
        Bullet.list[self.id] = self;
        return self;
    }
}

Bullet.list = {};

socket.on('init', (data) => {

    for (let i = 0; i < data.player.length; i++) {
        new Player(data.player[i]);
    }
    for (let i = 0; i < data.bullet.length; i++) {
        new Bullet(data.bullet[i]);
    }

})

socket.on('update', (data) => {

    for (let i = 0; i < data.player.length; i++) {
        const pack = data.player[i];
        const p = Player.list[pack.id];
        if (p) {
            if (pack.x !== undefined) {
                p.x = pack.x;
            }
            if (pack.y !== undefined) {
                p.y = pack.y;
            }
            if (pack.hp !== undefined) {
                p.hp = pack.hp;
            }
            if (pack.score !== undefined) {
                p.score = pack.score;
            }
        }
    }
    for (let i = 0; i < data.bullet.length; i++) {
        const pack = data.bullet[i];
        const b = Bullet.list[pack.id];
        if (b) {
            if (pack.x !== undefined) {
                b.x = pack.x;
            }
            if (pack.y !== undefined) {
                b.y = pack.y;
            }
        }
    }
})

socket.on('remove', (data) => {

    for (let i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (let i = 0; i < data.bullet.length; i++) {
        delete Bullet.list[data.bullet[i]];
    }

})



setInterval(() => {
    ctx.clearRect(0, 0, 500, 500);

    for (let i in Player.list) {
        Player.list[i].draw()
    }
    for (let i in Bullet.list) {
        Bullet.list[i].draw()
    }
}, 1000 / 25);

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
    let x = -250 + e.clientX - 8;
    let y = -250 + e.clientY - 8;
    let angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', {
        inputId: 'mouseAngle',
        state: angle
    })

})