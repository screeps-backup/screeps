
var avoidRoomsManager = require("AvoidRoomsManager");

Creep.prototype.OtherCreepsOnWorkTarget = function(targetID)
{
	for(var i in Game.creeps)
	{
		if(Game.creeps[i].name != this.name && Game.creeps[i].memory.role == this.memory.role && Game.creeps[i].memory.workTargetID == targetID)
			return true;
	}
	return false;
}
Creep.prototype.LeastOtherCreepsOnWorkTarget = function(targets)
{
    var numOnTargets = [];
    for(var i in targets)
    {
        numOnTargets[targets[i].id] = 0;
        for(var a in Game.creeps)
        {
            if(Game.creeps[a].name != this.name && Game.creeps[a].memory.role == this.memory.role && Game.creeps[a].memory.workTargetID == targets[i].id)
                numOnTargets[targets[i].id]++;
        }
    }
    
    
    return SortLeast(targets, numOnTargets);
}
Creep.prototype.OtherCreepsOnOffTarget = function(targetID)
{
	for(var i in Game.creeps)
	{
		if(Game.creeps[i].name != this.name && Game.creeps[i].memory.role == this.memory.role && Game.creeps[i].memory.offTargetID == targetID)
			return true;
	}
	return false;
}
Creep.prototype.LeastOtherCreepsOnOffTarget = function(targets)
{
    var numOnTargets = [];
    for(var i in targets)
    {
        numOnTargets[targets[i].id] = 0;
        for(var a in Game.creeps)
        {
            if(Game.creeps[a].name != this.name && Game.creeps[a].memory.role == this.memory.role && Game.creeps[a].memory.offTargetID == targets[i].id)
                numOnTargets[targets[i].id]++;
        }
    }
    
    
    return SortLeast(targets, numOnTargets);
}
var SortLeast = function(targets, numOnTargets)
{
    if(targets.length)
    {
        var lowestOnTarget = numOnTargets[targets[0].id];
        for(var i in targets)
        {
            if(numOnTargets[targets[i].id] < lowestOnTarget)
                lowestOnTarget = numOnTargets[targets[i].id];
        }
        var newNumOnTargets = [];
        for(var i in targets)
        {
            if(numOnTargets[targets[i].id] == lowestOnTarget)
            {
                newNumOnTargets[targets[i].id] = numOnTargets[targets[i].id];
            }
        }
        numOnTargets = newNumOnTargets;
        
        
        var toReturn = [];
        //Otherwise just pick the last one
        for(var key in numOnTargets)
        {
            toReturn.push(Game.getObjectById(key));
        }
        
        return toReturn;
    }
    
    return [];
}
Creep.prototype.ResetMemory = function()
{
	delete this.memory.workTargetID;
	delete this.memory.offTargetID;
}
Creep.prototype.UseExit = function(exitDir)
{
	var exitPos = this.pos.findClosestByRange(exitDir, {filter: p => (p.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_ROAD)}).length > 0)});
	if(!exitPos)
		exitPos = this.pos.findClosestByPath(exitDir);
	
	return exitPos;
}
Creep.prototype.GetExitPos = function(exitDir)
{
	switch(exitDir)
	{
		case 1:
			return this.UseExit(FIND_EXIT_TOP);
		case 3:
			return this.UseExit(FIND_EXIT_RIGHT);
		case 5:
			return this.UseExit(FIND_EXIT_BOTTOM);
		case 7:
			return this.UseExit(FIND_EXIT_LEFT);
		default:
			return null;
	}
}
Creep.prototype.ProxyMoveDir = function(proxyTarget)
{
	if((this.pos.x === 0 | this.pos.x === 49 | this.pos.y === 0 | this.pos.y === 49) != 0)
	{
		delete this.memory.proxyExit;
	}else if(this.room.name === proxyTarget)
	{
		return null;
	}
	
	//if(!this.memory.proxyExit)
	//{
		//delete the proxy exit to reset the target
	if(Memory.avoidRoomNames.includes(proxyTarget) == false && avoidRoomsManager.civAvoidRooms[proxyTarget] != true)
	{
		var startRoom = this.room.name;
		const route = Game.map.findRoute(this.room.name, proxyTarget, {
		routeCallback(roomName, fromRoomName) {
			if(roomName != startRoom && (avoidRoomsManager.civAvoidRooms[roomName] == true || (avoidRoomsManager.civAvoidRooms[roomName] != true && Memory.avoidRoomNames.includes(roomName)))) {    // avoid this room
				return Infinity;
			}
			return 1;
		}});
		if(route.length)
		{
			this.memory.proxyExit = route[0].exit;
		}
	}
	//}
	
	return this.memory.proxyExit || null;
}
Creep.prototype.AvoidEdges = function()
{
	if(this.pos.findInRange(FIND_CREEPS, 1).length < 2)
	{
		if(this.pos.x == 0)
			this.move(RIGHT);
		else if(this.pos.x == 49)
			this.move(LEFT);
		else if(this.pos.y == 0)
			this.move(BOTTOM);
		else if(this.pos.y == 49)
			this.move(TOP);
		else if((this.pos.x <= 6 | this.pos.x >= 44 | this.pos.y <= 6 | this.pos.y >= 44) != 0)
			this.moveTo(new RoomPosition(25, 25, this.room.name));
		else if((this.pos.findInRange(FIND_MY_SPAWNS, 5).length > 0 | this.pos.findInRange(FIND_SOURCES, 1).length > 0) != 0)
			this.moveTo(new RoomPosition(25, 25, this.room.name));
	}
    else 
	{	
		if((this.pos.x <= 6 | this.pos.x >= 44 | this.pos.y <= 6 | this.pos.y >= 44) != 0)
			this.moveTo(new RoomPosition(25, 25, this.room.name));
		else if((this.pos.findInRange(FIND_MY_SPAWNS, 5).length > 0 | this.pos.findInRange(FIND_SOURCES, 1).length > 0) != 0)
			this.moveTo(new RoomPosition(25, 25, this.room.name));
	}
	
	return false;
}
Creep.prototype.moveOffsets = {
	1: [0, 1],
	2: [1, 1],
	3: [1, 0],
	4: [1, -1],
	5: [0, -1],
	6: [-1, -1],
	7: [-1, 0],
	8: [-1, 1]
}
Creep.prototype.PathBlocked = function()
{
	//let it be noted that this doesn't work with inter-room travel
	if(!this.memory.civPath || (this.memory.civPath && !this.memory.civPath.length))
		return false;
	
	//I'm wagering this civMove will rarely encounter hostiles since military units have a different pathfinder
	//New construction sites will only appear when playing or a wall is destroyed
		//The walls are self regeneratog so that opening will be very temporary gameplay is rare
	if(this.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => ((c.memory.civPath === undefined | c.fatigue !== 0) != 0)}).length)
		return true;
	
	//If there's a possibility of crashing into an ally than presume you will and recalculate
		//There's a 50/50 chance of this happening and no way to tell if it will
	
	return false;
}
Creep.prototype.AtLastPos = function()
{
    if(this.fatigue != 0)
	{
		//this.say(true);
        return true;
    }
	if((this.memory.lastX == this.pos.x && this.memory.lastY == this.pos.y && this.memory.toSet == true) == true)
	{
		//this.say(true);
        return true;
    }
	//this.say(this.memory.civPath == undefined);
	return this.memory.civPath === undefined;
	//return (!this.memory.civPath || (this.memory.civPath && !this.memory.civPath.length));
}
Creep.prototype.CivilianMove = function(targetPos, range=0, maxSaveMoves=5)
{
    delete this.memory.lastX;
    delete this.memory.lastY;
	
	if(targetPos.roomName != this.room.name)
	{
	    this.memory.proxyTarget = targetPos.roomName;
	}
	
	if(this.pos.inRangeTo(targetPos, Math.max(1, range)))
	{
	    this.memory.lastX = this.pos.x;
	    this.memory.lastY = this.pos.y;
	}else
	{
		if(this.fatigue != 0)
		{
			this.memory.lastX = this.pos.x;
			this.memory.lastY = this.pos.y;
		}
	}
	var path = this.memory.civPath;
	
	if(((this.pos.x == 0 || this.pos.x == 49) | (this.pos.y == 0 || this.pos.y == 49)) != 0)
	{
	    this.AvoidEdges();
	}else if(range == 0 && this.pos.inRangeTo(targetPos, 1))
	{
		this.move(this.pos.getDirectionTo(targetPos));
	}else
	{
    	var self = this;
		//console.log( | this.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => (c.name != self.name && c.AtLastPos() == true)}).length > 0);
    	if(((!path || (path && !path.length)) | (this.memory.targetPos && !(targetPos.x == this.memory.targetPos.x && targetPos.y == this.memory.targetPos.y && targetPos.roomName == this.memory.targetPos.roomName)) | this.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => (c.name != self.name && c.AtLastPos() == true)}).length > 0) != 0)
    	{
    	path = PathFinder.search(self.pos, {pos: targetPos, range: range}, {
					ignoreCreeps: true, 
					maxRooms: 1, 
					plainCost: 2,
					swampCost: 10,
					roomCallback: function(roomName) {
    				var costMatrix = new PathFinder.CostMatrix;
    				if(Game.rooms[roomName])
    				{
    					Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function(struct) {
    					  if (struct.structureType === STRUCTURE_ROAD) {
    						// Favor roads over plain tiles
    						costMatrix.set(struct.pos.x, struct.pos.y, 1);
    					  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
    								 (struct.structureType !== STRUCTURE_RAMPART ||
    								  !struct.my)) {
    						// Can't walk through non-walkable buildings
    						costMatrix.set(struct.pos.x, struct.pos.y, 0xff);
    					  }
    					});
    					Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES).forEach(function(struct){
    						if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
    							costMatrix.set(struct.pos.x, struct.pos.y, 0xff);
    					});
    					Game.rooms[roomName].find(FIND_HOSTILE_CREEPS).forEach(function(c){
    						costMatrix.set(c.pos.x, c.pos.y, 0xff);
    					});
    					
    					var keepers = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {filter: c => (c.owner.username === 'Source Keeper')});
    					if(keepers.length)
    					{
    						keepers.forEach(function(c){
    							for(var x = -4; x < 4; x++)
    							{
    								for(var y = -4; y < 4; y++)
    								{
    									costMatrix.set(c.pos.x + x, c.pos.y + y, 0xff);
    								}
    							}
    						});
    						Game.rooms[roomName].find(FIND_MINERALS).forEach(function(c){
    							for(var x = -4; x < 4; x++)
    							{
    								for(var y = -4; y < 4; y++)
    								{
    									costMatrix.set(c.pos.x + x, c.pos.y + y, 0xff);
    								}
    							}
    						});
    					}
    					var myCreeps = Game.rooms[roomName].find(FIND_MY_CREEPS, {filter: c => (c.name != self.name)});
    					for(var i in myCreeps)
    					{
    						if(myCreeps[i].AtLastPos() == true)
    							costMatrix.set(myCreeps[i].pos.x, myCreeps[i].pos.y, 0xff);
    						else
    							costMatrix.set(myCreeps[i].pos.x, myCreeps[i].pos.y, 1);
    					}
    				}
    				
    				return costMatrix;
    			}
    		}).path;
    		this.memory.civPath = [];
    		var pathLength = Math.min(maxSaveMoves, path.length);
    		var lastPos = self.pos;
    		for(var i = 0; i < pathLength; i++)
    		{
    			this.memory.civPath.push(lastPos.getDirectionTo(path[i]));
    			lastPos = path[i];
    		}
    		this.memory.targetPos = targetPos;
    	}
    	
    	if(this.fatigue == 0)
    	{
    		if(this.memory.civPath && this.memory.civPath.length)
    		{
    			this.move(this.memory.civPath.shift());
    		}
    	}
	}
	
	return;
	
	if(this.room.name !== targetPos.roomName || (this.room.name === targetPos.roomName && !this.pos.inRangeTo(targetPos, range)))
	{
		//The timestamp used to allow civMove to timeout when not used
		this.memory.civMovingTicks = Game.time;
	}
	  
	  var self = this;
	 
	  if(self.pos.findInRange(FIND_MY_CREEPS, 2, {filter: c => (c !== self)}).length > 0 | (!this.pos.inRangeTo(targetPos, range) && (!this.memory.civPath || (this.memory.civPath && !this.memory.civPath.length))))
	  {
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
				
				//This BS makes them avoid exiting the room except when absolutely nececary
				//I don't bother checking if there's a wall to save CPU since the creep is already targeting a wall
				
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
						costs.set(struct.pos.x, struct.pos.y, 0xff);
					  }
					});
					room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct){
						if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
							costs.set(struct.pos.x, struct.pos.y, 0xff);
					});
					room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
						costs.set(c.pos.x, c.pos.y, 0xff);
					});
					var keepers = room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.owner.username === 'Source Keeper')});
					if(keepers.length)
					{
    					keepers.forEach(function(c){
    						for(var x = -4; x < 4; x++)
    						{
    							for(var y = -4; y < 4; y++)
    							{
    								costs.set(c.pos.x + x, c.pos.y + y, 0xff);
    							}
    						}
    					});
    					room.find(FIND_MINERALS).forEach(function(c){
    						for(var x = -4; x < 4; x++)
    						{
    							for(var y = -4; y < 4; y++)
    							{
    								costs.set(c.pos.x + x, c.pos.y + y, 0xff);
    							}
    						}
    					});
    					room.find(FIND_HOSTILE_STRUCTURES, {filter: s => (s.owner == 'Source Keeper')}).forEach(function(c){
    						for(var x = -4; x < 4; x++)
    						{
    							for(var y = -4; y < 4; y++)
    							{
    								costs.set(c.pos.x + x, c.pos.y + y, 0xff);
    							}
    						}
    					});
					}
					if(self.pos.findInRange(FIND_MY_CREEPS, 1).length > 1)
					{
    					room.find(FIND_MY_CREEPS, {filter: c => (c.pos.inRangeTo(self, 2))}).forEach(function(c){
    						costs.set(c.pos.x, c.pos.y, 0xff);
    					});
					}
				}
	
			return costs;
		  },
		}
	  );
		
		
		  var lastPos = this.pos;
		  //Save the current path to a max # of 
		  this.memory.civPath = [];
		  var pathEndLength = Math.min(ret.path.length, maxSaveMoves);
		  for(var i = 0; i < pathEndLength; i++)
		  {
			  this.memory.civPath.push(lastPos.getDirectionTo(ret.path[i]));
			  lastPos = ret.path[i];
		  }
	  }
	  
	  if(this.memory.civPath && this.memory.civPath.length)
	  {
	          if(this.move(this.memory.civPath[0]) == OK)
    	            this.memory.civPath.shift();
	  }
}
Creep.prototype.CivilianExitMove = function(targetRoomName=null)
{
    if(!targetRoomName)
        targetRoomName = this.memory.proxyTarget;
	if(!targetRoomName && !this.memory.civExitPos)
		return;
	
	if((this.pos.x == 49 | this.pos.x == 0 | this.pos.y == 49 | this.pos.y == 0) != 0)
	{
	    delete this.memory.proxyExit;
	    delete this.memory.civExitPos;
	    this.AvoidEdges();
	    return;
	}
	
	var moveDir = this.memory.proxyExit;
	
	if((!this.memory.civExitPos && this.pos.x != 49 && this.pos.x != 0 && this.pos.y != 49 && this.pos.y != 0) || (this.memory.civExitPos && this.HasCivPath(new RoomPosition(this.memory.civExitPos.x, this.memory.civExitPos.y, this.memory.civExitPos.roomName)) == false))
	{
	    moveDir = this.ProxyMoveDir(targetRoomName);
	    this.memory.proxyExit = moveDir;
		delete this.memory.civExitPos;
	}
	
	
	if(this.memory.civExitPos)
	{
	    var targetPos = new RoomPosition(this.memory.civExitPos.x, this.memory.civExitPos.y, this.memory.civExitPos.roomName);
	    this.CivilianMove(targetPos, 0);
	}
	else
	{
    	if(this.memory.proxyExit)
    	{
			this.memory.civExitPos = this.pos.findClosestByPath(this.memory.proxyExit, {filter: p => (p.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_ROAD)}).length > 0)});
			if(!this.memory.civExitPos)
				this.memory.civExitPos = this.UseExit(this.memory.proxyExit);
    	}
	}
}
Creep.prototype.RunAway = function()
{
	if((this.room.name !== this.memory.spawnRoom && this.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length) || (this.room.name == this.memory.spawnRoom && this.memory.proxyTarget && (!Game.rooms[this.memory.proxyTarget] || (Game.rooms[this.memory.proxyTarget] && Game.rooms[this.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length))))
	{
		if(this.room.name == this.memory.spawnRoom)
		{
			this.AvoidEdges();
		    this.SayMultiple(["Escaped!", "Thank god.", "I lived!"]);
		}else
		{
			this.CivilianExitMove(this.memory.spawnRoom);
			this.SayMultiple(["PANIC!", "AHH!!!", "RUN!", "DOOMED", "CRAP!"]);
		}
		
		return true;
	}
	
	return false;
}

Creep.prototype.HasCivPath = function(singleTarget)
{
	if(singleTarget.pos)
		singleTarget = singleTarget.pos;
	return ( singleTarget.roomName != this.room.name || ( singleTarget.roomName == this.room.name && (Game.time % 10 != 0 || (Game.time % 10 == 0 && this.pos.findClosestByPath([singleTarget]))) ) );
}

Creep.prototype.SayMultiple = function(textArray)
{
	if(!this.saying)
		this.say(textArray[Math.floor(Math.random() * textArray.length)]);
}

//Checks if there is a walkable block next to the target
Room.prototype.Surrounded = function(xSpot, ySpot)
{
	for(var x = -1; x < 1; x++)
	{
		for(var y = -1; y < 1; y++)
		{
			if(!(x == 0 && y == 0))
			{
				if(this.LookFull(this.lookAt(xSpot + x, ySpot + y)) == false)
					return false
			}
		}
	}
	
	return true
}
Room.prototype.LookFull = function(look)
{
	for(var i in look)
	{
		if(look[i].type == LOOK_CREEPS || (look[i].type == LOOK_TERRAIN && look[i].terrain == 'wall'))
			return true
	}
	
	return false
}

var CreepRole =
{
	
}
CreepRole.run = function(creep)
{
    
	if(((creep.pos.x == 0 || creep.pos.x == 49) | (creep.pos.y == 0 || creep.pos.y == 49)) != 0)
		creep.AvoidEdges();
	
    var lastWorking = creep.memory.isWorking === true;
    var isWorking = this.IsWorking(creep);
    if(lastWorking != creep.memory.isWorking)
        creep.ResetMemory(creep);
        
    if(isWorking === true)
    {
        var workTarget = this.WorkTarget(creep);
        if(workTarget)
            this.Work(creep, workTarget);
    }else
    {
        //Off work is usually the refuel function
        var offTarget = this.OffTarget(creep);
        if(offTarget)
            this.OffWork(creep, offTarget);
    }
}

module.exports = CreepRole;
