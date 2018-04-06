const {test} = require("ava");
const {parseArgument, registerCodes} = require("../assembler");

for (let register of ["AL", "BL", "CL", "DL"]) {

	test(`parse valid register ${register}`, t => {

		let expected = {
			type: "register",
			value: registerCodes[register]
		}

		let result = parseArgument(register);
		t.deepEqual(result, expected);
	})

	test(`parse valid register ${register} as address pointer`, t => {

		let expected = {
			type: "registerPointer",
			value: registerCodes[register]
		}

		let result = parseArgument(`[${register}]`);
		t.deepEqual(result, expected);
	})
}

test("parse an empty byte sequence (used in DB)", t => {

	let expected = {
		type: "byteSequence",
		value: ""
	}

	let result = parseArgument(`""`);
	t.deepEqual(result, expected);
})

test("parse a byte sequence (used in DB)", t => {

	let expected = {
		type: "byteSequence",
		value: "hello world"
	}

	let result = parseArgument(`"hello world"`);
	t.deepEqual(result, expected);
})

test("parse all valid hex number arguments (padded)", t => {

	for (let i = 0x00; i <= 0xFF; i++) {
		
		let expected = {
			type: "number",
			value: i
		}

		let val = i.toString(16).padStart(2, "0").toUpperCase();
		let result = parseArgument(val)

		t.deepEqual(result, expected);
	}
})

test("parse numbers 0-F (unpadded)", t => {

	for (let i = 0x00; i <= 0x0F; i++) {

		let expected = {
			type: "number",
			value: i
		}

		let val = i.toString(16).toUpperCase();
		let result = parseArgument(val);

		t.deepEqual(result, expected);
	}
})