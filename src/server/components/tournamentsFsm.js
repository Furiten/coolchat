var http = require('http');
var Base64 = require('../../common/base64');
var PRIVATE_KEY = '2366211612778221';
var STAT_HOST = 'online-june2016.furiten.ru';
var TOURN_GAMES_COUNT = 8;

var reservedBots = {
    'Alfa-Tom': false, // true if bot is busy now
    'Beta-Zef': false,
    'Gamma-Ke': false,
    'Delta-Se': false
};

function makePost(path, data) {
    return new Promise(function (resolve, reject) {
        var options = {
            hostname: STAT_HOST,
            port: 80,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('Requesting ' + path + ' with ' + JSON.stringify(data));
        var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            var out = '';
            res.on('data', function (body) {
                out += body;
            });
            res.on('end', function () {
                try {
                    var resp = JSON.parse(out);
                    console.log('Server responded: ', resp);
                    if (resp.code == 200) {
                        resolve(resp.data);
                    } else {
                        reject(resp);
                    }
                } catch (e) {
                    console.log('Something bad happened! JSON Parse failed?', e);
                    console.log('Server reply was ', out);
                }
            });
        });

        req.on('error', function (e) {
            console.log('Server errored: ', e);
            reject(e.message);
        });

        req.write(JSON.stringify(data));
        req.end();
    });
}


var stages = {
    TOURN_NOT_STARTED: 1,

    SORTITION_READY: 2,
    SEATING_STARTED: 3,
    GAMES_STARTED: 4,
    COFFEEBREAK: 5,

    FINAL_SORTITION_READY: 6,
    FINAL_SEATING_STARTED: 7,
    FINAL_GAME_STARTED: 8,
    FINAL_GAME_OVER: 9,

    TOURN_FINISHED: 10,
    TOURN_PAUSED: 11
};

var coffebreakIntervals = {
    SMALL: 5 * 60 * 1000, // 5 min
    BIG: 30 * 60 * 1000 // 30 min
};

module.exports = function () {
    var stateChangeCb = function () {
    };
    var tableStartCb = function () {
    };
    var state = { // defaults
        'stage': stages.TOURN_NOT_STARTED,
        'gamesFinished': 0,
        'totalPlayedGames': 0,
        'coffeebreakStartedAt': null,
        'currentSeating': null
    };

    var actions = {
        'RESET_TOURNAMENT': function(state, payload, cb) {
            cb(null, {
                'stage': stages.TOURN_NOT_STARTED,
                'gamesFinished': 0,
                'totalPlayedGames': 0,
                'coffeebreakStartedAt': null,
                'currentSeating': null
            });
        },

        'START_TOURNAMENT': function (state, payload, cb) {
            if (state.stage != stages.TOURN_NOT_STARTED) {
                cb({message: 'Tournament already started'});
                return;
            }

            makeSortition(function (e, sortition) {
                if (e) {
                    cb(e);
                    return;
                }

                cb(null, Object.assign(state, {
                    stage: stages.SORTITION_READY,
                    currentSeating: sortition
                }));
            });
        },

        'START_SEATING': function (state, payload, cb) {
            if (state.stage != stages.SORTITION_READY) {
                cb({message: 'Sortition is not ready! Cannot start seating'});
                return;
            }

            function start(idx) { // serial table start function, delays by 2sec
                if (idx >= state.currentSeating.length) { // all done
                    tableStartCb(null, null, {success: true, allTablesStarted: true});
                    cb(null, Object.assign(state, {
                        stage: stages.GAMES_STARTED
                    }));
                    return;
                }

                startSingleTable(state.currentSeating[idx]).then(function() {
                    console.log('Table #' + idx + ' started successfully');
                    setTimeout(function() {
                        start(idx+1);
                    }, 2000);
                }).catch(function(e) {
                    console.log('Starting table failed: ', e);
                });
            }

            cb(null, Object.assign(state, {
                stage: stages.SEATING_STARTED
            }));

            start(0);
        },

        'GAME_ENDED': function (state, payload, cb) {
            if (state.stage != stages.GAMES_STARTED || state.stage != stages.FINAL_GAME_STARTED) {
                cb({message: 'Can\'t add finished game while no or not all games are started'});
                return;
            }

            registerGame(payload.link, function (e, result) {
                if (e) {
                    cb(e);
                    return;
                }

                if (payload.onSuccess) payload.onSuccess(result);

                finishGame(state, cb);
            });
        },

        'START_FINAL_SEATING': function (state, payload, cb) {
            if (state.stage != stages.FINAL_SORTITION_READY) {
                cb({message: 'Final sortition is not ready! Cannot start seating'});
                return;
            }

            startSingleTable(state.currentSeating).then(function () {
                cb(null, Object.assign(state, {
                    stage: stages.FINAL_GAME_STARTED
                }));
            });

            cb(null, Object.assign(state, {
                stage: stages.FINAL_SEATING_STARTED
            }));
        },

        'PAUSE_TOURNAMENT': function (state, payload, cb) {
            if (state.stage != stages.COFFEEBREAK &&
                state.stage != stages.GAMES_STARTED &&
                state.stage != stages.FINAL_GAME_STARTED
            ) {
                cb({message: 'Can\'t pause tournament while some requests running! Wait 5 secs and try again'});
                return;
            }

            clearInterval(state.coffeebreakTimer);
            cb(null, Object.assign(state, {
                oldStage: state.stage,
                stage: stages.TOURN_PAUSED
            }));
        },

        'RESUME_TOURNAMENT': function (state, payload, cb) {
            if (state.stage != stages.TOURN_PAUSED) {
                cb({message: 'Can\'t resume tournament while it is not paused'});
                return;
            }

            var itr = 0;
            if (state.oldStage == stages.COFFEEBREAK) {
                itr = setInterval(coffeebreakTimer(state, cb), 5000);
                cb(null, Object.assign(state, {
                    oldStage: null,
                    stage: state.oldStage,
                    coffeebreakTimer: itr
                }));

            } else { // assume all games are ended
                itr = setInterval(coffeebreakTimer(state, cb), 5000);
                for (var i in reservedBots) {
                    reservedBots[i] = false; // all bots are free
                }

                cb(null, Object.assign(state, {
                    oldStage: null,
                    stage: stages.COFFEEBREAK,
                    coffeebreakStartedAt: (new Date()).getTime(),
                    coffeebreakTimer: itr,
                    gamesFinished: 0
                }));
            }
        }
    };

    function finishGame(state, cb) {
        if (state.totalPlayedGames >= TOURN_GAMES_COUNT - 1) {
            cb(null, Object.assign(state, {
                totalPlayedGames: state.totalPlayedGames + 1,
                stage: stages.TOURN_FINISHED,
                gamesFinished: 0
            }));
            return;
        }

        var finishedCount = state.gamesFinished + 1;
        console.log('Finished game ', finishedCount, ' of ', state.currentSeating.length);
        if (finishedCount >= state.currentSeating.length) { // all games finished
            var itr = setInterval(coffeebreakTimer(state, cb), 5000);

            for (var i in reservedBots) {
                reservedBots[i] = false; // all bots are free
            }

            cb(null, Object.assign(state, {
                totalPlayedGames: state.totalPlayedGames + 1,
                stage: stages.COFFEEBREAK,
                breakTime: (state.totalPlayedGames + 1 == (TOURN_GAMES_COUNT / 2) ? coffebreakIntervals.BIG : coffebreakIntervals.SMALL),
                coffeebreakStartedAt: (new Date()).getTime(),
                coffeebreakTimer: itr,
                gamesFinished: 0
            }));
        } else {
            cb(null, Object.assign(state, {
                gamesFinished: finishedCount
            }));
        }
    }

    function coffeebreakTimer(state, cb) {
        return function () {
            var breakTime = (state.totalPlayedGames == (TOURN_GAMES_COUNT / 2) ? coffebreakIntervals.BIG : coffebreakIntervals.SMALL);
            if ((new Date()).getTime() - state.coffeebreakStartedAt > breakTime) {
                if (state.totalPlayedGames < TOURN_GAMES_COUNT - 1) {
                    makeSortition(function (e, sortition) {
                        cb(e, Object.assign(state, {
                            stage: stages.SORTITION_READY,
                            currentSeating: sortition
                        }));
                    });
                } else {
                    makeFinalSortition(function (sortition) {
                        cb(null, Object.assign(state, {
                            stage: stages.FINAL_SORTITION_READY,
                            currentSeating: sortition
                        }));
                    })
                }
                clearInterval(state.coffeebreakTimer);
            }
        };
    }

    function startSingleTable(playersList) {
        var url = '/api/1.0/startNewMatch/';

        function fixedEncodeURIComponent(str) {
            return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
                return '%' + c.charCodeAt(0).toString(16);
            });
        }

        var data = {
            player1: fixedEncodeURIComponent(Base64.decode(playersList[0]['username'])),
            player2: fixedEncodeURIComponent(Base64.decode(playersList[1]['username'])),
            player3: fixedEncodeURIComponent(Base64.decode(playersList[2]['username'])),
            player4: fixedEncodeURIComponent(Base64.decode(playersList[3]['username'])),
            lobby_private_key: PRIVATE_KEY
        };

        return new Promise(function (resolve) {
            var attemptsCount = 0;
            var maxAttempts = 10;

            function attempt() {
                makePost(url, data)
                    .then(function () {
                        tableStartCb(null, playersList, {success: true});
                        resolve();
                    })
                    .catch(function (resp) {
                        if (attemptsCount < maxAttempts) { // legal attempts for slowpoke users
                            attemptsCount++;
                            tableStartCb(resp.absentUsers, playersList, {success: false, reattempting: true});
                            setTimeout(attempt, 30000); // re-attempt in 30 secs
                        } else { // wooh, something went really wrong! trying to recover
                            if (resp.absentUsers.length == 4) { // not likely to happen
                                tableStartCb(resp.absentUsers, null, {tableDropped: true});
                                resolve();
                                setTimeout(function() {
                                    finishGame(state, function(e, st) {stateChangeCb(st);});
                                }, 2000); // on resolve it becomes games_started, but we need to wait some time. Ugly, though.
                                return;
                            }
                            // Заменяем опоздунов на ботов!
                            // Обязательно предупредить людей, чтобы они не уходили из лобби во избежание такой ситуации.
                            var liveUsers = playersList.filter(function(n) {
                                return resp.absentUsers.indexOf(Base64.decode(n.username)) == -1;
                            });
                            for (var i in reservedBots) {
                                if (reservedBots[i] == false && liveUsers.length < 4) {
                                    liveUsers.push({username: Base64.encode(i)});
                                    reservedBots[i] = true;
                                }
                            }

                            if (liveUsers.length == 4) { // fine, lets play with bots
                                tableStartCb(resp.absentUsers, null, {success: false, reattempting: false});
                                console.log('Playing with bots', liveUsers);
                                playersList = liveUsers;
                                data = {
                                    player1: fixedEncodeURIComponent(Base64.decode(liveUsers[0]['username'])),
                                    player2: fixedEncodeURIComponent(Base64.decode(liveUsers[1]['username'])),
                                    player3: fixedEncodeURIComponent(Base64.decode(liveUsers[2]['username'])),
                                    player4: fixedEncodeURIComponent(Base64.decode(liveUsers[3]['username'])),
                                    lobby_private_key: PRIVATE_KEY
                                };
                                setTimeout(attempt, 1000);
                            } else { // boooo :((( no bots left - DAFUQ!!
                                console.log('Bots pool exhausted D:');
                                resolve();
                                setTimeout(function() {
                                    dispatch({type: 'PAUSE_TOURNAMENT'}, function() {}); // pause to make some manual decisions
                                    tableStartCb(resp.absentUsers, data, {success: false, reattempting: false, tournamentPaused: true});
                                }, 5000);
                            }
                        }
                    })
            }

            setTimeout(attempt, 1000); // to avoid tenhou ddos-ing
        });
    }

    function makeSortition(cb) {
        var genurl = '/api/1.0/generateSortition/';
        var geturl = '/api/1.0/getSortition/';
        makePost(genurl, {})
            .then(function (data) {
                makePost(geturl, data)
                    .then(function (data) {
                        cb(null, data);
                    })
                    .catch(function (e) {
                        cb(e);
                    });
            }).catch(function (e) {
                cb(e);
            });
    }

    function makeFinalSortition(cb) {
        function fisherYates(array) { // randomizer
            var count = array.length,
                randomnumber,
                temp;
            while (count) {
                randomnumber = Math.random() * count-- | 0;
                temp = array[count];
                array[count] = array[randomnumber];
                array[randomnumber] = temp
            }
        }

        var url = '/api/1.0/getLeaders/';
        makePost(url, {}).then(function (usernames) {
            fisherYates(usernames);
            cb(usernames.map(function (el) {
                return {'username': Base64.encode(el)};
            }));
        });
    }

    function registerGame(link, cb) {
        var url = '/api/1.0/registerReplay/';
        makePost(url, {replay_link: link})
            .then(function (data) {
                console.log('registerGame success!');
                cb(null, data);
            })
            .catch(function (e) {
                console.log('registerGame error: ', e);
                cb(e);
            });
    }


    function dispatch(action, cb) {
        console.log('Dispatching action to fsm: ', action);
        actions[action.type](state, action.payload, function (e, result) {
            console.log('Reply came for action: ', action, e);
            if (e) {
                return cb(e);
            }

            state = result;
            stateChangeCb(state);
            return cb(null);
        });
    }

    return {
        initState: function (_state) {
            state = _state;
        },
        getState: function () {
            return state;
        },
        onStateChanged: function (cb) {
            stateChangeCb = cb;
        },
        onTableStartAttempt: function (cb) {
            tableStartCb = cb;
        },
        dispatch: dispatch,
        stages: stages
    }
};