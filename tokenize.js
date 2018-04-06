let argumentCounts = {
	"MOV":   2,
	"ADD":   2,
	"SUB":   2,
	"MUL":   2,
	"DIV":   2,
	"INC":   1,
	"DEC":   1,
	"AND":   2,
	"OR":    2,
	"XOR":   2,
	"NOT":   1,
	"ROL":   1,
	"ROR":   1,
	"SHL":   1,
	"SHR":   1,
	"CMP":   2,
	"JMP":   1,
	"JZ":    1,
	"JNZ":   1,
	"JS":    1,
	"JNS":   1,
	"JO":    1,
	"JNO":   1,
	"CALL":  1,
	"RET":   0,
	"INT":   1,
	"IRET":  0,
	"PUSH":  1,
	"POP":   1,
	"PUSHF": 0,
	"POPF":  0,
	"IN":    1,
	"OUT":   1,
	"CLO":   0,
	"HALT":  0,
	"NOP":   0,
	"STI":   0,
	"CLI":   0,
	"ORG":   1,
	"DB":    1,
	"END":   0
};

function isWhitespace(chr) {
	return (
		// if it's a regular space
		chr === " " ||
		// if it's a tab
		chr === "\t" ||
		// if it's a newline
		chr === "\n"
	);
}

function nextWhitespace(str, pos) {
	let char = str[pos];

	while (isWhitespace(char)) {
		pos++;
		char = str[pos];
	}

	return [pos, char];
}

function nextToken(str, pos) {
	let char = str[pos];
	let token = "";

	if (char === `"`) {
		token += char;
		pos++;
		char = str[pos];

		while (char && char !== `"`) {
			token += char;
			pos++;
			char = str[pos];
		}

		token += char;
	} else {
		while (char && !isWhitespace(char)) {
			token += char;
			pos++;
			char = str[pos];
		}
	}


	return [pos, char, token];
}

function tokenize(str) {
	// tokenizer state
	let pos = 0;
	let res = [];

	while (pos < (str.length - 1)) {
		// tokenizer state
		let char = "";
		let token = "";
		// skip all whitespace characters until we find something
		// we can tokenize
		[pos, char] = nextWhitespace(str, pos);
		// grab the next token
		[pos, char, token] = nextToken(str, pos);

		// ignore comments in the assembly
		if (token[0] === ";") {
			// find the index of the next newline after the comment
			let lastNewline = str.indexOf("\n", pos);

			// if there's no new lines, we're done!
			if (lastNewline === -1) break;
			
			// otherwise, we skip over the comment and continue tokenizing.
			pos = lastNewline + 1;
			continue;
		}

		// convert to uppercase to aid string comparison
		token = token.toUpperCase();

		// check if this is a label
		let lastChar = token.substr(token.length - 1);

		// if it's a label, shtick it in there
		if (lastChar === ":") {
			res.push(token);
			continue;
		}

		// check is the instruction is invalid so we don't go any further
		// and throw a useful error
		if (!(token in argumentCounts)) {
			// grab the start location of the rogue instruction
			let loc = pos - token.length;
			let errmsg = `Unrecognised instruction "${token}" at position ${loc}`;
			let err = new Error(errmsg);
			err.location = loc;
			throw err;
		}

		// woo, you've made it to the next stage mr. token!
		res.push(token)

		// now, we deal with the arguments of the instruction.
		// we store an object with the number of expected arguments and
		// check against that.
		let argumentCount = argumentCounts[token]

		// if there's no argument, we can skip along to the next instruction
		if (argumentCount === 0) {
			pos++;
			continue;
		}

		// if there's one argument, we simply add it to the tokens list as-is.
		if (argumentCount === 1) {
			let token = "";
			[pos, char] = nextWhitespace(str, pos);
			[pos, char, token] = nextToken(str, pos);

			if (token === "") {
				let errmsg = `Expected argument at position ${pos}`
				let err = new Error(errmsg);
				err.location = pos;
				throw err;
			}

			res.push(token.toUpperCase());
		}

		// if there're two arguments, we need to check the first to ensure
		// it has a trailing comma. otherwise, instruction denied.
		if (argumentCount === 2) {
			let token = "";
			[pos, char] = nextWhitespace(str, pos);
			[pos, char, token] = nextToken(str, pos);

			if (token === "") {
				let errmsg = `Expected first argument at position ${pos}`
				let err = new Error(errmsg);
				err.location = pos;
				throw err;
			}

			let lastChar = token.substr(token.length - 1)

			// check to see if the first argument doesn't have a comma at the end
			// if it doesn't, we can't continue assembling; throw a useful err.
			if (lastChar !== ",") {
				let errmsg = `Expected "," at position ${pos}`;
				let err = new Error(errmsg);
				err.location = pos;
				throw err;
			}

			// if we reach here, all's well and good -- add the first argument
			// to the list of tokens. we strip the comma to make it easier
			// for the assembler.
			res.push(token.substr(0, token.length - 1).toUpperCase());

			token = "";
			[pos, char] = nextWhitespace(str, pos);
			[pos, char, token] = nextToken(str, pos);

			if (token === "") {
				let errmsg = `Expected second argument at position ${pos}`
				let err = new Error(errmsg);
				err.location = pos;
				throw err;
			}

			// add the second argument to the list of tokens.
			res.push(token.toUpperCase());
		}

		pos++;
	}

	return res;
}

if (typeof module !== "undefined") {
	module.exports = tokenize;
}
