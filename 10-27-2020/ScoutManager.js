var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var ScoutManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
                        if(!Game.rooms[Memory.outpostNames[r][o]])
                        {
                            SpawnManager.SpawnScout(r, Memory.outpostNames[r][o]);
                        }
                    }
                }
            }
        }
    }
}

module.exports = ScoutManager;