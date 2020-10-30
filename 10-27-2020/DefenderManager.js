
var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var AlertManager = require("AlertManager");

var DefenderManager = 
{
    run: function()
    {
        this.SetupDefendTimes();
        
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].find(FIND_MY_CREEPS).filter(c => (c.memory.role == 'carrier' && c.ticksToLive > c.body.length * 3)).length)
                {
                    this.defendersSpawnDone[r] = false
                    if(AlertManager.OnAlert(r) == true | Game.rooms[r].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                    {
                        
                        var militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military"))})[0];
                        if(!militarySpawn)
                            militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS)[0];
                        
                        if(militarySpawn)
                        {
                            if(Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'defender')}).length < 3)
                            {
                                var defenderBody = SpawnManager.SelectBody(militarySpawn.room.energyCapacityAvailable, [new CreepBody({numAttack: 7, numMove: 7, numTough: 7}), new CreepBody({numAttack: 5, numMove: 5, numTough: 5}), new CreepBody({numAttack: 1, numMove: 1, numTough: 1})]);
                                SpawnManager.SpawnCreep(militarySpawn, 'defender', defenderBody);
                            }else
                            {
                                this.defendersSpawnDone[r] = true
                            }
                        }else{
                            this.defendersSpawnDone[r] = true
                        }
                    }else{
                        this.defendersSpawnDone[r] = true
                    }
                }else{
                    this.defendersSpawnDone[r] = true
                }
            }
        }
    },
    SetupDefendTimes: function()
    {
        for(var i in Game.rooms)
        {
            if(Game.rooms[i].controller && Game.rooms[i].controller.my)
            {
				//Stockpile units if there's a large player controlled unit
                if(Game.rooms[i].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 10 && c.owner.username != "Invader")}).length)
                    Memory.defendTimes[i] = Game.time;
            }
        }
    },
	SpawnDone: function(roomName)
	{
		if(roomName in this.defendersSpawnDone)
			return this.defendersSpawnDone[roomName];
		
		return true;
	}
}
DefenderManager.defendersSpawnDone = [];

Memory.defendTimes = {}
for(var i in Game.rooms)
{
    if(Game.rooms[i].controller && Game.rooms[i].controller.my)
    {
        Memory.defendTimes[i] = null;
    }
}

module.exports = DefenderManager;