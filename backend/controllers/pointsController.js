/** @format */
const asyncHandler = require("express-async-handler")
const {
	validatePayer,
	validatePoints,
	validateTimestamp,
	errorHandler,
} = require("../utils/index")

// Array to store objects created, I am accustomed to using
// mongoose connected to MongoDB to create a schema
// but this is preferred on a local server
let pointTransactions = []

// Keep track of payer amount
let payerSummaryBalance = {}

// total Sum
let totalSum = 0

// spend call results
let spendResult = []

// @des Get transaction
// @route GET /api/rewards
// @access Private
const payerBalance = asyncHandler(async (req, res) => {
	// Validate that array has at least 1 object stored
	if (pointTransactions.length < 1 || payerSummaryBalance.length < 1) {
		errorHandler("There is no transaction available")
	}

	// Return payer summary balance list
	res.status(200).json(payerSummaryBalance)
})

// @des Set transaction
// @route POST /api/rewards
// @access Private
const setTransaction = asyncHandler(async (req, res) => {
	// Validate fields are no empty
	if (!req || !req.body) {
		errorHandler("Input field not filled")
	}

	const { payer, points, timestamp } = req.body
	const pointsAmt = parseInt(points)

	// Validate that payer, points, timestamp exist and entered, while
	// payer is a string, point is a number, timestamp is date
	// input field can only be length 3

	if (Object.keys(req.body).length !== 3) {
		errorHandler("Please fill out only payer, points, and timestamp field")
	}

	if (!validatePayer(payer, "string")) {
		errorHandler("Please input payer name")
	}

	if (!validatePoints(pointsAmt, "integer")) {
		errorHandler("Please input points amount")
	}

	if (!validateTimestamp(timestamp)) {
		errorHandler("Please input date")
	}

	// store payer, points and timestamp into object
	const transaction = { payer, points: pointsAmt, timestamp }
	// store transaction object into global array
	pointTransactions.push(transaction)

	// Update payer points
	payerSummaryBalance[transaction.payer] = payerSummaryBalance[
		transaction.payer
	]
		? parseInt(
				(payerSummaryBalance[transaction.payer] += parseInt(
					transaction.points,
				)),
		  )
		: parseInt(transaction.points)

	// Return message that transaction completed
	res.status(200).json({ message: "Transaction completed" })
})

// @des Spend points
// @route PUT /api/rewards
// @access Private
const spendPoints = asyncHandler(async (req, res) => {
	const { points } = req.body
	if (!req.body) {
		errorHandler("Please fill out points field")
	}

	const pointsToSpend = parseInt(points)

	// Validate points exist and is a number

	if (
		!validatePoints(pointsToSpend, "integer") ||
		Object.keys(req.body).length > 1 ||
		pointsToSpend <= 0
	) {
		errorHandler("Please input points amount to be spent")
	}

	// total sum in the transaction array
	totalSum = pointTransactions.reduce((acc, cur) => {
		return (acc += cur.points)
	}, 0)

	// Validate that there is sufficient points in transaction array
	if (totalSum < pointsToSpend) {
		errorHandler("Insufficient points available.")
	}

	// Sort transaction by ascending dates
	const sortedByTimestampArr = pointTransactions.sort(
		(objA, objB) => objA.timestamp - objB.timestamp,
	)

	// Omit timestamp from sorted array
	const omittedTimestampArr = sortedByTimestampArr.map((transaction) => {
		return {
			payer: transaction.payer,
			points: transaction.points,
		}
	})

	// Keep track of remaining points
	let remainingPoints = pointsToSpend

	// transaction list to keep track of points contributed/spend
	// also better for lookup key and update values
	let transactionMap = {}
	// starting index to iterate through array until pointsToSpendRemain achieved
	let startingIndex = 0

	// iterate through transaction array if points spend is not 0 or less.
	while (remainingPoints > 0) {
		const transaction = omittedTimestampArr[startingIndex]
		// if transaction point meets points spend
		if (transaction.points >= remainingPoints) {
			// update transaction map and payer summary balance map
			// set pointToSpend to 0 to end loop
			totalSum -= remainingPoints
			transactionMap[transaction.payer] = transactionMap[transaction.payer]
				? (transactionMap[transaction.payer] -= remainingPoints)
				: remainingPoints * -1
			payerSummaryBalance[transaction.payer] =
				transaction.points - remainingPoints
			remainingPoints = 0
		} else {
			// Does not meet spend so update values in transaction map
			// as well as payer summary balance until it does.
			remainingPoints -= transaction.points
			totalSum -= transaction.points
			transactionMap[transaction.payer] = transactionMap[transaction.payer]
				? (transactionMap[transaction.payer] -= transaction.points)
				: transaction.points * -1
			payerSummaryBalance[transaction.payer] -= transaction.points
			startingIndex++
		}
	}

	for (const [key, value] of Object.entries(transactionMap)) {
		spendResult.push({ payer: key, points: value })
	}

	// Return transaction map
	res.status(200).json({ spendResult })
})

module.exports = { payerBalance, setTransaction, spendPoints }
