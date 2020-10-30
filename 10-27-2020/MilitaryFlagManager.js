var MilitaryFlagManager =
{
  run: function(){
    if (Game.time % 20 == 0)
      this.SetupFlagNames()
  },
  SetupFlagNames: function(){
    Memory.militaryFlagNames = {}
    Memory.militaryFlagNames['demolish'] = []
    Memory.militaryFlagNames['attackDemolish'] = []
    Memory.militaryFlagNames['baseBash'] = []
    for (var i in Game.flags)
    {
      if (i.toLowerCase().startsWith('attackdemolish'))
      {
          Memory.militaryFlagNames['attackDemolish'].push(Game.flags[i].pos.roomName);
      }else if (i.toLowerCase().startsWith('demolish'))
      {
          Memory.militaryFlagNames['demolish'].push(Game.flags[i].pos.roomName);
      }else if (i.toLowerCase().startsWith('basebash'))
      {
          Memory.militaryFlagNames['baseBash'].push(Game.flags[i].pos.roomName);
      }
    }
  }
}

MilitaryFlagManager.SetupFlagNames();

module.exports = MilitaryFlagManager;