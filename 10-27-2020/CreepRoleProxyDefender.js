
//Add defence flags to proxy mine rooms

var creepRoleDefender = require("CreepRoleDefender");

var CreepRoleProxyDefender = Object.create(creepRoleDefender);

CreepRoleProxyDefender.run = function(creep)
{
	creep.RangedDefence();
	creep.MeleeDefence();
	if(creep.memory.garrisoned === false)
		creep.Garrison(creep.memory.numGarrison, creep.memory.garrisonTarget);
	
	if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
	{
		creep.CivilianExitMove(creep.memory.proxyTarget, true);
    }else if(creep.memory.garrisoned !== false) 
    {
        creepRoleDefender.run.call(this, creep);
    }
}
CreepRoleProxyDefender.WorkTarget = function(creep)
{
	var allHostiles = creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
	var hostiles = creep.pos.findInRange(allHostiles, 1);
	if(!hostiles.length)
		hostiles = creep.pos.findInRange(allHostiles, 3);
	if(!hostiles.length)
		hostiles = allHostiles;
	
	if(hostiles.length)
	{
		hostiles = _.sortBy(hostiles, c => (c.hits));
		return hostiles[0];
	}
	
	return null;
}
CreepRoleProxyDefender.OffTarget = function(creep)
{
    if(creep.room.name != creep.memory.spawnRoom)
        creep.CivilianExitMove(creep.memory.spawnRoom);
    return null;
}

module.exports = CreepRoleProxyDefender;