var r = require('rethinkdb')
var request = require('request');

// First possible begin date = 1427865900
// If you need to stop just change the begin time to the last logged request time to continue.

var api_key = 

var beginDate = 1429380300;
var now = Math.floor((new Date).getTime() / 1000)
var latestRequest = beginDate;
var nextRequest = beginDate

// http://stackoverflow.com/questions/4288759/asynchronous-for-cycle-in-javascript
function asyncLoop(iterations, func, callback) {
	var index = 0;
	var done = false;
	var loop  =  {
		next: function() {
			if (done) {
				return;
			}

			if (index < iterations) {
				index++;
				func(loop);
			} else {
				done = true;
				callback();
			}
		},
		iteration: function() {
			return index - 1
		},
		break: function() {
			done = true;
			callback();
		}
	};
	loop.next();
	return loop;
}

console.log(Math.floor((now - beginDate)))
asyncLoop( Math.floor((now - beginDate) / 300), function(loop) {
	requestAtTime(beginDate + (300 * (loop.iteration() + 1)));
	loop.next()
	}, function() { console.log("1st loop finished") })

// 1
function requestAtTime(epochTime) {
	latestRequest = epochTime
	console.log("LATEST REQUEST: " + latestRequest)
	var url = "https://na.api.pvp.net/api/lol/na/v4.1/game/ids?beginDate=" + epochTime + api_key
	//console.log(url)
	request({
	url: url,
	json: true
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			asyncLoop(body.length - 1, function(loop) {
				requestMatchInfo(epochTime, body[loop.iteration()])
				loop.next();
			}, function() {
				console.log("2nd loop finished requesting epochTime: " + epochTime)
			})
		} else {
			requestAtTime(epochTime)
		}
	})
}	

// 2
function requestMatchInfo(currentEpochTime, matchID) {
	var url = "https://na.api.pvp.net/api/lol/na/v2.2/match/" + matchID + api_key
	//console.log(url)
	request({
		url: url,
		json: true
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			createTableEntry(currentEpochTime, matchID, body)
		} else {
			requestMatchInfo(currentEpochTime, matchID)
		}
	})
}

// 3
function createTableEntry(currentEpochTime, currentMatchID, body) {
	r.connect({ db : 'LoLApiChallenge'}, function(err, conn) {
		r.table('URF_match_info').insert({
		id : currentMatchID,
		content : body,
		epoch_time : currentEpochTime
		}).run(conn, function(err, result) {
			if (err) throw err;
			console.log("3rd loop finished writing matchID " + currentMatchID)
		})
	})
}


