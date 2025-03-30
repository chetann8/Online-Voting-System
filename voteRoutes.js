const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/vote', voteController.getVote);
router.post('/vote', voteController.submitVote);
router.get('/vote-details', voteController.getVoteDetails);
router.get('/results', voteController.getResults);

module.exports = router;