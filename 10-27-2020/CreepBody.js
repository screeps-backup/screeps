var CreepBody = function(config)
{
    this.numTough = config.numTough || 0;
    this.numWork = config.numWork || 0;
    this.numCarry = config.numCarry || 0;
    this.numMove = config.numMove || 0;
    this.numClaim = config.numClaim || 0;
    this.numRangedAttack = config.numRangedAttack || 0;
    this.numAttack = config.numAttack || 0;
	this.numHeal = config.numHeal || 0;
}

CreepBody.prototype.BuildCost = function()
{
    var cost = 0;
    cost += this.numTough * BODYPART_COST['tough'];
    cost += this.numWork * BODYPART_COST['work'];
    cost += this.numCarry * BODYPART_COST['carry'];
    cost += this.numMove * BODYPART_COST['move'];
    cost += this.numClaim * BODYPART_COST['claim'];
    cost += this.numRangedAttack * BODYPART_COST['ranged_attack'];
    cost += this.numAttack * BODYPART_COST['attack'];
	cost += this.numHeal * BODYPART_COST['heal'];
    return cost;
}

module.exports = CreepBody;