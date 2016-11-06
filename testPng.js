'use strict';

const fs     = require('fs');
const crypto = require('crypto');
const PNG    = require('./png');
const PNGold = require('./pngold');


const img  = new PNG({width:2000, height:2000});

const data = crypto.randomBytes(img.data.length);

data.copy(img.data);



const imgold = new PNGold({width:2000, height:2000});

data.copy(imgold.data);

console.log( 0 === imgold.pack().compare(img.pack()) );
