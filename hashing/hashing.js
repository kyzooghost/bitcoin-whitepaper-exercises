"use strict";

var crypto = require("crypto");
const { appendFileSync } = require("fs");

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

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});
// TODO: insert each line into blockchain
let index_counter = 1;

for (let line of poem) {
	createBlock(line)
}

console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);

// Loop through each line of poem => Add as own block of data
// createBlock() => Take text, create an object for the block, compute hash, return block object, insert block array for the blockchain

// HELPER FUNCTIONS

function createBlock(line) {
	const temp_block = {
		index: index_counter++,
		prevHash: Blockchain.blocks[index_counter - 2].hash,
		data: line,
		timestamp: Date.now(),
	}

	const new_block = {...temp_block, hash: blockHash(temp_block)}

	Blockchain.blocks.push(new_block)
}

function blockHash(block) {
	return crypto.createHash("sha256").update(JSON.stringify(block)).digest("hex");
}

// function verifyChain(blockchain) {	
// 	// VERIfICATION
// 	const genesis_block = blockchain.blocks[0]
// 	if (genesis_block.hash !== "000000") {return false}
// 	if (genesis_block.index !== 0) {return false}
	
// 	const blockchain_tail = [...blockchain.blocks]
// 	blockchain_tail.shift()

// 	for (let block of blockchain_tail) {
// 		if (block.data === "") {return false}
// 		if (block.prevHash === "") {return false}
// 		if (block.index <= 0) {return false}
// 		if (block.index.isInteger == false) {return false}
// 		if (block.prevHash !== blockchain.blocks[block.index - 1].hash) {return false}

// 		if (block.hash !== blockHash({
// 			index: block.index,
// 			prevHash: block.prevHash,
// 			data: block.data,
// 			timestamp: block.timestamp,
// 		})) {return false}

// 	}

// 	return true
// }

function verifyBlock(block) {
	if (block.data === "" || block.prevHash === "") {
		console.log("a");
		return false;
	}
	else if (!Number.isInteger(block.index) && !block.index >= 0) {
		console.log("b");
		return false;
	}

	else if (!block.hash == blockHash(block)) {
		console.log("c");
		return false;
	}
	// console.log(Blockchain.blocks.hash[0]);
	else if (Blockchain.blocks[0].hash !== "000000"){
		console.log(!Blockchain.blocks[0].hash == "000000")
		console.log("d");
		return false;
	}
	return true;
}

function verifyChain(Blockchain) {
	for (let i = 1; i < Blockchain.blocks.length; i++) {
		if (!verifyBlock(Blockchain.blocks[i])) {
			console.log("e");
			return false;
		}
		if (Blockchain.blocks[i].prevHash !== Blockchain.blocks[i - 1].hash) {
			console.log("f");
			return false;
		}
	}
	return true;
}