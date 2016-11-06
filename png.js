'use strict';

const fs   = require('fs');
const zlib = require('zlib');


const crcTable = [];

for(let i = 0; i < 256; i++) {
  let c = i;

  for(let j = 0; j < 8; j++) {
    if (c & 1)
      c = 0xedb88320 ^ (c >>> 1);
    else
      c = c >>> 1;
  }

  crcTable[i] = c;
} // for

const crc32 = (buf) => {
  let crc = -1;

  for(const n of buf)
    crc = crcTable[(crc ^ n) & 0xff] ^ (crc >>> 8);

  const b = Buffer.alloc(4);
  b.writeInt32BE(crc ^ -1);
  return b;
}


const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const PNG_END    = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);


// buf.copy(targetBuffer[, targetStart][, sourceStart][, sourceEnd])
// buf.writeUInt32BE(value, offset)

class Png {
    constructor(opts) {
        if (opts.buffer) { // decode png
            const width        = opts.buffer.readUInt32BE(16); // (offset[, noAssert])
            const height       = opts.buffer.readUInt32BE(20);

            const deflateSize  = opts.buffer.readUInt32BE(33);
            const inflatedData = zlib.inflateSync(opts.buffer.slice(41, deflateSize+41));

            this.data          = Buffer.allocUnsafe(width * height * 4);
            const pngRow       = 1 + width * 4;
            const pngWidth     =     width * 4;

            for(let y = 0; y < height; y++) {
                inflatedData.copy(this.data, pngWidth * y, pngRow * y + 1, pngRow * (y+1));
            } // for

        } else { // if
            this.width  = opts.width;
            this.height = opts.height;
            this.data   = Buffer.allocUnsafe(this.width * this.height * 4);
        } // else
    } // constructor()

    pack() {
        const bufs = [PNG_HEADER];

        /*
        # IHDR
        # http://www.w3.org/TR/PNG/#11IHDR
        # Width 4 bytes
        # Height  4 bytes
        # Bit depth 1 byte
        # Colour type 1 byte
        # Compression method  1 byte
        # Filter method 1 byte
        # Interlace method  1 byte
        */

        const ihdrBuf = Buffer.alloc(25);

        (Buffer.from([0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52])).copy(ihdrBuf) // length ihdr sig

        ihdrBuf.writeUInt32BE(this.width, 8);
        ihdrBuf.writeUInt32BE(this.height, 12);

        ihdrBuf[16] = 8;
        ihdrBuf[17] = 6;
        ihdrBuf[18] = 0;
        ihdrBuf[19] = 0;
        ihdrBuf[20] = 0;

        const crcres1 = crc32(ihdrBuf.slice(4, ihdrBuf.length-4))
        crcres1.copy(ihdrBuf, 21);

        bufs.push(ihdrBuf);


        // IDAT
        let   pngData  = Buffer.allocUnsafe(this.width * this.height * 4 + this.height);
        const pngRow   = 1 + this.width * 4;
        const pngWidth =     this.width * 4;

        for(let y = 0; y < this.height; y++) {

            pngData[y * pngRow] = 0; // first byte filter id, copy to pngData, from line start, to pos1, size:one line  

            this.data.copy(pngData, y * pngRow + 1, pngWidth * y, pngWidth * (y+1));
        }

        pngData = zlib.deflateSync(pngData);

        const idatBuf = Buffer.allocUnsafe(pngData.length+12);

        pngData.copy(idatBuf, 8);

        idatBuf.writeUInt32BE(pngData.length);

        (Buffer.from([0x49, 0x44, 0x41, 0x54])).copy(idatBuf, 4);

        const crcres2 = crc32(idatBuf.slice(4, idatBuf.length-4));
        crcres2.copy(idatBuf, idatBuf.length-4);

        bufs.push(idatBuf);
        bufs.push(PNG_END);

        return Buffer.concat(bufs);
    } // pack()
} // class Png

module.exports = Png;
