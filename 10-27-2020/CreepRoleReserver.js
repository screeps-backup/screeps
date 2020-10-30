var creepRole = require('CreepRole');

var CreepRoleReserver = Object.create(creepRole);

CreepRoleReserver.run = function(creep)
{
    if(creep.RunAway() == true)
        return;
    
    if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
    {
		creep.CivilianExitMove(creep.memory.proxyTarget);
    }else
    {
        if(creep.room.controller)
			this.Work(creep, creep.room.controller);
        
    }
}
CreepRoleReserver.Work = function(creep, target)
{
	if(creep.pos.inRangeTo(target, 1))
	{
		if((!target.owner || (target.owner && !target.owner.username)) || target.my)
		{
			creep.reserveController(target);
		}else if(!creep.room.controller.my)
		{
			creep.attackController(target);
		}
	}else
	{
		creep.CivilianMove(target.pos, 1);
	}
}

module.exports = CreepRoleReserver;