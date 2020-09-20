
var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');

var DefenderManager = 
{
    run: function()
    {
        this.SetupDefendTimes();
        //if (Game.time % 10 == 0)
        //{
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].find(FIND_MY_CREEPS).filter(c => (c.memory.role == 'carrier' && c.ticksToLive > c.body.length * 3)).length && Memory.defendTimes)
                {
                    if(Memory.defendTimes[r] && Game.time - Memory.defendTimes[r] <= 100)
                    {
                        var militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military"))})[0];
                        if(!militarySpawn)
                            militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS)[0];
                        
                        if(militarySpawn && Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'defender')}).length < 3)
                        {
                            //var oneMinerBody = SpawnManager.SelectBody(militarySpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 2, numMove: 4, numWork: 2}), new CreepBody({numCarry: 1, numMove: 2, numWork: 1})]);
                            SpawnManager.SpawnCreep(militarySpawn, 'defender', [MOVE, ATTACK]);
                        }
                    }
                }
            }
        //}
    },
    SetupDefendTimes: function()
    {
        for(var i in Game.rooms)
        {
            if(Game.rooms[i].controller && Game.rooms[i].controller.my && Memory.defendTimes)
            {
                if(Game.rooms[i].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                    Memory.defendTimes[i] = Game.time;
            }
        }
    }
}

Memory.defendTimes = {}
for(var i in Game.rooms)
{
    if(Game.rooms[i].controller && Game.rooms[i].controller.my)
    {
        Memory.defendTimes[i] = null;
    }
}

module.exports = DefenderManager;