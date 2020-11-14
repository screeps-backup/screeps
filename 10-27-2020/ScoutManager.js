var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var ScoutManager = 
{
    run: function()
    {
        if(Game.flags['MilitarySpawn'] && Game.flags['PlaceBaseBash'])
        {
            if(Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName])
            {
                if(Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller && Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller.owner && !Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller.my && (!Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller.safeMode || (Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller.safeMode && Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].controller.safeMode <= 500)))
                {
                    Game.rooms[Game.flags['PlaceBaseBash'].pos.roomName].createFlag(25, 25, 'BaseBash', COLOR_RED, COLOR_RED);
                    Game.notify("BaseBash placed at: " + Game.flags['PlaceBaseBash'].pos.roomName);
                    Game.flags['PlaceBaseBash'].remove();
                }
            }else
            {
                SpawnManager.SpawnScout(Game.flags['MilitarySpawn'].pos.roomName, Game.flags['PlaceBaseBash'].pos.roomName);
            }
        }
        if(Game.flags['MilitarySpawn'] && Game.flags['BaseBash'])
        {
            SpawnManager.SpawnScout(Game.flags['MilitarySpawn'].pos.roomName, Game.flags['BaseBash'].pos.roomName);
        }
        if(Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
                        SpawnManager.SpawnScout(r, Memory.outpostNames[r][o]);
                    }
                }
            }
            if(Game.flags['MilitarySpawn'] && Game.flags['DeployScout'])
            {
                SpawnManager.SpawnScout(Game.flags['MilitarySpawn'].pos.roomName, Game.flags['DeployScout'].pos.roomName);
            }
            
        }
    }
}

module.exports = ScoutManager;