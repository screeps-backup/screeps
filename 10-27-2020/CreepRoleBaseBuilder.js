
var creepRoleBuilder = require("CreepRoleBuilder");

var CreepRoleBaseBuilder = Object.create(creepRoleBuilder);

CreepRoleBaseBuilder.run = function(creep)
{
	if(creep.memory.proxyTarget && creep.room.name != creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
	else
		creepRoleBuilder.run.call(this, creep);
}

module.exports = CreepRoleBaseBuilder;