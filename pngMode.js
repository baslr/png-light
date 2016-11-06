'use strict';

const sizes = [];
let   i     = 16;


while (i * i * 4 <= 16777216) { // 16 * 1024 * 1024 // 16 MiB
    sizes.push({
        bytes : i*i * 4,
        width : i,
        height: i
    });
    i += 2;
} // while


module.exports = (size, biggestOnly = false) => {
    if (!biggestOnly) {
        for(const s of sizes) {
            if (size <= s.bytes) {
                return Object.assign({}, s);
            } // if
        } // for
    } // if

    return Object.assign({}, sizes.slice(-1).pop() );
};
