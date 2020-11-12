
var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
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
                    this.defendersSpawnDone[r] = false;
                    if(AlertManager.OnAlert(r) == true | Game.rooms[r].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                    {
                        
                        var militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military") && !s.spawnCooldownTime)})[0];
                        if(!militarySpawn)
                            militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0];
                        
                        if(militarySpawn)
                        {
                            var defenderBody = SpawnManager.SelectBody(militarySpawn.room.energyCapacityAvailable, [new CreepBody({numAttack: 12, numMove: 16, numTough: 4}), new CreepBody({numAttack: 7, numMove: 7, numTough: 7}), new CreepBody({numAttack: 5, numMove: 5, numTough: 5}), new CreepBody({numAttack: 3, numMove: 5, numTough: 5}), new CreepBody({numAttack: 1, numMove: 1, numTough: 1})]);
                            
                            var targetValue = 0;
                            
                            if(Game.rooms[r].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                            {
                                targetValue = AlertManager.HostilesValue(Game.rooms[r]);
							    targetValue = targetValue * 1.2;
                            }
							
							var buildCost = SpawnManager.BuildCost(defenderBody);
							
							var numDefenders = 0;
							if(AlertManager.OnAlert(r) == true && Game.rooms[r].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0 && this.targetUnits[r])
							{
							    numDefenders = this.targetUnits[r];
							}else
							{
    							if(targetValue > 0 && buildCost > 0)
    							{
    							    numDefenders = Math.ceil(targetValue / buildCost);
    							    
    							    //It has to take 1000 turns or less to spawn all these things
    							    while(defenderBody.length * 3 * numDefenders > 1000)
    							    {
    							        numDefenders--;
    							    }
    							    if(numDefenders < 1)
    							        numDefenders = 1;
    							    
    							        
    							    this.targetUnits[r] = numDefenders;
    							}
							}
							
                            if(Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'defender')}).length < numDefenders)
                            {
                                SpawnManager.SpawnCreep(militarySpawn, 'defender', defenderBody);
                            }else
                            {
                                for(var i in Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'defender')}))
                                {
                                    Game.creeps[i].memory.numDefenders = numDefenders;
                                }
                                this.defendersSpawnDone[r] = true;
                            }
                        }
                    }else{
                        this.defendersSpawnDone[r] = true;
                        this.targetUnits[r] = 0;
                    }
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
                if(Game.rooms[i].find(FIND_HOSTILE_CREEPS, {filter: c => (c.owner.username != "Invader" && (c.body.length > 10 | this.BoostedCreep(c) == true) && c.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_LINK)}).length > 0)}).length > 0)
                {
                    Memory.defendTimes[i] = Game.time;
                    Game.notify("FULL ALERT: " + i, 5);
                }
            }
        }
    },
	SpawnDone: function(roomName)
	{
		if(roomName in this.defendersSpawnDone)
			return this.defendersSpawnDone[roomName];
		
		return true;
	},
	BoostedCreep: function(creep)
	{
	    for(var i in creep.body)
	    {
	        if(creep.body[i].boost !== undefined)
	            return true;
	    }
	    
	    return false;
	}
	
}
DefenderManager.defendersSpawnDone = [];
DefenderManager.targetUnits = [];

Memory.defendTimes = {}
for(var i in Game.rooms)
{
    if(Game.rooms[i].controller && Game.rooms[i].controller.my)
    {
        Memory.defendTimes[i] = null;
    }
}

module.exports = DefenderManager;