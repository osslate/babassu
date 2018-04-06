const {test} = require("ava");
const tokenize = require("../tokenize")

test("returns empty array given an empty string", t => {
	let res = tokenize("");
	t.deepEqual(res, [])
})

test("tokenizes a well-formed instruction with no parameters", t => {
	let res = tokenize("clo");
	t.deepEqual(res, ["CLO"])
})

test("tokenizes a well-formed instruction with one parameter", t => {
	let res = tokenize("inc al");
	t.deepEqual(res, ["INC", "AL"])
})

test("tokenizes a well-formed instruction with two parameters", t => {
	let res = tokenize("mov al, 13");
	t.deepEqual(res, ["MOV", "AL", "13"])
})

test("tokenizes two well-formed instructions on same line", t => {
	let res = tokenize("mov al, 13 db 4A");
	t.deepEqual(res, ["MOV", "AL", "13", "DB", "4A"])
})

test("tokenizes two well-formed instructions seperated by newline", t => {
	let res = tokenize("mov al, 13\ndb 4A");
	t.deepEqual(res, ["MOV", "AL", "13", "DB", "4A"])
})

test("ignores extraneous whitespace characters", t => {
	let res = tokenize("   \n mov    al,    13 \t db      4A");
	t.deepEqual(res, ["MOV", "AL", "13", "DB", "4A"])
})

test("ignores comments", t => {
	let res = tokenize("mov al, 13 ;  hello\ndb 4A ;this should be ignored\n clo ; something");
	t.deepEqual(res, ["MOV", "AL", "13", "DB", "4A", "CLO"])
})