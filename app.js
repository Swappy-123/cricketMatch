const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
app.use(express.json())
let database = null
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3001, () => {
      console.log('Server Is running on http://localhost:3001')
    })
  } catch (error) {
    console.log(`Data base Error is ${error}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//API 1

const object1 = (item1) => {
  return {
    playerId: item1.player_id,
    playerName: item1.player_name,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT *
      FROM player_details ;
    `
  const getPlayersQueryResponse = await database.all(getPlayersQuery)
  response.send(getPlayersQueryResponse.map((each) => object1(each)))
})

//API 2

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerIdQuery = `
    SELECT * 
         FROM player_details 
         WHERE player_id = ${playerId};
    `
  const getPlayerIdQueryResponse = await database.get(getPlayerIdQuery)
  response.send(object1(getPlayerIdQueryResponse))
})

//API 3

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const updateQuery = `
    UPDATE player_details 
             SET player_name = '${playerName}'
             WHERE player_id = ${playerId};
    `
  const updateQueryResponse = await database.run(updateQuery)
  response.send('Player Details Updated')
})

//API 4
const object2 = (item2) => {
  return {
    matchId: item2.match_id,
    match: item2.match,
    year: item2.year,
  }
}

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `
    SELECT * 
       FROM match_details
       WHERE match_id = ${matchId};
    `
  const getMatchQueryResponse = await database.get(getMatchQuery)
  response.send(object2(getMatchQueryResponse))
})

//API 5

app.get('/players/:palyerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getMatchesQuery = `
  SELECT * 
       FROM player_match_score NATURALJOIN match_details
       WHERE 
       player_id = ${playerId};
  `
  
  const fetchDetails = await database.all(getMatchesQuery)
  response.send(fetchDetails.map((each) => object2(each)))
})

//API 6

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersMatchQuery = `
  SELECT player_details.player_id AS playerId, 
         player_details.player_name AS playerName
      FROM player_match_score
        NATURAL JOIN player_details
        WHERE match_id = ${matchId};
  `
  const getPlayersMatchQueryResponse = await database.all(getPlayersMatchQuery)
  response.send(getPlayersMatchQueryResponse.map((each) => object2(each)))
})

//API 7
const object3 = (player, stats) => {
  return {
    playerId: stats.player_id,
    playerName: playerName,
    totalScore: stats.totalScore,
    totalFours: stats.totalFours,
    totalSixes: stats.totalSixes,
  }
}

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getPlayerNameQuery = `
   SELECT player_details.player_id AS playerId,
   player_details.player_name AS playerName,
   SUM(player_match_score.score) AS totalScore,
   SUM(fours) AS totalFours,
   SUM(sixes) AS totalSixes
   FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
   WHERE player_details.player_id = ${playerId};
  `
  
  const getPlayerStatQueryResponse = await database.get(getPlayerNameQuery)
  response.send(object3(getPlayerStatQueryResponse))
})

module.exports = app
