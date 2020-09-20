const hri = require("human-readable-ids").hri;

module.exports = createGame = (req, res) => {
    const gameURL = hri.random();
    res.send(gameURL);
}