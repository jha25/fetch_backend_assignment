/** @format */

// Parses response object and return something // TODO: re-write it
const parseResponse = (res) => {
	return {
		statusCode: res.statusCode,
		body: res.body,
	}
}

module.exports = { parseResponse }
