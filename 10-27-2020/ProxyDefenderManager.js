
var CreepBody = require("CreepBody");
var spawnManager = require("SpawnManager");
var alertManager = require("AlertManager");
var defenderManager = require("DefenderManager");

var proxyDefenderBodies = [new CreepBody({numTough: 5, numMove: 17, numRangedAttack: 2, numAttack: 10}), new CreepBody({numTough: 1, numMove: 13, numRangedAttack: 2, numAttack: 10}), new CreepBody({numTough: 7, numMove: 13, numRangedAttack: 1, numAttack: 5}), new CreepBody({numMove: 2, numAttack: 2})]

var ProxyDefenderManager = 
{
	run: function()
	{
		for(var i in Memory.outpostNames)
		{
			if(Game.rooms[i] && Game.rooms[i].controller && Game.rooms[i].controller.my && spawnManager.normalSpawnDone[i] == true)
			{
				this.SpawnRoom(i);
			}
		}
	},
	SpawnRoom: function(roomName)
	{
		if(defenderManager.SpawnDone(roomName) == false)
			return;
		
		var spawn = Game.rooms[roomName].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Military') && !s.spawnCooldownTime)})[0] || null;
		if(!spawn)
			spawn = Game.rooms[roomName].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0] || null;
		
		if(spawn)
		{
			var proxyDefenderBody = spawnManager.SelectBody(Game.rooms[roomName].energyCapacityAvailable, proxyDefenderBodies);
			for(var a in Memory.outpostNames[roomName])
			{
				if(Game.rooms[Memory.outpostNames[roomName][a]])					
				{
					if(Game.rooms[Memory.outpostNames[roomName][a]].find(FIND_HOSTILE_CREEPS, {filter: s => (s.body.length > 1)}).length)
					{	
						if(proxyDefenderBody)
						{
							var targetValue = alertManager.HostilesValue(Game.rooms[Memory.outpostNames[roomName][a]]);
							targetValue = targetValue * 1.15;
							
							var buildCost = spawnManager.BuildCost(proxyDefenderBody);
							if(buildCost > 0)
							{
								var targetUnits = Math.ceil(targetValue / buildCost);
								while(proxyDefenderBody.length * 3 * targetUnits > 1000)
							    {
							        targetUnits--;
							    }
								if(targetUnits < 1)
									targetUnits = 1;
								this.targetUnits[roomName] = targetUnits;
								
									
								//Set the proxy target after the spawning is done
								if(!spawnManager.GlobalCreeps().filter(c => (c.memory.role == 'proxyDefender' && c.memory.proxyTarget && c.memory.proxyTarget != c.memory.spawnRoom && c.memory.spawnRoom == roomName)).length)
								{
									var currentUnits = spawnManager.GlobalCreeps().filter(c => (c.memory.role == 'proxyDefender' && c.memory.spawnRoom == roomName && (c.memory.proxyTarget === undefined || c.memory.proxyTarget == roomName)));
									if(currentUnits.length < targetUnits)
									{
										//Spawn with garrised = false
										this.defendersSpawnDone[Memory.outpostNames[roomName][a]] = false;
										spawnManager.SpawnCreep(spawn, 'proxyDefender', proxyDefenderBody, {garrisoned: false, numGarrison: null});
									}else
									{
										for(var i in currentUnits)
										{
											currentUnits[i].memory.garrisonTarget = Memory.outpostNames[roomName][a];
											currentUnits[i].memory.numGarrison = targetUnits;
										}
										this.defendersSpawnDone[Memory.outpostNames[roomName][a]] = true;
									}
								}
							}
						}
					}else if(this.targetUnits[Memory.outpostNames[roomName][a]] && this.targetUnits[Memory.outpostNames[roomName][a]] > 0)
					{
					    var currentUnits = Game.rooms[roomName].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'proxyDefender' && !c.memory.proxyTarget)}) || [];
    					if(currentUnits.length < this.targetUnits[Memory.outpostNames[roomName][a]])
    					{
    						//Spawn with garrised = false
    						this.defendersSpawnDone[Memory.outpostNames[roomName][a]] = false;
    						spawnManager.SpawnCreep(spawn, 'proxyDefender', proxyDefenderBody, {garrisoned: false, numGarrison: null});
    					}
					}else
					{
					    this.defendersSpawnDone[Memory.outpostNames[roomName][a]] = true;
					}
				}
			}
		}
	},
	SpawnRoomDone: function(spawnRoomName)
	{
		if(!(spawnRoomName in Memory.outpostNames))
			return true;
		for(var roomName in Memory.outpostNames[spawnRoomName])
		{
			if(this.defendersSpawnDone[roomName] === false)
				return false;
		}
		
		
		return true;
	}
}
ProxyDefenderManager.defendersSpawnDone = [];
ProxyDefenderManager.targetUnits = [];

module.exports = ProxyDefenderManager;