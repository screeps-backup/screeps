
const totalWaitTicks = 1500 * 4;
//Distance just below 50% on shipping
const energyShippingDist = 20;

var MarketManager = 
{
	ShouldRun: function(hoursOffset)
	{
		return Game.ticks + hoursOffset * 1500 % totalWaitTicks == 0;
	},
	ShouldRunPixel: function()
	{
		return this.ShouldRun(0);
	}
}

module.exports = MarketManager;