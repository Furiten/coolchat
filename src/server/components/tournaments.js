var _ = require('lodash');
var redis = require('../redis');
var EventBus = require('../../common/eventBus');

/**
 * Tournaments component
 */
var TournamentsComponent = function() {
    var self = this;
    this._inited = false;
    this.fsm = require('./tournamentsFsm');
    this.fsm.onStateChanged(function(newState) {
        self.processStateChanged(newState);
    });

    this.fsm.onTableStartAttempt(function(status) {
        self.onTableStartAttempt(status);
    });

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
    var serializedState = JSON.stringify(newState);
    redis.set('tourn_state', serializedState);
};

/**
 * тут мы понимаем, что в fsm что-то случилось и можем послать некое сообщение в чат
 */
TournamentsComponent.prototype.processStateChanged = function(newState) {
    if (!this._inited) return;
    this._storeState(newState); // обязательно!

    // TODO: тут мы понимаем, что в fsm что-то случилось и можем послать некое сообщение в чат

    EventBus.requestReaction('main:postMessage', {
        id: -1,
        nickname: 'Tournament bot',
        avatar: '/static/avatars/robot.jpg',
        message: 'WOOOOHOOOOO!!' // TODO - вот так мы можем говорить от бота
    })
};

TournamentsComponent.prototype.parseMessage = function(message, cb) {
    if (!this._inited) return;

    // TODO: тут мы можем парсить команды из чата и давать команды в fsm соответственно

    // Когда даем в fsm экшн с payload-ом для регистрации игры, можно в пайлоаде передать
    // колбэк onSuccess, чтобы вывести результаты в чат например.

    var state = this.fsm.getState(); // так доступно состояние fsm
};

var tournaments = new TournamentsComponent();
module.exports = tournaments;




