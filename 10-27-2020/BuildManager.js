
var BuildManager = 
{
	run: function()
	{
		if(Game.time % 100 == 0)
		{
			this.SetBuildTicks();
		}
	},
	SetBuildTicks: function()
	{
		var numMyRooms = 0;
		
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my)
				numMyRooms++;
		}
		
		this.buildTicks = Math.min(Math.max(numMyRooms * 10, 10), 450);
	}
}

BuildManager.SetBuildTicks();

module.exports = BuildManager;