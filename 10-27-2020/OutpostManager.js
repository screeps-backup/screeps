
var OutpostManager =
{
  run: function(){
    if (Game.time % 20 == 0)
      this.SetupOutpostNames()
  },
  SetupOutpostNames: function(){
    Memory.outpostNames = {}
    for(var i in Game.rooms)
    {
        if(Game.rooms[i].controller && Game.rooms[i].controller.my)
        {
            Memory.outpostNames[i] = []
        }
    }
    for (var flag in Game.flags)
    {
      if (flag.toLowerCase().startsWith('outpost'))
      {
        Memory.outpostNames[flag.replace('-', '').slice(7, flag.toString().replace('-', '').length)].push(Game.flags[flag].pos.roomName);
      }
    }
  }
}

OutpostManager.SetupOutpostNames();

module.exports = OutpostManager;
