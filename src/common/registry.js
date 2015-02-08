//////////// component /////////////

function findInTree(tree, key) {
    var pieces = key.split('.');
    var result = tree;

    for (var i = 0; i < pieces.length; i++) {
        result = result[pieces[i]];
        if (result === undefined) {
            break;
        }
    }

    return result;
}

function setInTree(tree, key, value) {
    var pieces = key.split('.');
    var result = tree;

    for (var i = 0; i < pieces.length - 1; i++) {
        if (result[pieces[i]] === undefined) {
            result = result[pieces[i]] = {};
        }
    }

    result[pieces[pieces.length - 1]] = value;
    return result;
}

function removeFromTree(tree, key) {
    var pieces = key.split('.');
    var result = tree;

    for (var i = 0; i < pieces.length - 1; i++) {
        result = result[pieces[i]];
        if (result === undefined) {
            return null; // Nothing was deleted
        }
    }

    var tmp = result[pieces[pieces.length - 1]];
    delete result[pieces[pieces.length - 1]];
    return tmp;
}

function Registry() {
    this.data = {};
}

Registry.prototype.get = function(key) {
    if (!key) {
        return this.data;
    }

    return findInTree(this.data, key);
};

Registry.prototype.set = function(key, value) {
    if (!key) {
        this.data = value || {};
        return this.data;
    }

    return setInTree(this.data, key, value);
};

Registry.prototype.remove = function(key) {
    if (!key) {
        this.data = {};
        return this.data;
    }

    return removeFromTree(this.data, key);
};

Registry.prototype.setup = function(data) {
    return this.set('', data);
};

Registry.prototype.clear = function() {
    return this.remove('');
};

Registry.prototype.saveToStorage = function(key) {
    if (!window || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(this.get()));
};

Registry.prototype.loadFromStorage = function(key) {
    if (!window || !window.localStorage) return;
    this.setup(JSON.parse(window.localStorage.getItem(key)));
};

module.exports = Registry;