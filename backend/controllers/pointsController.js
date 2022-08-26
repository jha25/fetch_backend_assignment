/** @format */
const asyncHandler = require("express-async-handler")

/* 
Thought process :
    pointsToSpend = 5000 
    i = 0
    { "payer": "DANNON", "points": 300 } 
    pointsToSpend: 4700
    { "payer": "DANNON", "points": -300 } // transactionMap
    { "DANNON": 800, ”UNILEVER” : 200, , "MILLER COOR": 10000} // payerSummaryBalance
    i = 1
    { "payer": “UNILEVER”, "points": 200 } 
    pointsToSpend: 4500
    { "payer": “UNILEVER”, "points": -200 } // transactionMap
    { "DANNON": 800, ”UNILEVER” : 0, , "MILLER COOR": 10000} // payerSummaryBalance

    i = 2
    { "payer": "DANNON", "points": -200 }
    pointsToSpend: 4700
    { "payer": "DANNON", "points": -100 }  // transactionMap
    { "DANNON": 1000, ”UNILEVER” : 0, , "MILLER COOR": 10000} // payerSummaryBalance

    i = 3
    { "payer": "MILLER COORS", "points": 10000}
    pointsToSpend: 0
    { "payer": "MILLER COORS", "points": -4700} // transactionMap
    { "DANNON": 1000, ”UNILEVER” : 0, , "MILLER COOR": 5300} // payerSummaryBalance
    i = 4
    { "payer": "DANNON", "points": 1000} // 0

    // Output
    { "DANNON": 1000, ”UNILEVER” : 0, , "MILLER COOR": 5300} // payerSummaryBalance
*/

// Array to store objects created, I am accustomed to using
// mongoose connected to MongoDB to create a schema
// but this is preferred on a local server
let pointTransactions = []

// Keep track of payer amount
let payerSummaryBalance = {}

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
	const { payer, points } = req.body

	// Validate that payer and points exist and entered, while
	// payer is a string and point is a number
	if (
		!payer ||
		!points ||
		typeof payer !== "string" ||
		isNaN(points) ||
		Object.keys(req.body).length !== 2
	) {
		errorHandler("Please input correct payer and/or points.")
	}

	// store payer, points and timestamp into object
	const transaction = { payer, points, timestamp: new Date() }
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
	res.status(200).json({
		pointTransactions,
	})
})

// @des Spend points
// @route PUT /api/rewards/:id
// @access Private
const spendPoints = asyncHandler(async (req, res) => {
	const { points } = req.body

	// Validate points exist and is a number
	if (Object.keys(req.body).length > 1 || !points || isNaN(points)) {
		errorHandler("Please input only numberical spend point requested.")
	}

	// total sum in the transaction array
	let sum = 0

	pointTransactions.forEach((transaction) => {
		sum += parseInt(transaction.points)
	})

	// Validate that there is sufficient points in transaction array
	if (sum < points) {
		errorHandler("Insufficient points available.")
	}

	// Sort transaction by ascending dates
	const sortedArr = pointTransactions.sort((a, b) => a.timestamp - b.timestamp)

	// Omit timestamp from sorted array
	const omittedTimestampArr = sortedArr.map((transaction) => {
		return {
			payer: transaction.payer,
			points: transaction.points,
		}
	})

	// Keep track of remaining points
	let pointsToSpend = points

	// transaction list to keep track of points contributed/spend
	// also better for lookup key and update values
	let transactionMap = {}
	// starting index to iterate through array until pointsToSpend achieved
	let startingIndex = 0

	// iterate through transaction array if points spend is not 0 or less.
	while (pointsToSpend > 0) {
		const transaction = omittedTimestampArr[startingIndex]
		// if transaction point meets points spend
		if (transaction.points >= pointsToSpend) {
			let remainingPoints = transaction.points - pointsToSpend
			// update transaction map and payer summary balance map
			// set pointToSpend to 0 to end loop
			if (transaction.points > pointsToSpend) {
				transactionMap[transaction.payer] = transactionMap[transaction.payer]
					? (transactionMap[transaction.payer] -= pointsToSpend)
					: pointsToSpend * -1
				payerSummaryBalance[transaction.payer] = remainingPoints
				pointsToSpend = 0
			}
		} else {
			// Does not meet spend so update values in transaction map
			// as well as payer summary balance until it does.
			pointsToSpend -= transaction.points
			transactionMap[transaction.payer] = transactionMap[transaction.payer]
				? (transactionMap[transaction.payer] -= transaction.points)
				: transaction.points * -1
			payerSummaryBalance[transaction.payer] -= transaction.points
			startingIndex++
		}
	}

	// Return transaction map
	res.status(200).json({
		transactionMap,
	})
})

// Reuseable error handler to reduce repetitive code
const errorHandler = (message) => {
	const error = new Error(message)
	error.statusCode = 422
	throw error
}

module.exports = { payerBalance, setTransaction, spendPoints }
