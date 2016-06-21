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

var actions = {
    'START_TOURNAMENT': function(state, payload, cb) {
        if (state.stage != stages.TOURN_NOT_STARTED) {
            cb({ message: 'Tournament already started' });
            return;
        }

        makeSortition(function(sortition) {
            cb(null, Object.assign(state, {
                stage: stages.SORTITION_READY,
                currentSeating: sortition
            }));
        });
    },

    'START_SEATING': function(state, payload, cb) {
        if (state.stage != stages.SORTITION_READY) {
            cb({ message: 'Sortition is not ready! Cannot start seating' });
            return;
        }

        var tables = [];
        for (var i = 0; i < state.currentSeating.length; i ++) {
            tables.push(startSingleTable(state.currentSeating[i]));
        }

        Promise.all(tables).then(function() {
            cb(null, Object.assign(state, {
                stage: stages.GAMES_STARTED
            }));
        });

        cb(null, Object.assign(state, {
            stage: stages.SEATING_STARTED
        }));
    },

    'GAME_ENDED': function(state, payload, cb) {
        if (state.stage != stages.GAMES_STARTED) {
            cb({ message: 'Can\'t add finished game while no or not all games are started' });
            return;
        }

        registerGame(payload.link, function(e, result) {
            if (e) {
                cb({ message: 'Couldn\'t add game :( Wrong link? Try again.' });
                return;
            }

            if (payload.onSuccess) payload.onSuccess(result); // TODO

            var finishedCount = state.gamesFinished + 1;
            if (finishedCount >= state.currentSeating.length) { // all games finished
                var itr = setInterval(coffeebreakTimer(state, cb), 5000);

                cb(null, Object.assign(state, {
                    totalPlayedGames: state.totalPlayedGames + 1,
                    stage: stages.COFFEEBREAK,
                    coffeebreakStartedAt: (new Date()).getTime(),
                    coffeebreakTimer: itr,
                    gamesFinished: 0
                }));
            } else {
                cb(null, Object.assign(state, {
                    gamesFinished: finishedCount
                }));
            }
        });
    },

    'START_FINAL_SEATING': function(state, payload, cb) {
        if (state.stage != stages.FINAL_SORTITION_READY) {
            cb({ message: 'Final sortition is not ready! Cannot start seating' });
            return;
        }

        startSingleTable(state.currentSeating).then(function() {
            cb(null, Object.assign(state, {
                stage: stages.FINAL_GAME_STARTED
            }));
        });

        cb(null, Object.assign(state, {
            stage: stages.FINAL_SEATING_STARTED
        }));
    },

    'FINAL_GAME_ENDED': function(state, payload, cb) {
        if (state.stage != stages.FINAL_GAME_STARTED) {
            cb({ message: 'Can\'t add finished final game while it is not started' });
            return;
        }

        registerGame(payload.link, function(e, result) {
            if (e) {
                cb({message: 'Couldn\'t add game :( Wrong link? Try again.'});
                return;
            }

            if (payload.onSuccess) payload.onSuccess(result); // TODO

            cb(null, Object.assign(state, {
                stage: stages.TOURN_FINISHED
            }));
        });
    },

    'PAUSE_TOURNAMENT': function(state, payload, cb) {
        if (state.stage != stages.COFFEEBREAK &&
            state.stage != stages.GAMES_STARTED &&
            state.stage != stages.FINAL_GAME_STARTED
        ) {
            cb({ message: 'Can\'t pause tournament while some requests running! Wait 5 secs and try again' });
            return;
        }

        clearInterval(state.coffeebreakTimer);
        cb(null, Object.assign(state, {
            oldStage: state.stage,
            stage: stages.TOURN_PAUSED
        }));
    },

    'RESUME_TOURNAMENT': function(state, payload, cb) {
        if (state.stage != stages.TOURN_PAUSED) {
            cb({ message: 'Can\'t resume tournament while it is not paused' });
            return;
        }

        var itr = 0;
        if (state.oldStage == stages.COFFEEBREAK) {
            itr = setInterval(coffeebreakTimer(state, cb), 5000);
        }

        cb(null, Object.assign(state, {
            oldStage: null,
            stage: state.oldStage,
            coffeebreakTimer: itr
        }));
    }
};

function coffeebreakTimer(state, cb) {
    return function () {
        var breakTime = (state.totalPlayedGames == 4 ? coffebreakIntervals.BIG : coffebreakIntervals.SMALL);
        if ((new Date()).getTime() - state.coffeebreakStartAt > breakTime) {
            if (state.totalPlayedGames < 7) {
                makeSortition(function (sortition) {
                    cb(null, Object.assign(state, {
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

function startSingleTable(playersList) { // TODO: надо как-то обеспечить 100% успешность метода. Ошибки/режекты недопустимы.
    return new Promise(function(resolve, reject) {
        // TODO: тут 1) несколько попыток стартовать, с паузой; 2) выдача сообщения в чат отсутствующим игрокам
        // промис резолвим только в случае успеха.
    });
}

function makeSortition(cb) { // рассадка передается единственным параметром в cb

}

function makeFinalSortition(cb) { // рассадка передается единственным параметром в cb

}

function registerGame(link, cb) { // в cb передается ошибка первым параметром и результат вторым

}

module.exports = function() {
    var stateChangeCb = function() {};
    var state = { // defaults
        'stage': stages.TOURN_NOT_STARTED,
        'gamesFinished': 0,
        'totalPlayedGames': 0,
        'coffeebreakStartAt': null,
        'currentSeating': null
    };

    function dispatch(action, cb) {
        actions[action.type](state, action.payload, function(e, result) {
            if (e) {
                return cb(e);
            }

            state = result;
            stateChangeCb(state);
            return cb(null);
        });
    }

    return {
        initState: function(_state) {
            state = _state;
        },
        getState: function() { return state; },
        onStateChanged: function(cb) { stateChangeCb = cb; },
        dispatch: dispatch,
        stages: stages
    }
};