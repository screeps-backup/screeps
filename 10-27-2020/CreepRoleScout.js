
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
    
    var isWorking = !(creep.room.name === creep.memory.proxyTarget && (creep.pos.x > 2 && creep.pos.y > 2 && creep.pos.x < 47 && creep.pos.y < 47));
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