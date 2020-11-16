
var spawnManager = require("SpawnManager");

var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleHealer = Object.create(creepRoleMilitary);

CreepRoleHealer.run = function(creep)
{
    if(!creep.memory.workTargetID || (creep.memory.workTargetID && (!Game.getObjectById(creep.memory.workTargetID) || (Game.getObjectById(creep.memory.workTargetID) && Game.getObjectById(creep.memory.workTargetID).room.name == creep.room.name))))
    {
        if((creep.pos.x == 0 | creep.pos.x == 49 | creep.pos.y == 0 | creep.pos.y == 49) != 0)
        {
            creep.AvoidEdges();
        }
    }
    creepRoleMilitary.run.call(this, creep);
}
//This is only designed for units that need dedicated healers
//Design a differnt healer for defenders
CreepRoleHealer.WorkTarget = function(creep)
{
	if(creep.hits < creep.hitsMax)
		return creep;
	
	var target = Game.getObjectById(creep.memory.workTargetID) || null;
	if(target)
	{
		creep.SayMultiple(['On target.', 'All good.']);
		return target;
	}
	
	creep.SayMultiple(['NO TARGET', 'CRAP', 'OH NO']);
	delete creep.memory.workTargetID;
	
	var targets = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => (c.hits < c.hitsMax && (c.memory.role == 'baseBasher' || c.memory.role == 'healer'))});
	if(!targets.length)
		targets = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c => (c.hits < c.hitsMax && (c.memory.role === 'baseBasher' || c.memory.role == 'healer'))});
	
	if(targets.length)
	{
		targets = _.sortBy(targets, t => (t.hits - t.hitsMax));
		creep.memory.workTargetID = targets[0].id;
		return targets[0];
	}
	
	return null;
}
CreepRoleHealer.Work = function(creep, target)
{
	var moveTarget = Game.getObjectById(creep.memory.workTargetID) || null;
	if(moveTarget)
	{
		if(creep.pos.inRangeTo(moveTarget, 1))
		{
			if(creep.pos != moveTarget.pos)
				creep.move(creep.pos.getDirectionTo(moveTarget.pos));
		}else
		{
			creep.MilitaryMove(moveTarget.pos, 1);
		}
	}else
	{
		if(creep.pos.inRangeTo(target, 1))
			creep.move(creep.pos.getDirectionTo(target.pos));
		else
			creep.MilitaryMove(target.pos, 1);
	}
	
	if(creep.hits < creep.hitsMax)
	{
		creep.heal(creep);
	}else
	{
		if(creep.pos.inRangeTo(target, 1))
		{
			creep.heal(target);
		}else if(creep.pos.inRangeTo(target, 3))
		{
			creep.rangedHeal(target);
		}
	}
}
CreepRoleHealer.OffTarget = function(creep)
{
	var creepsToHeal = creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'baseBasher' && !spawnManager.GlobalCreeps().filter(cB => (cB.memory.role == 'healer' && cB.memory.workTargetID == c.id)).length)});
	if(creepsToHeal.length)
	{
		creep.memory.workTargetID = creepsToHeal[0].id;
		creepsToHeal[0].memory.healerID = creep.id;
		return creepsToHeal[0];
	}
	
	creep.heal(creep);
	return null;
}
CreepRoleHealer.OffWork = function(creep, target)
{
	this.Work(creep, target);
}

module.exports = CreepRoleHealer;