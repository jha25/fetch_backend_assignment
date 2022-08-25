/** @format */
const asyncHandler = require("express-async-handler")

let totalPointsBalance = 0
let payerPointsBalance = {}
let pointTransactions = []

// @des Get balance
// @route GET /api/rewards
// @access Private
const payerBalance = asyncHandler(async (req, res) => {
	res.status(200).json(payerPointsBalance)
})

// @des Set balance
// @route POST /api/rewards
// @access Private
const setTransaction = asyncHandler(async (req, res) => {
	let points = req.body.points

	res.status(200).json(balance)
})
// @des Spend points
// @route DELETE /api/rewards/:id
// @access Private
const spendPoints = asyncHandler(async (req, res) => {
	res.status(200).json({
		message: `Congrats on spending your Fetch Rewards!`,
	})
})
// @des Update Balance
// @route PUT /api/rewards/:id
// @access Private
const updateBalance = asyncHandler(async (req, res) => {
	res.status(200).json({ message: "Balance updated." })
})

module.exports = { payerBalance, setTransaction, spendPoints, updateBalance }
