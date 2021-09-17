"use strict";

var crypto = require("crypto");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

var Blockchain = {
	blocks: [],
};

var difficulty = 30;

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

for (let line of poem) {
	let bl = createBlock(line);
	Blockchain.blocks.push(bl);
	console.log(`Hash (Difficulty: ${difficulty}): ${bl.hash}`);

	difficulty++;
}

// **********************************

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
	// Want loop to repeat until hashIsLowEnough(hash) returns true

	while (true) {
		bl.nonce = Math.floor(Math.random() * 1E7)
		const hash = crypto.createHash("sha256").update(JSON.stringify(bl)).digest("hex");

		if (hashIsLowEnough(hash)) {
			return hash
		}
	}
	
	// TODO
}

function hashIsLowEnough(hash) {
	const hash_binary = hex2bin(hash)
	const hash_binary_substring = hash_binary.substring(0, difficulty)

	const empty = ''
	const difficulty_binary = empty.padStart(difficulty, '0')

	return(hash_binary_substring == difficulty_binary)
}

function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
	}

	return true;
}

function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!verifyBlock(bl)) return false;
		prevHash = bl.hash;
	}

	return true;
}

/* HELPER FUNCTIONS */

function hex2bin(hex){
	let out = "";

	for(let c of hex) {
        switch(c) {
            case '0': out += "0000"; break;
            case '1': out += "0001"; break;
            case '2': out += "0010"; break;
            case '3': out += "0011"; break;
            case '4': out += "0100"; break;
            case '5': out += "0101"; break;
            case '6': out += "0110"; break;
            case '7': out += "0111"; break;
            case '8': out += "1000"; break;
            case '9': out += "1001"; break;
            case 'a': out += "1010"; break;
            case 'b': out += "1011"; break;
            case 'c': out += "1100"; break;
            case 'd': out += "1101"; break;
            case 'e': out += "1110"; break;
            case 'f': out += "1111"; break;
            default: return "";
        }
	}

	return out;
}