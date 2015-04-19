// setupServer.js
//
// NOTES:
// 	r.db('LoLApiChallenge').table('URF_match_info').getField('epoch_time')

var r = require('rethinkdb')

function setupServer() {
	conn = r.connect({db: 'LoLApiChallenge'}, function(err, conn) {
		r.dbCreate('LoLApiChallenge').run(conn, function(err, conn) { console.log('Created DB')})
		r.db('LoLApiChallenge').tableCreate('URF_match_info').run(conn, function(err, conn) { console.log('Created table')})
		r.table('URF_match_info').indexCreate('id').run(conn, function(err, conn) { console.log('Created id index')})
		r.table('URF_match_info').indexCreate('epoch_time').run(conn, function(err, conn) { console.log('Created epoch_time index')})
		r.table('URF_match_info').indexCreate('content').run(conn, function(err, conn) { console.log('Created content index')})
	})
}

setupServer()