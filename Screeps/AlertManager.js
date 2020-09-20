
var AlertManager = 
{
    run: function()
    {
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
    },
    AlertHostileCreepAttack: function(room)
    {
        if(room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 0)}).length)
        {
            Game.notify("ATTACK AT: " + room.name);
            console.log("ATTACK AT: " + room.name);
        }
    }
}

module.exports = AlertManager;