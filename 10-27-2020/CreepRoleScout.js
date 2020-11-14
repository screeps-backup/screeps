
var creepRole = require("CreepRole");

var CreepRoleScout = Object.create(creepRole);

CreepRoleScout.run = function(creep)
{
    var isWorking = this.IsWorking(creep);
    if(isWorking == true)
        this.Work(creep);
}
CreepRoleScout.IsWorking = function(creep)
{
	//Stay stationary forever after you reach your objective
		//Standby to objserve
    if(creep.memory.isWorking === false)
        return false;
    
    var isWorking = !(creep.room.name === creep.memory.proxyTarget && (creep.pos.x > 3 && creep.pos.y > 3 && creep.pos.x < 46 && creep.pos.y < 46));
	if(isWorking == false)
		creep.memory.isWorking = false;
	else if(creep.room.name == creep.memory.proxyTarget)
	    creep.AvoidEdges();
	return isWorking;
}
CreepRoleScout.Work = function(creep)
{
	if(creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
}

module.exports = CreepRoleScout;