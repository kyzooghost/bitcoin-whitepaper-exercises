"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

const KEYS_DIR = path.join(__dirname,"keys");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

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

const maxBlockSize = 4;
const blockFee = 5;
var difficulty = 16;

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

let transactionPool = [];

addPoem();
processPool();
countMyEarnings();


// **********************************

	for (let line of poem) {
		transactionPool.push({
			data: line,
			fee: 1 + Math.floor(Math.random() * 10),
		})
	}
}

function processPool() {
	transactionPool.sort((a, b) => {return(b.fee - a.fee)}) //Sort transaction pool by descending order of fee

	let shifted_tx;
	
	while (transactionPool.length > 0) {
		let blockFee = transactionPool[0].fee
		let counter = 0;
		let selected_transactions = [{blockFee: blockFee, account: PUB_KEY_TEXT}]
	
		while ((counter < maxBlockSize) && (transactionPool[0].fee == blockFee)) {
			shifted_tx = transactionPool.shift();
			selected_transactions.push(createTransaction(shifted_tx))
			counter += 1;
			if (transactionPool.length == 0) {break}
		}
	
		Blockchain.blocks.push(createBlock(selected_transactions))
	}
}

function countMyEarnings() {
	// TODO: count up block-fees and transaction-fees
	let balance = 0;

	for (const block of Blockchain.blocks) {
		if (block.index != 0) {
			balance += block.data[0].blockFee * (block.data.length - 1)
		}
	}

	console.log("Earned: ", balance)
}

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
	while (true) {
		bl.nonce = Math.trunc(Math.random() * 1E7);
		let hash = crypto.createHash("sha256").update(
			`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp};${bl.nonce}`
		).digest("hex");

		if (hashIsLowEnough(hash)) {
			return hash;
		}
	}
}

function hashIsLowEnough(hash) {
	var neededChars = Math.ceil(difficulty / 4);
	var threshold = Number(`0b${"".padStart(neededChars * 4,"1111".padStart(4 + difficulty,"0"))}`);
	var prefix = Number(`0x${hash.substr(0,neededChars)}`);
	return prefix <= threshold;
}

function createTransaction(data) {
	var tr = {
		data,
	};

	tr.hash = transactionHash(tr);

	return tr;
}

function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr.data)}`
	).digest("hex");
}