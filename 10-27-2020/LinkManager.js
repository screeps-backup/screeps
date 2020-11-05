
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
	            if(loaderLink && loaderLink.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
	            {
	                if(controllerLink && controllerLink.store[RESOURCE_ENERGY] == 0)
	                    loaderLink.transferEnergy(controllerLink);
	            }
	        }
	    }
	},
	LoaderLink: function(room)
	{
	    if(room.storage)
			return room.storage.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: s => (s.structureType === STRUCTURE_LINK)})[0] || null;
		
		return null;
	},
	ControllerLink: function(room)
	{
	    return room.controller.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_LINK)})[0] || null;
	}
}

module.exports = LinkManager;