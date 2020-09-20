
var MemoryManager = 
{
    run: function()
    {
        Memory;
        for(var i in Game.creeps)
        {
            if(!Game.creeps[i])
                delete Game.creeps[i];
        }
    }
}

module.exports = MemoryManager;