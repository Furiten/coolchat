function plural(a) {
    if (a % 10 == 1 && a % 100 != 11) {
        return 'singular';
    } else if (a % 10 >= 2 && a % 10 <= 4 && ( a % 100 < 10 || a % 100 >= 20)) {
        return 'plural';
    } else {
        return 'multiplural';
    }
}

module.exports = plural;