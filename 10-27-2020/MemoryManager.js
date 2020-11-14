
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
				//If you've stopped moving for 2 ticks or have an empty path for more than 1 tick
                if((Game.creeps[i].memory.civMovingTicks && Game.creeps[i].memory.civMovingTicks - Game.time < -2) | (Game.creeps[i].memory.civMovingTicks && Game.creeps[i].memory.civMovingTicks - Game.time < -1 && (Game.creeps[i].memory.civPath && !Game.creeps[i].memory.civPath.length)))
                {
                    delete Game.creeps[i].memory.civMovingTicks;
                    delete Game.creeps[i].memory.civPath;
                    delete Game.creeps[i].memory.targetPos;
                }
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
							delete Game.creeps[i].memory.civMovingTicks;
                            delete Game.creeps[i].memory.civPath;
                            delete Game.creeps[i].memory.targetPos;
						}else
						{
						    delete Game.creeps[i].memory.lastX;
						    delete Game.creeps[i].memory.lastY;
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