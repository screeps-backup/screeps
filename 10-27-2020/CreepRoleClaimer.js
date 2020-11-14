
var creepRole = require("CreepRole");

var CreepRoleClaimer = Object.create(creepRole);

CreepRoleClaimer.run = function(creep)
{
	if(creep.memory.proxyTarget && creep.room.name != creep.memory.proxyTarget)
	{
		creep.CivilianExitMove(creep.memory.proxyTarget);
	}else
	{
		if(creep.room.controller && !creep.room.controller.my)
		{
			if(creep.pos.inRangeTo(creep.room.controller, 1))
			{
				if(creep.room.controller.owner)
				{
					creep.attackController(creep.room.controller);
				}else
				{
					creep.claimController(creep.room.controller);
				}
			}else
			{
				creep.CivilianMove(creep.room.controller.pos, 1);
			}
		}
	}
}

module.exports = CreepRoleClaimer;
