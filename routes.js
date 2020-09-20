const express = require("express");

const createGame = require("./game");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("This is server").status(200);
});

router.post("/g", (req, res) => {
    createGame(req, res);
});

module.exports = router;