"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

var Blockchain = require(path.join(__dirname,"blockchain.js"));

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.pub.pgp.key"),"utf8");
const PRIV_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.pub.pgp.key"),"utf8");

var wallet = {
	accounts: {},
};

addAccount(PRIV_KEY_TEXT_1,PUB_KEY_TEXT_1);
addAccount(PRIV_KEY_TEXT_2,PUB_KEY_TEXT_2);

// fake an initial balance in account #1
wallet.accounts[PUB_KEY_TEXT_1].outputs.push(
	{
		account: PUB_KEY_TEXT_1,
		amount: 42,
	}
);

main().catch(console.log);

// **********************************

async function main() {
	
	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/13
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*amount=*/5
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/31
	);
		
	try {
		await spend(
			/*from=*/wallet.accounts[PUB_KEY_TEXT_2],
			/*to=*/wallet.accounts[PUB_KEY_TEXT_1],
			/*amount=*/40
		);
	}
	catch (err) {
		console.log(err);
	}

	console.log(accountBalance(PUB_KEY_TEXT_1));
	console.log(accountBalance(PUB_KEY_TEXT_2));
	console.log(await Blockchain.verifyChain(Blockchain.chain));
}

function addAccount(privKey,pubKey) {
	wallet.accounts[pubKey] = {
		privKey,
		pubKey,
		outputs: []
	};
}

async function spend(fromAccount,toAccount,amountToSpend) {
	// TODO
	let trData = {
		inputs: [],
		outputs: [],
	};

	//sortedInput = Sorted array of fromAccount's outputs, in descending order of amount
	const sortedInputs = fromAccount.outputs.sort((a, b) => {return (b.amount - a.amount)});

	// What is the total of the UTXOs we have?
	let UTXO_total_amount = 0;

	// How much total UTXO will we spend?
	let spent_UTXO = 0;

	// How many UTXOs do we need to spend for amountToSpend?
	let UTXO_counter = 0;
	
	for (let input of sortedInputs) {
		if (UTXO_total_amount < amountToSpend) {
			UTXO_counter += 1 //Increment UTXO_counter by 1 with each loop that starts with UTXO_total_amount < amountToSpend
			spent_UTXO += input.amount //Increment spent_UTXO whenever UTXO_counter incremented
		} 
		UTXO_total_amount += input.amount;
	}

	//Throw error if UTXO_total_amount < amountToSpend
	if (UTXO_total_amount < amountToSpend) {
		throw `Don't have enough to spend ${amountToSpend}!`;
	}

	// Array of UTXOs we will spend
	const spent_sortedInputs = sortedInputs.slice(0, UTXO_counter);
	
	// Sign the UTXOs we will spend, and add them to trData.inputs
	for (let input of spent_sortedInputs) {
		const newInput = {...input}
		trData.inputs.push(await Blockchain.authorizeInput(newInput, fromAccount.privKey))
	}
 
	// Remove UTXOs for fromAccount (reassign to sliced array, with spent UTXOs removed)
	fromAccount.outputs = sortedInputs.slice(UTXO_counter);

	// Create new UTXO
	const newUTXO = {
			account: toAccount.pubKey,
			amount: amountToSpend,
	}

	// Push new UTXO to toAccount.outputs
	toAccount.outputs.push(newUTXO)

	// Push new UTXO to trData.outputs, sign it
	trData.outputs.push(await Blockchain.authorizeInput(newUTXO, toAccount.privKey))

	// If we have change, create the UTXO to represent the change
	if (amountToSpend < spent_UTXO) {
		const change_UTXO = {
			account: fromAccount.pubKey,
			amount: spent_UTXO - amountToSpend,
		}

		//Push change_UTXO to fromAccount.outputs
		fromAccount.outputs.push(change_UTXO)

		//Push change_UTXO to trData.outputs
		trData.outputs.push(await Blockchain.authorizeInput(change_UTXO, fromAccount.privKey))
	}

	// Create tr = {data, hash}
	let tr = Blockchain.createTransaction(trData);

	// Insert {data: tr} as new block
	Blockchain.insertBlock(
		Blockchain.createBlock([tr])
	);

	console.log("BLOCK CREATED, BLOCK LENGTH: ", Blockchain.chain.blocks.length)
}

function accountBalance(account) {
	let balance = 0;
	let wallet_accounts = Object.keys(wallet.accounts)

	if (wallet_accounts.includes(account)) {
		wallet.accounts[account].outputs.forEach(element => balance += element.amount)
	}	
	
	return balance;
}