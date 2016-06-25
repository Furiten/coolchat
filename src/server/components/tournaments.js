var _ = require('lodash');
var Base64 = require('../../common/base64');
var redis = require('../redis');
var EventBus = require('../../common/eventBus');
var Fsm = require('./tournamentsFsm');

function sendBotMessage(msg) {
    setTimeout(function() {
        EventBus.requestReaction('main:postMessage', {
            id: -1,
            nickname: 'Pankrat the dragon',
            avatar: '/static/avatars/pankrat.png',
            message: msg
        });
    }, 0);
}

/**
 * Tournaments component
 */
var TournamentsComponent = function() {
    var self = this;
    this._inited = false;
    this.fsm = Fsm();
    this.fsm.onStateChanged(function(newState) {
        self.processStateChanged(newState);
    });

    this.fsm.onTableStartAttempt(_.bind(this.onTableStartAttempt, this));

    EventBus.handleReaction('tournaments:tryParseMessage', function(data, cb) {
        self.parseMessage(data.message, cb);
    });


    redis.get('tourn_state', function(err, reply) {
        var dbData;
        try {
            if (err || !reply) {
                throw new TypeError();
            }

            dbData = JSON.parse(reply);
            self.fsm.initState(dbData);
        } catch (e) {} // do nothing; will init as default state

        self._inited = true;
    });
};

TournamentsComponent.prototype._storeState = function(newState) {
    var st = _.omit(newState, 'coffeebreakTimer');
    console.log('==== New tournament state ====');
    console.log(st);
    var serializedState = JSON.stringify(st);
    redis.set('tourn_state', serializedState);
};

/**
 * тут мы понимаем, что в fsm что-то случилось и можем послать некое сообщение в чат
 */
TournamentsComponent.prototype.processStateChanged = function(newState) {
    if (!this._inited) return;
    this._storeState(newState); // обязательно!

    if (newState.stage == this.fsm.stages.SORTITION_READY) {
        this.fsm.dispatch({'type': 'START_SEATING'}, function() {});
        sendBotMessage('Начинаем рассадку! Приготовились! Поехали!');
        return;
    }

    if (newState.stage == this.fsm.stages.SEATING_STARTED) {
        sendBotMessage('Внимание! Рассадка сгенерирована, начинаем игры!');
        return;
    }

    if (newState.stage == this.fsm.stages.COFFEEBREAK) {
        sendBotMessage('Итак, закончена игра №' + newState.totalPlayedGames + '. ' +
            'Объявляется перерыв длиной в ' + (newState.breakTime / (1000 * 60)) + ' минут. ' +
            'Просьба НЕ ВЫХОДИТЬ ИЗ ЛОББИ на время перерыва. В случае, если в течение 5 минут после момента начала игр ' +
            'вас не будет в лобби, вместо вас будет играть бот.'
        );
        return;
    }

    if (newState.stage == this.fsm.stages.FINAL_SORTITION_READY) {
        this.fsm.dispatch({'type': 'START_FINAL_SEATING'}, function() {});
        sendBotMessage('Финальная решающая игра лидеров! Приготовились! Поехали!');
        return;
    }

    if (newState.stage == this.fsm.stages.FINAL_SEATING_STARTED) {
        sendBotMessage('Внимание! Начинается финальная игра!');
        return;
    }

    if (newState.stage == this.fsm.stages.TOURN_FINISHED) {
        sendBotMessage('Финальная игра завершена и внесена! Турнир окончен! Спасибо, что были с нами! :) Приходите на наши следующие турниры :)');
        return;
    }

    if (newState.stage == this.fsm.stages.TOURN_PAUSED) {
        sendBotMessage('Внимание! Турнир ПРИОСТАНОВЛЕН до вмешательства руководителей турнира. Начатые игры НЕ БУДУТ ПРИНЯТЫ в рейтинг турнира.');
    }
};

TournamentsComponent.prototype.onTableStartAttempt = function(absentUsers, tableStarted, status) {
    console.log('Table start logs:', status, absentUsers, tableStarted);
    if (!this._inited) return;

    if (status.success) {
        if (tableStarted) {
            sendBotMessage('Стол [ ' + tableStarted.map(function (el) {
                    return el ? Base64.decode(el.username) : '';
                }).join(', ') + ' ] начал игру!');
        }

        if (status.allTablesStarted) {
            sendBotMessage('Все столы начали игру! Всем успешной игры! :) Рекомендуем закрыть чат на время игры, чтобы не отвлекаться по пустякам.');
        }
        return;
    }

    if (status.tableDropped) {
        sendBotMessage('Внимание! Следующий стол не явился в полном составе: ' + absentUsers.join(', ') + '. ' +
            'В текущей игре этот стол участия не принимает.');
        return;
    }

    // all next means that success = false
    if (status.reattempting) {
        sendBotMessage('Не удалось начать игру стола [ ' + tableStarted.map(function (el) {
                return el ? Base64.decode(el.username) : '';
            }).join(', ') +
            ' ]! Следующие игроки отсутствуют в лобби: ' + absentUsers.join(', ') + '. ' +
            'Повторная попытка старта игры через 30 секунд. Пожалуйста, пройдите в турнирное лобби!');
        return;
    }

    // reattempting = false
    if (!status.tournamentPaused) {
        sendBotMessage('Внимание! В течение 5 минут следующие игроки не появились в лобби: ' + absentUsers.join(', ') + '. ' +
            'В текущей игре вместо указанных игроков будут играть боты.');
        return;
    }

    sendBotMessage('Внимание! Количество замен игроков по причине отсутствия в лобби превысило все возможные пределы. Приостаналиваем турнир...');
};

TournamentsComponent.prototype.parseMessage = function(message, cb) {
    if (!this._inited) return;

    if (message.indexOf('!start!') != -1) {
        this.fsm.dispatch({type: 'START_TOURNAMENT'}, function() {});
        sendBotMessage('Июньский онлайн-турнир начинается! Добро пожаловать всем игрокам и просьба зайти в лобби, если вы этого еще не сделали.');
        cb(true);
        return;
    }

    if (message.indexOf('!pause!') != -1) {
        this.fsm.dispatch({type: 'PAUSE_TOURNAMENT'}, function() {});
        cb(true);
        return;
    }

    if (message.indexOf('!reset!!!') != -1) {
        sendBotMessage('Внимание! Данные турнира были сброшены!');
        this.fsm.dispatch({type: 'RESET_TOURNAMENT'}, function() {});
        cb(true);
        return;
    }

    if (message.indexOf('!resume!') != -1) {
        this.fsm.dispatch({type: 'RESUME_TOURNAMENT'}, function() {});
        sendBotMessage('Турнир ВОЗОБНОВЛЕН!');
        cb(true);
        return;
    }

    if (message.indexOf('http://tenhou.net') != -1) { // simple check
        var matches = message.match(/http:\/\/tenhou.net\/0\/\?log=[-a-z0-9]+/g);
        var self = this;
        matches.forEach(function(match) {
            self.fsm.dispatch({type: 'GAME_ENDED', payload: {
                link: match,
                onSuccess: function(result) {
                    var scoresWithUma = result.scores;

                    var results = [];
                    for (var user in scoresWithUma) {
                        results.push(Base64.decode(user) + ' (' +
                            (scoresWithUma[user] > 0 ? '+' : '') + // sign
                            scoresWithUma[user] + ')');
                    }

                    sendBotMessage('Игра успешно зарегистрирована! Итоги игры: ' + results.join(', '));
                }
            }}, function(e) {
                if (e) {
                    sendBotMessage('При попытке регистрации игры что-то пошло не так, и вот что именно: ' + e.message);
                }
            });
        });

    }

    cb(false); // or true to block message
};

var tournaments = new TournamentsComponent();
module.exports = tournaments;




