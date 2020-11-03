
var creepRole = require("CreepRole");
var SpawnManager = require("SpawnManager");

Creep.prototype.RangedDefence = function(creep)
{
	var hostiles = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c => (c.body.length > 1)});
	if(hostiles.length)
	{
		hostiles = _.sortBy(hostiles, c => (c.hits));
		this.rangedAttack(hostiles[0]);
	}
}
Creep.prototype.MeleeDefence = function(creep)
{
	var hostiles = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: c => (c.body.length > 1)});
	if(hostiles.length)
	{
		hostiles = _.sortBy(hostiles, c => (c.hits));
		this.attack(hostiles[0]);
	}
}
Creep.prototype.Demolish = function(target)
{
	//Don't destroy your own base
	if(this.room.controller && this.room.controller.my)
		return;
	
	if(this.pos.inRangeTo(target, 1))
    {
		this.dismantle(target);
    }else
    {
        this.MilitaryMove(target.pos, 1);
    }
}
Creep.prototype.AllignWithHealer = function()
{
	if(this.memory.waitForHealer !== true)
		return false;
	
	var assignedHealers = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'healer' && c.memory.workTargetID == this.id));
	if(assignedHealers.length && assignedHealers[0].room == this.room && !this.pos.inRangeTo(assignedHealers[0].pos, 1))
		return true;
	if(!assignedHealers.length && this.room.name == this.memory.spawnRoom)
	    return true;
	
	return false;
}
//Very CPU intensive ATM. Use with caution.
//It will refuse to recalculate if and only if it's demolishing a structure
//May have civlian applications which is why it's a general prototype
Creep.prototype.MilitaryMove = function(targetPos, range=1)
{
	if(this.memory.inPathID && !Game.getObjectById(this.memory.inPathID))
		delete this.memory.inPathID;
	//Don't move if you're at the target or there's a structure blocking your path
	if((!targetPos || (targetPos && this.pos.inRangeTo(targetPos, range))) | (this.memory.inPathID && Game.getObjectById(this.memory.inPathID)))		
		return;
	
	var numWork = 0;
	//Don't destroy your own structures
	if(!(this.room.controller && this.room.controller.my))
	{
		for(var i = 0; i < this.body.length; i++)
		{
			if(this.body[i].type == WORK)
				numWork++;
		}
	}
	var numDamage = numWork * 50;
	
	let ret = PathFinder.search(
		this.pos, {pos: targetPos, range: range},
		{
		  // We need to set the defaults costs higher so that we
		  // can set the road cost lower in `roomCallback`
		  plainCost: 2,
		  swampCost: 10,
	
		  roomCallback: function(roomName) {
	
			let room = Game.rooms[roomName];
			let costs = new PathFinder.CostMatrix;
			
			for(var x = 0; x < 49; x++)
			{
				costs.set(x, 0, 254);
				costs.set(x, 49, 254);
			}
			for(var y = 0; y < 49; y++)
			{
				costs.set(0, y, 254);
				costs.set(49, y, 254);
			}
			
			if(room)
			{
				room.find(FIND_STRUCTURES).forEach(function(struct) {
				  if (struct.structureType === STRUCTURE_ROAD) {
					// Favor roads over plain tiles
					costs.set(struct.pos.x, struct.pos.y, 1);
				  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
							 (struct.structureType !== STRUCTURE_RAMPART ||
							  !struct.my)) {
					// Can't walk through non-walkable buildings
					if(numDamage > 0)
						costs.set(struct.pos.x, struct.pos.y, Math.ceil(struct.hits / numDamage));
					else
						costs.set(struct.pos.x, struct.pos.y, 0xff);
				  }
				});
				room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function(struct){
					if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
						costs.set(struct.pos.x, struct.pos.y, 0xff);
				});
				room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
					costs.set(c.pos.x, c.pos.y, 0xff);
				});
				room.find(FIND_MY_CREEPS).forEach(function(c){
					costs.set(c.pos.x, c.pos.y, 16);
				});
			}
	
			return costs;
		  },
		}
	  );
	  
	  if(ret.path.length)
	  {
		  if(numWork > 0)
		  {
			var blockingPath = ret.path[0].findInRange(FIND_STRUCTURES, 0, {filter: s => (s.structureType !== STRUCTURE_CONTAINER && (s.structureType !== STRUCTURE_RAMPART || !s.my))}); 
			if(blockingPath.length)
				this.memory.inPathID = blockingPath[0].id
		  }

		this.move(this.pos.getDirectionTo(ret.path[0]));
	  }
}
Creep.prototype.Garrison = function(targetAllies, endProxyTarget)
{
    
	//After you reach your target or if you were never assigned a target, go.
	if(this.memory.garrisoned !== false)
		return true;
	
	if(!targetAllies)
	{
		this.AvoidEdges();
		return false;
	}
	
	//If you're still waiting for a healer, stop.
	if(this.AllignWithHealer() === true)
	{
		this.AvoidEdges();
		return false;
	}
	
	if(this.room.name != endProxyTarget && this.memory.proxyExit && Game.map.describeExits(this.room.name)[this.memory.proxyExit] == endProxyTarget)
	{
	    if(this.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == this.memory.role && c.fatigue == 0 && c.hits == c.hitsMax && (!c.memory.proxyExit || (c.memory.proxyExit && c.pos.findClosestByRange(c.memory.proxyExit).inRangeTo(c.pos, 2))))}).length >= targetAllies)
	    {
			var creeps = this.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == this.memory.role)});
	        for(var c in creeps)
			{
				creeps[c].memory.proxyTarget = endProxyTarget;
				delete creeps[c].memory.garrisoned;
				delete creeps[c].memory.numGarrison;
				delete creeps[c].memory.garrisonTarget;
			}
        	return true;
	    }else
	    {
	        if(this.memory.proxyTarget && this.pos.findClosestByRange(this.memory.proxyExit).inRangeTo(this.pos, 1))
	            delete this.memory.proxyTarget;
	        return false;
	    }
	}
	if(this.memory.proxyTarget != endProxyTarget)
	    this.memory.proxyTarget = endProxyTarget;
	
	return false;
	
	/*var allGarrisoning = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == this.memory.role && c.memory.garrisoned == false && c.memory.garrisonTarget == this.memory.garrisonTarget));
	if(allGarrisoning.length < targetAllies || (allGarrisoning.length >= targetAllies && (!Game.rooms[garrisonRoom] || (Game.rooms[garrisonRoom] && Game.rooms[garrisonRoom].find(allGarrisoning).length < targetAllies))))
	{
		if(this.room.name == garrisonRoom)
			this.AvoidEdges();
		else
			this.memory.proxyTarget = garrisonRoom;
		return false;
	}*/
	
	
}

var CreepRoleMilitary = Object.create(creepRole);
//There's no need to check if your store is full since military units don't have one
CreepRoleMilitary.run = function(creep)
{
	if(creep.memory.garrisoned === false)
		creep.Garrison(creep.memory.numGarrison, creep.memory.garrisonTarget);
	var workTarget = this.WorkTarget(creep);
	if(workTarget)
		this.Work(creep, workTarget);
	else
	{
		var offTarget = this.OffTarget(creep);
		if(offTarget)
			this.OffWork(creep, offTarget);
	}
}
delete CreepRoleMilitary.IsWorking;

module.exports = CreepRoleMilitary;