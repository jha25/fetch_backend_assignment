/** @format */

const express = require("express")
const router = express.Router()

// Logic route from controller
const {
	payerBalance,
	setTransaction,
	spendPoints,
} = require("../controllers/pointsController")

// GET/POST/PUT route imported from controller
router.route("/").get(payerBalance).post(setTransaction).put(spendPoints)

module.exports = router
