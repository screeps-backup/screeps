
//750 = ~0.5HR
const defendTicks = 750;

var AlertManager = 
{
    run: function()
    {
		if(Game.cpu.bucket <= 3000)
		{
			console.log("LOW CPU: " + Game.cpu.bucket);
			Game.notify("LOW CPU: " + Game.cpu.bucket, 5);
		}
		
        for(var i in Memory.outpostNames)
        {
            for(var a in Memory.outpostNames[i])
            {
                if(Game.rooms[Memory.outpostNames[i][a]] && Game.rooms[Memory.outpostNames[i][a]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1 && c.owner.username !== "Invader")}).length > 0)
                {
                    Game.notify('PROXY UNDER ATTACK: ' + Memory.outpostNames[i][a], 15);
					console.log('PROXY UNDER ATTACK: ' + Memory.outpostNames[i][a]);
                }
            }
        }
        
        var flagRoomNames = [];
        for(var i in Game.flags)
        {
            if(Game.flags[i].name.includes("Claim") && Game.rooms[Game.flags[i].pos.roomName] && !flagRoomNames.includes(Game.flags[i].pos.roomName))
                flagRoomNames.push(Game.flags[i].pos.roomName);
        }
        
        for(var i in flagRoomNames)
        {
            this.AlertHostileCreepAttack(Game.rooms[flagRoomNames[i]]);
        }
		for(var i in Game.rooms)
		{
			if(!(i in flagRoomNames) && Game.rooms[i].controller && Game.rooms[i].controller.my)
				this.AlertHostileCreepAttack(Game.rooms[i]);
		}
		if(Game.time % 50 == 0)
		{
		    for(var i in Game.creeps)
		    {
	            Game.creeps[i].notifyWhenAttacked(false);
		    }
		}
		
		if(Game.flags['Report'])
		{
		    var roomName = Game.flags['Report'].pos.roomName;
		    if(Game.rooms[roomName])
		    {
		        if(Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
		        {
		            this.BaseReport(Game.rooms[roomName]);
		        }else
		        {
		            this.OutpostReport(Game.rooms[roomName]);
		        }
		    }
		}
		
		for(var i in Game.rooms)
		{
		    this.AlertDeaths(Game.rooms[i]);
		}
		
		if(Game.time % 100 == 0)
		{
		    for(var i in Game.rooms)
		    {
		        if(Game.rooms[i].controller && Game.rooms[i].controller.my)
		        {
		            if(Game.rooms[i].find(FIND_NUKES).length > 0)
		            {
		                Game.notify("HOLY CRAP!!! A NUKE AT " + Game.rooms[i].name + "! AHHHHHHHHHH!!!!!!");
		            }
		        }
		    }
		}
		
		if(!Memory.currentCredits || (Memory.currentCredits && Memory.currentCredits != Game.market.credits))
		{
			if(Memory.currentCredits)
			{
				var delta = Game.market.credits - Memory.currentCredits;
				Game.notify(delta.toString() + " credits change from an intial balance of " + Memory.currentCredits.toString());
				Memory.currentCredits = Game.market.credits;
			}else
			{
				Memory.currentCredits = Game.market.credits;
				Game.notify("Inital credits: " + Game.market.credits.toString());
			}
		}
		
		/*
		if(Game.time % 100 == 0)
		    Game.notify(new Date(Date.now()), 60);
		if(Game.time % 100 == 0)
		{
		    for(var i in Game.rooms)
		    {
		        if(Game.rooms[i].controller && Game.rooms[i].controller.my && Game.rooms[i].storage)
		            this.IssueReport(Game.rooms[i]);
		    }
		}
		*/
    },
    AlertHostileCreepAttack: function(room)
    {
        if(room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1 && c.owner.username !== "Invader")}).length)
        {
            Game.notify("ATTACK AT: " + room.name, 10);
            console.log("ATTACK AT: " + room.name);
        }
    },
    OnAlert: function(roomName)
    {
        if(Game.rooms[roomName].controller && Game.rooms[roomName].controller.my && (roomName in Memory.defendTimes))
        {
            return Memory.defendTimes[roomName] + defendTicks >= Game.time;
        }
        
        return false;
    },
    UnitValue: function(unitBody)
    {
        //If there's a scout, ignore it
        if(unitBody.length == 1)
            return 0;
        
        //If there's a non-combat creep, take care of it
        if(this.IsCombatCreep(unitBody) == false)
            return 1;
        
        var toReturn = 0;
        for(var i in unitBody)
        {
			//Presume all combat units move at max speed and count work and carry as deadweight, thus wasting one move piece
			if(unitBody[i].type == 'work' || unitBody[i].type == 'carry')
			{
				toReturn -= 50;
			}else
			{
				var currentValue = BODYPART_COST[unitBody[i].type.toString()];
				if(unitBody[i].boost !== undefined)
				{
					//Boosts listed in order they were found in the docs
					switch(unitBody[i].boost)
					{
						//Tough
						case 'GO':
							//An approximation of 1 / 0.7
							currentValue *= 1.4;
							break;
						
						case 'UH':
						case 'KO':
						case 'LO':
						case 'ZO':
						case 'GHO2':
						currentValue *= 2;
							break;
						case 'UH2O':
						case 'KHO2':
						case 'LHO2':
						case 'ZHO2':
						case 'XGHO2':
						currentValue *= 3;
							break;
						case 'XHU2O':
						case 'XKHO2':
						case 'XLHO2':
						case 'XZHO2':
						currentValue *= 4;
							break;					
						default:						
							Game.notify('Unused boost (AlertManager): ' + unitBody[i].boost);
							console.log('Unused boost (AlertManager): ' + unitBody[i].boost);
							break;
					}
					
					toReturn += currentValue;
				}
			}
        }
        
		if(toReturn <= 0)
			return 0;
		return toReturn;
    },
    IsCombatCreep: function(body)
    {
        for(var i in body)
        {
            if(body[i].type == ATTACK || body[i].type == HEAL || body[i].type == RANGED_ATTACK)
                return true;
        }
        
        return false;
    },
	HostilesValue: function(room)
	{
		var toReturn = 0;
		var hostiles = room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
		for(var i in hostiles)
			toReturn += this.UnitValue(hostiles[i].body);
		
		if(toReturn == 0)
			return null;
		
		return toReturn;
	},
	BaseReport: function(room)
	{
	    if(Game.time % 650 == 0)
	    {
    	    if(room.storage)
    	    {
    	        if(this.previousStorageEnergy)
    	        {
    	            Game.notify("Storage energy (" + room.name + "): " + this.previousStorageEnergy + " + " + (room.storage.store[RESOURCE_ENERGY] - this.previousStorageEnergy), 10);
    	            this.previousStorageEnergy = room.storage.store[RESOURCE_ENERGY];
    	        }else
    	        {
    	            Game.notify("Inital storage energy (" + room.name + "): " + room.storage.store[RESOURCE_ENERGY], 10);
    	            this.previousStorageEnergy = room.storage.store[RESOURCE_ENERGY];
    	        }
    	    }else
    	    {
    	        Game.notify("No storage: " + room.name, 10);
    	    }
	    }
	},
	OutpostReport: function(room)
	{
	    //Report the amount of energy left when the sources are about to respawn
	    sources = room.find(FIND_SOURCES);
	    if(sources.length)
	    {
	        for(var i in sources)
	        {
	            if(sources[i].ticksToRegeneration == 1)
	            {
	                Game.notify("Harvested " + (sources[i].energyCapacity - sources[i].energy) + "energy at " + room.name);
	            }
	        }
	    }
	},
	AlertDeaths: function(room)
	{
	    var myDeaths = room.find(FIND_TOMBSTONES, {filter: t => (t.creep.my == true && t.creep.ticksToLive !== 1 && t.deathTime == Game.time - 1 && !t.creep.name.startsWith("Mapper"))});
	    for(var i in myDeaths)
	    {
	        Game.notify(myDeaths[i].creep.name + " died at " + room.name, 5);
	        console.log(myDeaths[i].creep.name + " died at " + room.name);
	    }
	    var theirDeaths = room.find(FIND_TOMBSTONES, {filter: t => (!t.creep.name.includes("Scout") && t.creep.my == false && t.creep.ticksToLive !== 1 && t.deathTime == Game.time - 1)});
	    for(var i in theirDeaths)
	    {
	        if(theirDeaths[i].creep.owner.username != 'Source Keeper')
	        {
    	        if(theirDeaths[i].pos.findInRange(FIND_MY_CREEPS, 1).length > 0)
    	        {
        	        Game.notify("You killed " + theirDeaths[i].creep.owner.username + "'s " + theirDeaths[i].creep.name + " at " + room.name, 5);
        	        console.log("You killed " + theirDeaths[i].creep.owner.username + "'s " + theirDeaths[i].creep.name + " at " + room.name);
    	        }else
    	        {
    	            Game.notify(theirDeaths[i].creep.owner.username + "'s " + theirDeaths[i].creep.name + " died at " + room.name, 5);
        	        console.log(theirDeaths[i].creep.owner.username + "'s " + theirDeaths[i].creep.name + " died at " + room.name);
    	        }
	        }
	    }
	    
	}
}
Memory.defendTimes = [];

module.exports = AlertManager;