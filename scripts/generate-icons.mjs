// Generates PWA icons (pure Node, no dependencies) using zlib + manual PNG encoding.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// CRC32 table
const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function hex(c) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
}

const GREEN = hex('#2f6b4f')
const GREEN_DARK = hex('#214b38')
const WHITE = hex('#ffffff')
const LIGHT = hex('#eaf4ee')

function inRoundRect(x, y, w, h, r) {
  if (x < r && y < r) return Math.hypot(x - r, y - r) <= r
  if (x > w - r && y < r) return Math.hypot(x - (w - r), y - r) <= r
  if (x < r && y > h - r) return Math.hypot(x - r, y - (h - r)) <= r
  if (x > w - r && y > h - r) return Math.hypot(x - (w - r), y - (h - r)) <= r
  return x >= r && x <= w - r && y >= r && y <= h - r
}

// Distinctive mark: rounded green tile + white conversation bubble with a soft tail.
function pixel(x, y, size) {
  const r = size * 0.22
  if (!inRoundRect(x, y, size, size, r)) return [0, 0, 0, 0]
  let color = GREEN
  // bubble body (rounded rect) centered slightly below middle
  const bw = size * 0.54
  const bh = size * 0.44
  const bx = (size - bw) / 2
  const by = size * 0.24
  if (inRoundRect(x - bx, y - by, bw, bh, bh * 0.42)) {
    color = WHITE
  }
  // tail triangle under bubble
  const ty = size * 0.62
  const t = size * 0.14
  if (x > size * 0.36 && x < size * 0.64 && y > ty && y < ty + t && y < ty + t - ((x - size * 0.36) / t) * t * 0.9 && y < ty + t - ((size * 0.64 - x) / t) * t * 0.9) {
    color = WHITE
  }
  // three "speech" dots in primary color
  const dotR = size * 0.045
  const dots = [size * 0.36, size * 0.5, size * 0.64].map((dx) => [dx + bw / 2 - size * 0.19, size * 0.42])
  let dot = false
  for (const [cx, cy] of dots) {
    if (Math.hypot(x - cx, y - cy) <= dotR) dot = true
  }
  if (dot) color = GREEN
  // corner accent
  if (x < size * 0.18 && y < size * 0.18 && Math.hypot(x - 0, y - 0) <= size * 0.12) color = GREEN_DARK
  return [...color, 255]
}

function encode(len) {
  const size = len
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let o = 0
  for (let y = 0; y < size; y++) {
    raw[o++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size)
      raw[o++] = r
      raw[o++] = g
      raw[o++] = b
      raw[o++] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

const sizes = [192, 512]
for (const s of sizes) {
  writeFileSync(join(outDir, `icon-${s}.png`), encode(s))
  console.log(`generated public/icons/icon-${s}.png`)
}

// Fallback light icon for badging
const light = encode(192)
const lightPath = join(outDir, 'icon-192-maskable.png')
writeFileSync(lightPath, light)
console.log(`generated public/icons/icon-192-maskable.png`)

// Empty resources file reference (png only)
void GREEN_DARK
void LIGHT