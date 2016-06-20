var _ = require('lodash');
var redis = require('../redis');
var EventBus = require('../../common/eventBus');
/**
 * Tournaments component
 */
var TournamentsComponent = function() {};

// TODO;
/**
 * Состояние турнира - в редисе
 * Flow турнира:
 * 1 Турнир не начат
 * 2 Рассадка сгенерирована
 * 3 Рассадка начата (повторять, пока не начнутся все игры, т.е. все игроки не будут в лобби)
 * 4 Рассадка закончена, все игры начаты
 * 5 Все игры закончены, перерыв.
 * 6 Перерыв окончен, идем к пункту 2, или далее если сыграно 7 игр
 * 7 Сгенерирована рассадка для первой четверки
 * 8 Решающая игра начинается (повторять, пока не будут все в лобби)
 * 9 Решающая игра начата
 * 10 Решающая игра закончена
 * 11 Турнир окончен
 *
 * Завершение игр автоматически не детектируется - завершение игр
 * инициируют игроки, выдавая в чат ссылки на реплеи. Зарегистрированный реплей
 * является законечнной игрой.
 *
 * За данными лазим по http на статборд
 * Игры стартуем также статбордом, в зависимости от текущего состояния
 * Обработка ошибок вся здесь.
 */
TournamentsComponent.prototype.someFunc = function() {
    EventBus.requestReaction('main:postMessage', {
        id: -1,
        nickname: 'Tournament bot',
        avatar: '/static/avatars/robot.jpg',
        message: 'WOOOOHOOOOO!!' // TODO - вот так мы можем говорить от бота
    })
};

var tournaments = new TournamentsComponent();
module.exports = tournaments;

EventBus.handleReaction('tournaments:tryParseMessage', function(data, cb) {
    var message = data.message; // string

    // TODO: так мы можем парсить команды из чата
});



