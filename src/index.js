const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public/')


app.use(express.static(publicDirectory))

let SOCKET_LIST = {};

class Entity {
    constructor() {
        const self = {
            x: 250,
            y: 250,
            spdX: 0,
            spdY: 0,
            id: ''
        }

        self.update = () => {
            self.updatePosition();
        }

        self.updatePosition = () => {
            self.x += self.spdX;
            self.y += self.spdY;
        }
        self.getDistance = (pt) => {
            return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
        }
        return self;
    }
}

class Player {
    constructor(id) {
        const self = new Entity();
        self.id = id;
        self.number = "" + Math.floor(Math.random() * 10);
        self.pressingRight = false;
        self.pressingLeft = false;
        self.pressingUp = false;
        self.pressingDown = false;
        self.pressingAttack = false;
        self.mouseAngle = 0;
        self.maxSpd = 10;

        const super_update = self.update;
        self.update = () => {
            self.updateSpd();
            super_update();

            if (self.pressingAttack) {
                self.shootBullet(self.mouseAngle);
            }
        }

        self.shootBullet = (angle) => {
            const b = new Bullet(self.id, angle);
            b.x = self.x;
            b.y = self.y
        }


        self.updateSpd = () => {
            if (self.pressingRight) {
                self.spdX = self.maxSpd;
            } else if (self.pressingLeft) {
                self.spdX = -self.maxSpd;
            } else {
                self.spdX = 0;
            }

            if (self.pressingDown) {
                self.spdY = self.maxSpd;
            } else if (self.pressingUp) {
                self.spdY = -self.maxSpd;
            } else {
                self.spdY = 0;
            }
        }
        Player.list[id] = self;
        return self;
    }
}
Player.list = {};
Player.onConnect = (socket) => {
    const player = new Player(socket.id);
    socket.on('keyPress', (data) => {
        if (data.inputId === "left") {
            player.pressingLeft = data.state;
        } else if (data.inputId === "right") {
            player.pressingRight = data.state;
        } else if (data.inputId === "up") {
            player.pressingUp = data.state;
        } else if (data.inputId === "down") {
            player.pressingDown = data.state;
        } else if (data.inputId === "attack") {
            player.pressingAttack = data.state;
        } else if (data.inputId === "mouseAngle") {
            player.mouseAngle = data.state;
        }
    })
}

Player.onDisconnect = (socket) => {
    delete Player.list[socket.id];
}

Player.update = () => {
    let pack = [];
    for (let i in Player.list) {
        const player = Player.list[i];
        player.update();
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number
        })
    }
    return pack;
}

class Bullet {
    constructor(parent, angle) {
        const self = new Entity();
        self.id = Math.random();
        self.spdX = Math.cos(angle / 180 * Math.PI) * 10;
        self.spdY = Math.sin(angle / 180 * Math.PI) * 10;
        self.parent = parent;
        self.timer = 0;
        self.toRemove = false;
        const super_update = self.update;
        self.update = () => {
            if (self.timer++ > 100) {
                self.toRemove = true
            }
            super_update();

            for (let i in Player.list) {
                const player = Player.list[i];
                if (self.getDistance(player) < 32 && self.parent !== player.id) {
                    self.toRemove = true;
                }
            }
        }
        Bullet.list[self.id] = self;
        return self;
    }
}
Bullet.list = {};

Bullet.update = () => {


    let pack = [];
    for (let i in Bullet.list) {
        const bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
        } else {
            pack.push({
                x: bullet.x,
                y: bullet.y
            })
        }

    }
    return pack;
}


io.on('connection', (socket) => {
    console.log('New User connected');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    Player.onConnect(socket)

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    })

})


setInterval(() => {
    let pack = {
        player: Player.update(),
        bullet: Bullet.update()
    }
    for (let i in SOCKET_LIST) {
        const socket = SOCKET_LIST[i];
        socket.emit("newPosition", pack)
    }
}, 1000 / 25)

server.listen(port, () => {
    console.log(`Served up on ${port}`);
})