
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
		
		this.buildTicks = Math.max(numMyRooms * 100, 100);
	}
}

BuildManager.SetBuildTicks();

module.exports = BuildManager;