
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
            }
        }
    }
}

module.exports = MemoryManager;