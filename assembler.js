const registerCodes = {
	"AL": 0x00,
	"BL": 0x01,
	"CL": 0x02,
	"DL": 0x03
};

function generateAddressArray(vduAddresses = false) {
	let arr = [];

	if (!vduAddresses) {
		for (let i = 0x00; i <= 0xFF; i++) {
			arr[i] = 0x00;
		}
	} else {
		for (let i = 0x00; i <= 0xFF; i++) {
			arr[i] = (i >= 0xC0) ? 0x20 : 0x00;
		}
	}

	return arr;
}

function parseArgument(token) {
	let addrRegex = /^\[([0-9A-F]{1,2})\]$/;
	let regRegex = /^(AL|BL|CL|DL)$/;
	let byteSeqRegex = /^"([^\n\t]{0,})"$/;
	let numRegex = /^([0-9A-F]{1,2})$/;
	let regAddrRegex = /^\[(AL|BL|CL|DL)\]$/;

	let addrGroups = token.match(addrRegex);

	if (addrGroups) {
		return {
			type: "address",
			value: parseInt(addrGroups[1], 16)
		}
	}

	let regGroups = token.match(regRegex);

	if (regGroups) {
		let name = regGroups[1];
		let val = registerCodes[name];

		return {
			type: "register",
			value: val
		}
	}

	let byteSeqGroups = token.match(byteSeqRegex);

	if (byteSeqGroups) {
		return {
			type: "byteSequence",
			value: byteSeqGroups[1]
		}
	}

	let numRegexGroups = token.match(numRegex);

	if (numRegexGroups) {
		return {
			type: "number",
			value: parseInt(numRegexGroups[1], 16)
		}
	}

	let regAddrGroups = token.match(regAddrRegex);

	if (regAddrGroups) {
		let name = regAddrGroups[1];
		let val = registerCodes[name];

		return {
			type: "registerPointer",
			value: val
		}
	}

	return {
		type: "illegal",
		value: null
	}
}

class ArgError extends Error {
	constructor(instruction, args) {
		super();
		this.instruction = instruction + args.join(", ");
		this.message = `Invalid argument at "${this.instruction}"`
		this.instruction = instruction;
		this.args = args;
	}
}

const opcodeMappings = {
	// arithmetic/logic
	"ADD": [0xA0, 0xB0],
	"SUB": [0xA1, 0xB1],
	"MUL": [0xA2, 0xB2],
	"DIV": [0xA3, 0xB6],
	"AND": [0xAA, 0xBA],
	"OR":  [0xAB, 0xBB],
	"XOR": [0xAC, 0xBC],
	// bleugh
	"INC": 0xA4,
	"DEC": 0x05,
	"NOT": 0xAD,
	"ROL": 0x9A,
	"ROR": 0x9B,
	"SHL": 0x9C,
	"SHR": 0x9D
}

function getArithmeticOpcode(token, dest, src) {
	switch (dest.type) {
		case "register":
			switch (src.type) {
				case "register":
					return opcodeMappings[token][0];
				case "number":
					return opcodeMappings[token][1];
				default:
					return null;
			}
		default:
			return null;
	}
}

function getMovOpcode(dest, src) {
	switch (dest.type) {
		case "register":
			switch (src.type) {
				case "number":
					return 0xD0;
				case "address":
					return 0xD1;
				case "registerPointer":
					return 0xD3;
				default:
					throw null;
			}
			break;

		case "address":
			switch (src.type) {
				case "register":
					return 0xD2;
				default:
					return null;
			}
			break;

		case "registerPointer":
			switch (src.type) {
				case "register":
					return 0xD4;
				default:
					return null;
			}
			break;
	}
}



function getOpcode(token, dest, src) {
	switch (token) {
		case "MOV":
			return getMovOpcode(dest, src);
		case "ADD":
		case "SUB":
		case "MUL":
		case "DIV":
		case "AND":
		case "OR":
		case "XOR":
			return getArithmeticOpcode(token, dest, src);
	}

	return null;
}

function assemble(tokens) {
	var tokenPos = 0;
	var gotEnd = false;
	var lastTokenPos = tokens.length - 1;
	let addresses = generateAddressArray(true);
	let addrPos = 0;

	while (true) {
		let token = tokens[tokenPos].toUpperCase();
		
		// stop assembling when we receive an "END" instruction
		if (token === "END") {
			break;
		}

		// if we're at the last token and it isn't "end", assembly
		// was unsuccessful.
		if (tokenPos === lastTokenPos) {
			throw new Error(`"END" instruction missing`)
		}

		// we may not have two arguments, but we'll store these as a ref
		// here to avoid unecessary repetition later
		let arg1 = tokens[tokenPos + 1];
		let arg2 = tokens[tokenPos + 2];

		/*----------------- INSTRUCTIONS ----------------*/

		let opcode, dest, src, target;

		switch (token) {
			case "MOV":
			case "ADD":
			case "SUB":
			case "MUL":
			case "DIV":
			case "AND":
			case "OR":
			case "XOR":
				dest = parseArgument(arg1)
				src = parseArgument(arg2);

				opcode = getOpcode(token, dest, src);

				if (opcode === null) {
					throw new ArgError(token, [arg1, arg2]);
				}

				addresses[addrPos] = opcode;
				addresses[addrPos + 1] = dest.value;
				addresses[addrPos + 2] = src.value;

				tokenPos++;
				addrPos++;

				break;

			case "INC":
			case "DEC":
			case "NOT":
			case "ROL":
			case "ROR":
			case "SHL":
			case "SHR":
				target = parseArgument(arg1);

				if (target.type !== "register") {
					throw new ArgError(token, [arg1, arg2]);
				}

				opcode = opcodeMappings[token];

				addresses[addrPos] = opcode;
				addresses[addrPos + 1] = target.value;

				break;
		}


		tokenPos++;
		addrPos++;
	}

	return addresses;
}

if (typeof module !== "undefined") {
	module.exports = {assemble, parseArgument, registerCodes};
}