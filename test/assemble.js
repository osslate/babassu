const {test} = require("ava");
const tokenize = require("../tokenize");
const {assemble} = require("../assembler");

let validInstructions = {
	// MOV
	"MOV AL, 15":   [0xD0, 0x00, 0x15],
	"MOV BL, [15]": [0xD1, 0x01, 0x15],
	"MOV [15], CL": [0xD2, 0x15, 0x02],
	"MOV DL, [AL]": [0xD3, 0x03, 0x00],
	"MOV [CL], AL": [0xD4, 0x02, 0x00],
	// ADD
	"ADD AL, BL":   [0xA0, 0x00, 0x01],
	"ADD AL, 12":   [0xB0, 0x00, 0x12],
	// SUB
	"SUB BL, CL":   [0xA1, 0x01, 0x02],
	"SUB BL, 15":   [0xB1, 0x01, 0x15],
	// MUL
	"MUL CL, DL":   [0xA2, 0x02, 0x03],
	"MUL CL, 03":   [0xB2, 0x02, 0x03],
	// DIV
	"DIV DL, AL":   [0xA3, 0x03, 0x00],
	"DIV DL, 02":   [0xB6, 0x03, 0x02],
	// AND
	"AND AL, BL":   [0xAA, 0x00, 0x01],
	"AND AL, 10":   [0xBA, 0x00, 0x10],
	// OR
	"OR CL, BL":    [0xAB, 0x02, 0x01],
	"OR CL, F0":    [0xBB, 0x02, 0xF0], 
	// XOR
	"XOR AL, BL":   [0xAC, 0x00, 0x01],
	"XOR AL, AA":   [0xBC, 0x00, 0xAA],
	// INC
	"INC DL":       [0xA4, 0x03],
	// DEC
	"DEC AL":       [0x05, 0x00],
	// NOT
	"NOT BL":       [0xAD, 0x01],
	// ROL
	"ROL AL":       [0x9A, 0x00],
	// ROR
	"ROR BL":       [0x9B, 0x01],
	// SHL
	"SHL CL":       [0x9C, 0x02],
	// SHR
	"SHR DL":       [0x9D, 0x03],
	// CMP

};

for (let instruction of Object.keys(validInstructions)) {

	test(`successful assembly of "${instruction}"`, t => {
		let expected = validInstructions[instruction];
		t.plan(expected.length);
		let tokens = tokenize(instruction + " END");
		let result = assemble(tokens);

		for (let index of expected.keys()) {
			let val = expected[index];
			t.is(result[index], val);
		}
	});
}

test("assemble two instructions", t => {
	let asm = ["MOV BL, 15", "ROL CL", "END"];
	let expected = [0xD0, 0x01, 0x15, 0x9A, 0x02];
	let tokens = tokenize(asm.join("\n"));
	let result = assemble(tokens);

	for (let index of expected.keys()) {
		let val = expected[index];
		t.is(result[index], val);
	}
})

test("assemble five instructions", t => {
	let asm = ["MOV BL, 15", "ROL CL", "INC DL", "OR CL, BL", "SHR DL", "END"];
	let expected = [0xD0, 0x01, 0x15, 0x9A, 0x02, 0xA4, 0x03, 0xAB, 0x02, 0x01, 0x9D, 0x03];
	let tokens = tokenize(asm.join("\n"));
	let result = assemble(tokens);

	for (let index of expected.keys()) {
		let val = expected[index];
		t.is(result[index], val);
	}
})



