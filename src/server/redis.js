var redis = require('redis');
var client = redis.createClient();
client.select(4); // use 4th db for chat
module.exports = client;