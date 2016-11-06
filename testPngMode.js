'use strict';

const assert = require('assert');

const pngMode = require('./pngMode');


assert.deepStrictEqual(pngMode(1023), {bytes: 1024, width: 16, height: 16});
assert.deepStrictEqual(pngMode(1024), {bytes: 1024, width: 16, height: 16});
assert.deepStrictEqual(pngMode(1025), {bytes: 1296, width: 18, height: 18});

assert.deepStrictEqual(pngMode(2048*2048*4-1), {bytes:2048*2048*4, width:2048, height:2048});
assert.deepStrictEqual(pngMode(2048*2048*4+1), {bytes:2048*2048*4, width:2048, height:2048});

assert.deepStrictEqual(pngMode(0, true),          {bytes:2048*2048*4, width:2048, height:2048});
assert.deepStrictEqual(pngMode(0xffffffff, true), {bytes:2048*2048*4, width:2048, height:2048});



assert.deepStrictEqual(pngMode(10000000), {bytes:1582*1582*4, width:1582, height:1582});

assert.deepStrictEqual(pngMode(1582*1582*4-1), {bytes:1582*1582*4, width:1582, height:1582});
assert.deepStrictEqual(pngMode(1582*1582*4),   {bytes:1582*1582*4, width:1582, height:1582});
assert.deepStrictEqual(pngMode(1582*1582*4+1), {bytes:1584*1584*4, width:1584, height:1584});
