
var CPUCounter = 
{
	run: function()
	{
	    var total = 0;
		for(var i in this.CPUCounts)
			total += this.CPUCounts[i];
			
		this.overallTotals.push(total);
		
	    if(Game.time % 100 == 0)
    		if(this.countName !== null && this.CPUCounts.length > 0)
    		{
    		    console.log("Count name: " + this.countName);
    			
    			var overallTotal = 0;
    			for(var i in this.overallTotals)
    				overallTotal += this.overallTotals[i];
    			console.log("Count overall average: " + this.RoundResult(overallTotal / this.overallTotals.length));
    			Game.notify("Count  overall(" + this.countName + ") average: " + this.RoundResult(overallTotal / this.overallTotals.length));
    			
    			var max = 0;
    			for(var i in this.overallTotals)
    				max = Math.max(max, this.overallTotals[i]);
    			console.log("Count max total: " + this.RoundResult(max));
    			Game.notify("Count max total (" + this.countName + "): " + this.RoundResult(max));
    			
    			var min = Infinity;
    			for(var i in this.overallTotals)
    				min = Math.min(min, this.overallTotals[i]);
    			console.log("Count min: " + this.RoundResult(min));
    			Game.notify("Count min (" + this.countName + "): " + this.RoundResult(min));
    			
    			this.overallTotals = [];
    		}
		this.Reset();
	},
	Reset: function()
	{
		this.countName = null;
		this.startCPU = null;
		this.CPUCounts = [];
	},
	StartCount: function(name)
	{
		this.countName = name;
		this.startCPU = Game.cpu.getUsed();
	},
	EndCount: function(name)
	{
		if(this.countName === null)
		{
			console.log("CPU COUNT ENDED BEFORE IT BEGAN: " + name);
			return;
		}
		if(this.startCPU === null)
		{
			console.log("MULTIPLE CPU ENDS: " + name);
			return;
		}
		else if(this.countName !== name)
		{
			console.log("MULTIPLE CPU NAMES: " + this.countName + ', ' + name);
			return;
		}
		
		var toAdd = Game.cpu.getUsed() - this.startCPU;
		this.CPUCounts.push(toAdd);
		this.startCPU = null;
	},
	RoundResult: function(number)
	{
		return Math.round(number * 100) / 100;
	}
}
CPUCounter.Reset();
CPUCounter.overallTotals = [];

module.exports = CPUCounter;