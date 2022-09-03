/** @format */
const e = require("express")

// Validate payer is a string and only contains letters
const validatePayer = (input, type) => {
	isInputEmpty(input)
	if (type === "string" && input.length > 0) {
		for (let i = 0; i < input.length; i++) {
			let character = input[i]
			if (!character.match("^[a-zA-Z ]*$")) {
				return false
			}
		}
		return typeof input === "string"
	}
}

// Validate points is a numeric value and only contains numbers

const validatePoints = (input, type) => {
	isInputEmpty(input)
	if (type === "integer") {
		for (let i = 0; i < input.length; i++) {
			let element = input[i]
			if (isNaN(element)) {
				return false
			}
		}
		return typeof input === "number" && Number.isInteger(input)
	}
}

// Validate timestamp exist and in correct format
const validateTimestamp = (input) => {
	isInputEmpty(input)
	let isoDate = new Date(input)
	if (isoDate.getFullYear() && isoDate.getMonth() && isoDate.getDate()) {
		return true
	} else false
}

// Check field is filled
const isInputEmpty = (input) => {
	if (!input) {
		return false
	}
}

// Reuseable error handler to reduce repetitive code
const errorHandler = (message) => {
	const error = new Error(message)
	error.statusCode = 422
	throw error
}

// Reusable HTTP response
const httpResponse = (res, statusCode, err, message) => {
	return res.status(statusCode).json({ err, message })
}

module.exports = {
	validatePayer,
	validatePoints,
	validateTimestamp,
	errorHandler,
	httpResponse,
}
