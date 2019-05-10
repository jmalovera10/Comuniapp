const jwtSecret = require('./config/passport/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('./config/mongoose/conf');
const Table = require('./config/mongoose/table');

/**
 * Method meant to register a user
 * @param req
 * @param res
 * @param next
 */
exports.signupUser = (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            res.send(info);
        } else {
            req.logIn(user, err => {
                const data = {
                    name: req.body.name,
                    lastname: req.body.lastname,
                    email: req.body.email,
                };
                User.findOne({email: data.email})
                    .then((user) => {
                        user.updateOne({
                            name: data.name,
                            lastname: data.lastname
                        }).then(() => {
                            console.log('user created in db');
                            const token = jwt.sign({id: user._id}, jwtSecret.secret, {expiresIn: '1h'});
                            return res.status(200).send({
                                message: null,
                                auth: true,
                                token: token,
                                id: user._id
                            });
                        });
                    });
            });
        }
    })(req, res, next);
};

/**
 * Method meant to login a user
 * @param req
 * @param res
 * @param next
 */
exports.loginUser = (req, res, next) => {
    console.log(req.body);
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            res.send(info);
        } else {
            req.logIn(user, err => {
                User.findOne({email: req.body.email}).then(user => {
                    const token = jwt.sign({id: user._id}, jwtSecret.secret, {expiresIn: '2h'});
                    return res.status(200).send({
                        auth: true,
                        token: token,
                        message: null,
                        id: user._id
                    });
                });
            });
        }
    })(req, res, next);
};

/**
 * Method meant to find a user from a given token
 * @param req
 * @param res
 * @param next
 */
exports.findUser = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            return res.status(400).send("Unauthorized");
        } else {
            console.log('user found in db from route');
            return res.status(200).send({
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                _id: user._id,
            });
        }
    })(req, res, next);
};

/**
 * Method meant to retrieve all available tables from the database
 * @param req
 * @param res
 * @param user
 */
exports.getTables = (req, res, user) => {
    Table.find().then((tables) => {
        return res.status(200).json(tables);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to retrieve all available tables from the database
 * @param req
 * @param res
 * @param user
 */
exports.reserveSeat = (req, res, user) => {
    let userId = user._id;
    let tableId = req.params.tableId;

    Table.findById(tableId).then((table) => {
        let seats = table.SEATS;
        let occupied = false;
        let seatId = undefined;
        seats = seats.map((s) => {
            if (s.STATUS === 'FREE' && !occupied) {
                s.STATUS = 'RESERVED';
                occupied = true;
                seatId = s.SEAT_ID;
                seats.AVAILABLE_SEATS -= 1;
            }
            return s;
        });
        table.SEATS = seats;
        table.save();
        User.findById(userId).then((user) => {
            user.RESERVATION = {
                TABLE_ID: tableId,
                SEAT_ID: seatId
            };
            user.save();
            return res.status(200).json({
                tableId: tableId,
                seatId: seatId,
                reservationStatus: true
            });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({reservationStatus: false})
    });
};

/**
 * Method meant to retrieve all available tables from the database
 * @param req
 * @param res
 * @param user
 */
exports.getTableForModules = (req, res, user) => {
    let tableId = req.params.tableId;
    Table.findOne({TABLE_ID: tableId}).then((tables) => {
        return res.status(200).json(tables);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to insert a table into the database
 * @param req
 * @param res
 */
exports.insertTable = (req, res) => {
    console.log("INSERTION IN PROCESS");
    let tableId = req.params.tableId;
    let name = req.body.NAME;
    let seats = req.body.SEATS;
    let availableSeats = req.body.AVAILABLE_SEATS;
    Table.findOne({TABLE_ID: tableId}).then((table) => {
        console.log(table);
        if (table) {
            console.log(`Table found: ${table}`);
            return res.status(200).send(table);
        } else {
            let table = new Table();
            table.TABLE_ID = tableId;
            table.NAME = name;
            table.SEATS = seats;
            table.AVAILABLE_SEATS = availableSeats;
            table.save((err) => {
                if (err)
                    throw err;
            });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({message: "Something went wrong with the db"});
    });
};

/**
 * Method meant to insert a table into the database
 * @param req
 * @param res
 */
exports.updateSeat = (req, res) => {
    let tableId = req.params.tableId;
    let seatId = req.body.SEAT_ID;
    let status = req.body.STATUS;
    Table.findOne({TABLE_ID: tableId}).then((table) => {
        if (table) {
            let seats = table.SEATS;
            let newSeats = [];
            seats.forEach((s) => {
                if (s.SEAT_ID === seatId) {
                    newSeats.push({
                        SEAT_ID: seatId,
                        STATUS: status
                    });
                } else {
                    newSeats.push(s);
                }
            });
            table.SEATS = newSeats;
            table.save((err) => {
                if (err)
                    throw err;
            });
            return res.status(200).send(req.body);
        } else {
            return res.status(500).send({message: "Table doesn't exist"});
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({message: "Something went wrong with the db"});
    });
};