// x' = x/z
// y' = y/z
const FOREGROUND = "#28b67fff"
const BACKGROUND = "#1f1f1f"
const FPS = 60
game.width = 400
game.height = 400

const ctx = game.getContext("2d")

function translateToScreen({ x, y }) {
    // -1..1 => 0..2 => 0..1 => 0..w/h
    return {
        x: (x + 1) / 2 * game.width,
        y: (1 - (y + 1) / 2) * game.height,
    }
}

function translateZ({ x, y, z }) {
    return { x: x / z, y: y / z }
}

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, game.height, game.width)
}

function renderPoint({ x, y }, size = 10) {
    ctx.fillStyle = FOREGROUND
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
}

function rotatePoint(point, dt, speed = { roll: 0, pitch: 1, yaw: 0 }) {
    const dgamma = speed.roll * Math.PI / 180 * dt
    const dbeta = speed.pitch * Math.PI / 180 * dt
    const dalpha = speed.yaw * Math.PI / 180 * dt

    const Rxyz = [
        [Math.cos(dbeta) * Math.cos(dgamma), Math.sin(dalpha) * Math.sin(dbeta) * Math.cos(dgamma) - Math.cos(dalpha) * Math.sin(dgamma), Math.cos(dalpha) * Math.sin(dbeta) * Math.cos(dgamma) + Math.sin(dalpha) * Math.sin(dgamma)],
        [Math.cos(dbeta) * Math.sin(dgamma), Math.sin(dalpha) * Math.sin(dbeta) * Math.sin(dgamma) + Math.cos(dalpha) * Math.cos(dgamma), Math.cos(dalpha) * Math.sin(dbeta) * Math.sin(dgamma) - Math.sin(dalpha) * Math.cos(dgamma)],
        [-Math.sin(dbeta), Math.sin(dalpha) * Math.cos(dbeta), Math.cos(dalpha) * Math.cos(dbeta)]
    ]

    const { x, y, z } = point
    point.x = Rxyz[0][0] * x + Rxyz[0][1] * y + Rxyz[0][2] * z
    point.y = Rxyz[1][0] * x + Rxyz[1][1] * y + Rxyz[1][2] * z
    point.z = Rxyz[2][0] * x + Rxyz[2][1] * y + Rxyz[2][2] * z
}

function renderLine(p1, p2) {
    const p1T = translateToScreen(translateZ(p1))
    const p2T = translateToScreen(translateZ(p2))
    ctx.lineWidth = 3;
    ctx.strokeStyle = FOREGROUND
    ctx.beginPath()
    ctx.moveTo(p1T.x, p1T.y)
    ctx.lineTo(p2T.x, p2T.y)
    ctx.stroke()
}

function translate_z({ x, y, z }, dz) {
    return { x, y, z: z + dz };
}

let dz = 0.75;

function frame() {
    const dt = 1 / FPS
    clear()
    for (let i = 0; i < points.length; i++) {
        rotatePoint(points[i], dt, { roll: 10, pitch: 15, yaw: 25 })
        renderPoint(translateToScreen(translateZ(translate_z(points[i], dz))), (1 - (points[i].z + 0.25) * 2) * 10)
    }
    faces.forEach((face) => {
        face.forEach((point, i) => {
            const nextPoint = face[(i + 1) % face.length]
            renderLine(translate_z(point, dz), translate_z(nextPoint, dz))
        })
    })
    setTimeout(() => frame(), 1000 / FPS)
}

frame()