const express = require("express");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server had started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBServer();

const convertDBObject = (DBObject) => {
  return {
    playerId: DBObject.player_id,
    playerName: DBObject.player_name,
    jerseyNumber: DBObject.jersey_number,
    role: DBObject.role,
  };
};

//Get Players name
app.get("/players/", async (request, response) => {
  const getPlayersName = `
       SELECT * 
       FROM cricket_team;`;
  const getAllPlayers = await db.all(getPlayersName);
  response.send(getAllPlayers.map((eachPlayer) => convertDBObject(eachPlayer)));
});

//Add Players Api
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
        INSERT INTO 
        cricket_team (player_name, jersey_number, role)
        VALUES ('${playerName}', ${jerseyNumber}, '${role}');`;

  const addPlayer = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player Name And Id
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerNameAndId = `
       SELECT *
       FROM cricket_team
       WHERE player_id = ${playerId};`;

  const playerIdName = await db.get(getPlayerNameAndId);
  response.send(convertDBObject(playerIdName));
});

//Update Player
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayer = `
          UPDATE cricket_team 
          SET player_name = '${playerName}',
              jersey_number = ${jerseyNumber},
              role = '${role}'
          WHERE player_id = ${playerId};`;
  const upPlayer = await db.get(updatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  SELECT *
  FROM  cricket_team
  WHERE
    player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
