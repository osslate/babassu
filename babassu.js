// CPUUU
class CPU {
	constructor(ram) {
		this.ram = ram;
		this.registers = {
			AL: 0x00,
			BL: 0x00,
			CL: 0x00,
			DL: 0x00
		};
	}
}

// this class is delegated to both representing the RAM
// to the CPU, and for managing the RAM view on the page.
class RAM {
	constructor(table) {
		this._table = table
		this._elements = [];
		this._lastElemChanged = null;
		this._addresses = generateAddressArray();
		this._initialiseTable();
		this._initialiseAddresses();
	}

	// TODO: combine initialiseTable and initialiseAddresses
	_initialiseTable() {
		for (let rowNumber = 0x00; rowNumber < 0x10; rowNumber++) {
			// create a row to store the first 16 elements in
			let row = document.createElement("tr");
			// add header for row
			let col = document.createElement("td")
			col.innerHTML = rowNumber.toString(16) + "0"
			row.appendChild(col);
			// create columns for each index in RAM
			for (let i = 0x00; i < 0x10; i++) {
				let col = document.createElement("td");
				col.innerHTML = "00";
				// store a reference to the column
				this._elements.push(col);
				row.appendChild(col);
			}

			this._table.appendChild(row)
		}
	}

	_initialiseAddresses() {
		for (let i = 0x00; i <= 0xFF; i++) {
			this._addresses[i] = 0x00;
		}
	}

	setAddress(address, value, highlight = true) {
		// change view
		if (this._lastElemChanged)
			this._lastElemChanged.classList = "";

		let tableVal = value.toString(16).padStart(2, "0");
		let elem = this._elements[address];
		this._lastElemChanged = elem;

		// highlight the current location in RAM by default
		// this is optional because we may be loading a program
		// into RAM, and not want it to highlight.
		if (highlight)
			elem.classList = "last-set";

		elem.innerText = tableVal;

		// change actual val
		this._addresses[address] = value;
	}
}

var ram;

document.addEventListener("DOMContentLoaded", () => {
	// initialise RAM matrix
	ram = new RAM(document.querySelector("#ram tbody"))

	let assembleButton = document.querySelector("#assemble");
	let textarea = document.querySelector("#input");

	textarea.value = "; to get started, input some samphire-compatible\n; assembly below.\n\n; hit the assemble button to assemble it (duh!)"

	let status = document.querySelector("#status")
	let statusMsg = document.querySelector("#status p")

	let log = {
		info: (msg) => {
			status.classList = "good";
			statusMsg.innerText = msg;
		},
		error: (msg) => {
			status.classList = "bad";
			statusMsg.innerText = msg;
		}
	}

	log.info("Ready to assemble.")

	assembleButton.addEventListener("click", () => {
		let input = textarea.value;
		let tokens, program;

		try {
			tokens = tokenize(input);
		} catch (e) {
			return log.error("tokenizer: " + e.message);
		}

		try {
			program = assemble(tokens);
		} catch (e) {
			return log.error("assembler: " + e.message);
		}

		program.forEach((byte, i) => ram.setAddress(i, byte))

		log.info("Program assembled successfully.")
	})
});
