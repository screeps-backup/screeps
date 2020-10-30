var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleBaseBasher = Object.create(creepRoleMilitary);
CreepRoleBaseBasher.run = function(creep)
{
    if(creep.memory.garrisoned === false)
		creep.Garrison(creep.memory.numGarrison, creep.memory.garrisonTarget);
	//No melee since this will be almost exclusively shooting over walls
    if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
    {
		//Wait for healer if you are in transit
		if(creep.AllignWithHealer() == false)
			creep.CivilianExitMove(creep.memory.proxyTarget);
		creep.RangedDefence();
    }else
    {   
		var target = this.WorkTarget(creep);
        if(target)
		{
			if(creep.pos.inRangeTo(target, 1))
				creep.demolish(target);
			else if(creep.AllignWithHealer() == false)
				this.Work(creep, target);
			else
				creep.RangedDefence();
		}else
			creep.RangedDefence();
			
		//We want this to be prioritized after the work movement. May have to run first.
		
    }
}
CreepRoleBaseBasher.WorkTarget = function(creep)
{
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => (s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_CONTROLLER)});
    if(!target)
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(creep.room.name == creep.memory.proxyTarget)
	{
		if(target)
			creep.say('RAID!!!');
		else
			creep.say('VICTORY!');
	}
    return target;
}
CreepRoleBaseBasher.Work = function(creep, target)
{
    var buildSites = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1, {filter: s => (s instanceof ConstructionSite)});
    buildSites.concat(creep.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, 1));
    if(buildSites.length)
        creep.rangedAttack(buildSites[0]);
    else
		creep.RangedDefence();
	
	if(target)
        creep.Demolish(target);
}


module.exports = CreepRoleBaseBasher;