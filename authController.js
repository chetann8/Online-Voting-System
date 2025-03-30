const bcrypt = require('bcryptjs');
const db = require('../models/db');

exports.getLogin = (req, res) => res.render('login');
exports.getRegister = (req, res) => res.render('register');

exports.postRegister = (req, res) => {
    const { voter_id, password, secret_question, secret_answer } = req.body;

    db.query('SELECT * FROM users WHERE voter_id = ?', [voter_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length > 0) {
            return res.send('Voter ID already registered');
        }

        bcrypt.hash(password, 10, (hashErr, hash) => {
            if (hashErr) {
                console.error(hashErr);
                return res.status(500).send('Error hashing password');
            }

            db.query(
                'INSERT INTO users (voter_id, password, secret_question, secret_answer) VALUES (?, ?, ?, ?)', 
                [voter_id, hash, secret_question, secret_answer], 
                (insertErr) => {
                    if (insertErr) {
                        console.error(insertErr);
                        return res.send('Error Registering');
                    }
                    res.redirect('/auth/login');
                }
            );
        });
    });
};

exports.postLogin = (req, res) => {
    const { voter_id, password } = req.body;

    db.query('SELECT * FROM users WHERE voter_id = ?', [voter_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.send('Voter ID not found');
        }

        bcrypt.compare(password, results[0].password, (error, match) => {
            if (match) {
                req.session.user = { voter_id: results[0].voter_id };
                res.redirect('/vote');
            } else {
                res.send('Invalid credentials');
            }
        });
    });
};

exports.getResetPassword = (req, res) => res.render('reset-password');

exports.postResetPassword = (req, res) => {
    const { voter_id, secret_question, secret_answer, new_password } = req.body;

    db.query('SELECT * FROM users WHERE voter_id = ?', [voter_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.send('Voter ID not found');
        }

        const user = results[0];

        if (user.secret_question !== secret_question || user.secret_answer !== secret_answer) {
            return res.send('Incorrect details');
        }

        bcrypt.hash(new_password, 10, (hashErr, hash) => {
            if (hashErr) {
                console.error('Hashing error:', hashErr);
                return res.status(500).send('Error processing request');
            }

            db.query(
                'UPDATE users SET password = ? WHERE voter_id = ?',
                [hash, voter_id],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Update error:', updateErr);
                        return res.status(500).send('Failed to update password');
                    }
                    res.send('Password reset successful. <a href="/auth/login">Login</a>');
                }
            );
        });
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};
