/** @format */

const express = require("express")
const router = express.Router()
const {
	payerBalance,
	setTransaction,
	spendPoints,
	updateBalance,
} = require("../controllers/pointsController")

router.route("/").get(payerBalance).post(setTransaction)
router.route("/:id").delete(spendPoints).put(updateBalance)

module.exports = router
