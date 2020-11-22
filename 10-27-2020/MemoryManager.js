
var MemoryManager = 
{
    run: function()
    {
        Memory;
        for(var i in Memory.creeps)
        {
            if(!Game.creeps[i])
            {
                delete Memory.creeps[i];
            }else 
            {
                if(Game.creeps[i].memory.proxyTarget && Game.creeps[i].memory.proxyTarget == Game.creeps[i].room.name)
                {
                    if(Game.creeps[i].memory.proxyTargetVar)
                        delete Game.creeps[i].memory.proxyTargetVar;
                    if(Game.creeps[i].memory.proxyExit)
                        delete Game.creeps[i].memory.proxyExit;
                }
				if(Game.creeps[i].fatigue == 0)
				{
					if(Game.creeps[i].memory.lastX && Game.creeps[i].memory.lastY)
					{
						if(Game.creeps[i].memory.lastX == Game.creeps[i].pos.x && Game.creeps[i].memory.lastY == Game.creeps[i].pos.y)
						{
							delete Game.creeps[i].memory._move;
                            delete Game.creeps[i].memory.civPath;
                            delete Game.creeps[i].memory.targetPos;
							delete Game.creeps[i].lastX;
							delete Game.creeps[i].lastY;
							Game.creeps[i].memory.toSet = false;
						}else if(Game.creeps[i].memory.toSet != true && Game.creeps[i].memory.lastX && Game.creeps[i].memory.lastY)
						{
							Game.creeps[i].memory.toSet = true;
						}else
						{
						    delete Game.creeps[i].memory.lastX;
						    delete Game.creeps[i].memory.lastY;
							Game.creeps[i].memory.toSet = false;
						}
					}
					//if(!(Game.creeps[i].memory.lastX == Game.creeps[i].pos.x && Game.creeps[i].memory.lastY == Game.creeps[i].pos.y) && (!Game.creeps[i].memory.civPath || (Game.creeps[i].memory.civPath && !Game.creeps[i].memory.civPath.length)))
					
				    Game.creeps[i].memory.lastX = Game.creeps[i].pos.x;
				    Game.creeps[i].memory.lastY = Game.creeps[i].pos.y;
					
				}
            }
        }
    }
}
MemoryManager.creepPoses = [];

module.exports = MemoryManager;