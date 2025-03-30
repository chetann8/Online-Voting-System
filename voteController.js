const db = require('../models/db');

exports.getVote = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    const voterId = req.session.user.voter_id;
    
    db.query('SELECT * FROM votes WHERE voter_id = ?', [voterId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        const alreadyVoted = results.length > 0;
        res.render('vote', { alreadyVoted });
    });
};

exports.submitVote = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const voterId = req.session.user.voter_id;
    const { party } = req.body;

    db.query('INSERT INTO votes (voter_id, party) VALUES (?, ?)', [voterId, party], (err) => {
        if (err) {
            console.error(err);
            return res.redirect('/vote?error=alreadyVoted');
        }
        res.redirect('/vote-details');
    });
};

exports.getVoteDetails = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const voterId = req.session.user.voter_id;
    
    db.query('SELECT party FROM votes WHERE voter_id = ?', [voterId], (err, results) => {
        if (err || results.length === 0) {
            return res.render('vote-details', { party: null });
        }
        res.render('vote-details', { party: results[0].party });
    });
};

exports.getResults = (req, res) => {
    db.query('SELECT party, COUNT(*) as votes FROM votes GROUP BY party', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('results', { results });
    });
};