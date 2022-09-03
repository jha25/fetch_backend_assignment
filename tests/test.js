/** @format */

const chai = require("chai")
const chaiHttp = require("chai-http")
const { expect, request, should } = chai
chai.use(chaiHttp)
const { parseResponse } = require("./util")

const API = `http://localhost:8000`

// Test case where all inputs are invalid
describe("Main Test - invalid inputs", () => {
	// Get balance
	it("Send a request to a wrong api", () => {
		chai
			.request(API)
			.get("/wrongapi/dog/cat")
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				expect(statusCode).to.equal(404)
			})
	})

	// Add transaction
	it("Send a transaction with only two keys", () => {
		const transaction = {
			payer: "DANNON",
			points: 1000,
		}
		chai
			.request(API)
			.post("/api/rewards")
			.send(transaction)
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				expect(statusCode).to.equal(422)
			})
	})

	// Spend points
	it("Spend more points than available", () => {
		chai
			.request(API)
			.put("/api/rewardst")
			.send({ points: 5000 })
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				expect(statusCode).to.equal(404)
			})
	})
})

// Test case where all inputs are valid
describe("Main Test - valid inputs", () => {
	// Add transaction
	it("Send 1 transaction", () => {
		const transaction = {
			payer: "DANNON",
			points: 1000,
			timestamp: "2020-11-02T14:00:00Z",
		}
		chai
			.request(API)
			.post("/api/rewards")
			.send(transaction)
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				expect(statusCode).to.equal(200)
				// expect(body).to.have.key("pointTransactions")
				// expect(body.pointTransactions).to.have.deep.members([transaction])
			})
	})

	it("Send 2nd transaction", () => {
		const transaction = {
			payer: "UNILEVER",
			points: 200,
			timestamp: "2020-10-31T11:00:00Z",
		}
		chai
			.request(API)
			.post("/api/rewards")
			.send(transaction)
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				expect(statusCode).to.equal(200)
				// expect(body).to.have.key("pointTransactions")
				// expect(body.pointTransactions).to.have.deep.members([transaction])
			})
	})

	it("Spend valid amount", () => {
		// At this point, you have 1000 points
		const spend = { points: 500 }
		chai
			.request(API)
			.put("/api/rewards")
			.send(spend)
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)

				console.log(`res: `, body.spendResult)

				const expectedResult = [{ payer: "DANNON", points: -500 }]
				expect(statusCode).to.equal(200)
				expect(body.spendResult).to.have.deep.members(expectedResult)
			})
	})

	it("Get current balance", () => {
		// At this point, you have 500 points left
		chai
			.request(API)
			.get("/api/rewards")
			.end((err, res) => {
				const { statusCode, body } = parseResponse(res)
				const expectedResult = {
					DANNON: 500,
				}
				expect(statusCode).to.equal(200)
				expect(body).to.deep.equal(expectedResult)
			})
	})
})
