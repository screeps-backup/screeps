
var LinkManager = 
{
	run: function()
	{
	    for(var i in Game.rooms)
	    {
	        if(Game.rooms[i].controller && Game.rooms[i].controller.my)
	        {
	            var loaderLink = this.LoaderLink(Game.rooms[i]);
	            var controllerLink = this.ControllerLink(Game.rooms[i]);
	            if(loaderLink)
	            {
	                if(controllerLink && controllerLink.store[RESOURCE_ENERGY] == 0)
	                    loaderLink.transferEnergy(controllerLink);
	            }
	        }
	    }
	},
	LoaderLink: function(room)
	{
		var spawn = room.find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0] || null;
		if(spawn)
			return spawn.pos.findInRange(FIND_MY_STRUCTURES, 5, {filter: s => (s.structureType === STRUCTURE_LINK)})[0] || null;
		
		return null;
	},
	ControllerLink: function(room)
	{
	    return room.controller.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_LINK)})[0] || null;
	}
}

module.exports = LinkManager;