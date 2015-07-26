function getPlural(a) {
    if (a % 10 == 1 && a % 100 != 11) {
        return 'singular';
    } else if (a % 10 >= 2 && a % 10 <= 4 && ( a % 100 < 10 || a % 100 >= 20)) {
        return 'plural';
    } else {
        return 'multiplural';
    }
}

module.exports = getPlural;

module.exports.form = function(count, singular, plural, multiplural) {
    switch (getPlural(count)) {
        case 'singular':
            return singular;
        case 'plural':
            return plural;
        case 'multiplural':
            return multiplural;
        default:;
    }
};
