var CreepBody = require('CreepBody');
var spawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

//9000 ticks = ~6 hours
const maxBaseBashRemove = 9000;
var baseBashCountdown = maxBaseBashRemove;

var baseBasherBodies = [new CreepBody({numTough: 7, numMove: 20, numWork: 8, numAttack: 5}), new CreepBody({numTough: 4, numMove: 15, numWork: 6, numAttack: 5})];

var BaseBasherManager = 
{
    run: function()
    {
		if(Game.flags['BaseBash'])
		{
			if(baseBashCountdown <= 0)
				Game.flags['BaseBash'].remove();
			else
				baseBashCountdown--;
				
		}else
		{
			baseBashCountdown = maxBaseBashRemove;
		}
		
        if(Game.flags['MilitarySpawn'])
        {
            var r = Game.flags['MilitarySpawn'].pos.roomName;
            if(Game.rooms[r] && Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 3 && spawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
            {
                for(var i in Memory.militaryFlagNames['baseBash'])
                {
                    var spawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military") && !s.spawnCooldownTime)})[0] || null;
                    if(!spawn)
                        spawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0] || null;
                    
                    if(spawn)
                    {
                        
						var baseBashers = spawnManager.GlobalCreepsByRole('baseBasher').filter(c => (c.memory.garrisonTarget === null && c.memory.spawnRoom == spawn.room.name));
						if(baseBashers.length)
						    baseBashers = _.sortBy(baseBashers, b => (b.ticksToLive)); 
                        if((!baseBashers.length && !spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'baseBasher')}).length) || (baseBashers.length && baseBashers[0].ticksToLive > 1000))
						{
						    
							this.spawnDone[r] = false;
							var baseBasherBody = spawnManager.SelectBody(spawn.room.energyCapacityAvailable, baseBasherBodies);
							if(baseBasherBody)
								spawnManager.SpawnCreep(spawn, 'baseBasher', baseBasherBody, {waitForHealer: true, garrisoned: false, numGarrison: 1000, garrisonTarget: null});
						}else
						{
						    var all = spawnManager.GlobalCreeps().filter(c => (c.memory.role == 'baseBasher' && c.memory.spawnRoom == spawn.room.name && c.memory.garrisonTarget === null));
						    var allHaveHealers = all.filter(c => (c.memory.healerID && Game.getObjectById(c.memory.healerID) && Game.getObjectById(c.memory.healerID).memory.workTargetID == c.id && c.room == Game.getObjectById(c.memory.healerID).room)).length == all.length;
						    if(allHaveHealers == true)
						    {
    						    for(var i in all)
    						    {
    						        all[i].memory.numGarrison = all.length;
    						        all[i].memory.garrisonTarget = Memory.militaryFlagNames['baseBash'][i];
    						    }
    						    this.spawnDone[r] = true;
						    }
						}
                    }
                }
            }else
			{
				if(r)
					this.spawnDone[r] = true;
			}
        }
    },
	SpawnDone: function(roomName)
	{
	    if(!Game.flags['BaseBash'])
	        return true;
		if(roomName in this.spawnDone)
			return this.spawnDone[roomName];
		
		return true;
	}
}
BaseBasherManager.spawnDone = [];

module.exports = BaseBasherManager;