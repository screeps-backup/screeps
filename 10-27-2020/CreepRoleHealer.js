
var spawnManager = require("SpawnManager");

var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleHealer = Object.create(creepRoleMilitary);

CreepRoleHealer.run = function(creep)
{
    if(!creep.memory.workTargetID || (creep.memory.workTargetID && (!Game.getObjectById(creep.memory.workTargetID) || (Game.getObjectById(creep.memory.workTargetID) && Game.getObjectById(creep.memory.workTargetID).room.name == creep.room.name))))
    {
        if(creep.pos.x == 0 | creep.pos.x == 49 | creep.pos.y == 0 | creep.pos.y == 49)
        {
            creep.AvoidEdges();
        }
    }
    creepRoleMilitary.run.call(this, creep);
}
CreepRoleHealer.WorkTarget = function(creep)
{
	if(creep.hits < creep.hitsMax)
		return creep;
	
	var target = Game.getObjectById(creep.memory.workTargetID) || null;
	if(target && target.hits < target.hitsMax)
		return target;
	
	var targets = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => (c.hits < c.hitsMax)});
	if(!targets.length)
		targets = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c => (c.hits < c.hitsMax)});
	if(targets.length)
	{
		targets = _.sortBy(targets, t => (t.hits - t.hitsMax));
		return targets[0];
	}
	
	//Heal the ID target by default if there's nothing damaged
	return target;
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
	}
	
	if(creep.pos.inRangeTo(target, 1))
	{
		creep.heal(target);
	}else if(creep.pos.inRangeTo(target, 3))
	{
		creep.rangedHeal(target);
	}
}
CreepRoleHealer.OffTarget = function(creep)
{
	var creepsToHeal = creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role != 'healer' && !spawnManager.GlobalCreeps().filter(cB => (cB.memory.role == 'healer' && cB.memory.workTargetID == c.id)).length)});
	if(creepsToHeal.length)
	{
		creep.memory.workTargetID = creepsToHeal[0].id;
		creepsToHeal[0].memory.healerID = creep.id;
	}
	
	creep.heal(creep);
	return null;
}

module.exports = CreepRoleHealer;