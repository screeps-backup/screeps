
//Add defence flags to proxy mine rooms

var creepRoleDefender = require("CreepRoleDefender");

var CreepRoleProxyDefender = Object.create(creepRoleDefender);

CreepRoleProxyDefender.run = function(creep)
{
	creep.RangedDefence();
	if(creep.memory.garrisoned === false)
		creep.Garrison(creep.memory.numGarrison, creep.memory.garrisonTarget);
	
	if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
	{
	    creep.MeleeDefence();
		creep.CivilianExitMove(creep.memory.proxyTarget);
    }else if(creep.memory.garrisoned !== false) 
    {
        creepRoleDefender.run.call(this, creep);
    }else
    {
        creep.MeleeDefence();
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

module.exports = CreepRoleProxyDefender;