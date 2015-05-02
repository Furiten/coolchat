var _ = require('lodash');
var Registry = require('../registry');
var reg = new Registry();
var assert = require('assert');

describe('Registry component', function() {
    beforeEach(function() {
        reg.setup(null);
    });

    afterEach(function() {
        reg.clear();
        assert.equal(_.size(reg.get()), 0);
    });

    it('should be empty on init', function() {
        assert.equal(_.size(reg.get()), 0);
    });

    it('should set and get simple key properly', function() {
        reg.set('testKey', 1);
        assert.equal(reg.get('testKey'), 1);
        assert.equal(_.size(reg.get()), 1);
    });

    it('should set and get complex key properly', function() {
        reg.set('testKey.subKey', 1);
        assert.equal(reg.get('testKey.subKey'), 1);
        assert.equal(_.size(reg.get()), 1);
    });

    it('should set and get bunch of complex keys properly', function() {
        reg.set('testKey.subKey1', 1);
        reg.set('testKey.subKey2', 1);
        reg.set('testKey.subKey3', 1);
        reg.set('testKey.subKey4', 1);
        assert.equal(reg.get('testKey.subKey1'), 1);
        assert.equal(reg.get('testKey.subKey2'), 1);
        assert.equal(reg.get('testKey.subKey3'), 1);
        assert.equal(reg.get('testKey.subKey4'), 1);
        assert.equal(_.size(reg.get()), 1);
        assert.equal(_.size(reg.get('testKey')), 4);
    });

    it('should get undefined for inexisting simple key', function() {
        assert.equal(reg.get('someOops'), undefined);
    });

    it('should get undefined for inexisting complex key', function() {
        assert.equal(reg.get('someOops.deeperOops'), undefined);
    });

    it('should get undefined for inexisting complex key inside of existing key', function() {
        reg.set('testKey.subKey1', 1);
        assert.equal(reg.get('testKey.deeperOops'), undefined);
    });
});