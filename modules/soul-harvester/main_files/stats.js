function Stats(prefix) {
	this.storagePrefix = prefix;
}

Stats.prototype.Save = function ()
{
	localStorage[this.storagePrefix+'DNA'] = this.dna;
	localStorage[this.storagePrefix+'Credits'] = this.credits;
	
	localStorage[this.storagePrefix+'DNAClicks'] = this.dnaClicks;
	localStorage[this.storagePrefix+'MineClicks'] = this.mineClicks;
	
	localStorage[this.storagePrefix+'CreaturesHired'] = this.creaturesHired;
	localStorage[this.storagePrefix+'TechniciansHired'] = this.techniciansHired;
	localStorage[this.storagePrefix+'CrewHired'] = this.crewHired;
	localStorage[this.storagePrefix+'BuildingsBuilt'] = this.buildingsBuilt;
	
	localStorage[this.storagePrefix+'ResearchPurchased'] = this.researchPurchased;
}

Stats.prototype.Reset = function ()
{
	// Persistent stats:
	this.dna = 0;
	this.credits = 0;
	
	this.dnaClicks = 0;
	this.mineClicks = 0;
	
	this.creaturesHired = 0;
	this.techniciansHired = 0;
	this.crewHired = 0;
	this.buildingsBuilt = 0;
	
	this.researchPurchased = 0;
}

Stats.prototype.Load = function ()
{
	var value = localStorage[this.storagePrefix+'DNA'];
	if(value !== undefined)
	{
		this.dna = parseInt(value);
	}
		
	value = localStorage[this.storagePrefix+'Credits'];
	if(value !== undefined)
	{
		this.credits = parseInt(value);
	}
		
	value = localStorage[this.storagePrefix+'DNAClicks'];
	if(value !== undefined)
	{
		this.dnaClicks = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'MineClicks'];
	if(value !== undefined)
	{
		this.mineClicks = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'CreaturesHired'];
	if(value !== undefined)
	{
		this.creaturesHired = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'TechniciansHired'];
	if(value !== undefined)
	{
		this.techniciansHired = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'CrewHired'];
	if(value !== undefined)
	{
		this.crewHired = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'BuildingsBuilt'];
	if(value !== undefined)
	{
		this.buildingsBuilt = parseInt(value);
	}
	
	value = localStorage[this.storagePrefix+'ResearchPurchased'];
	if(value !== undefined)
	{
		this.researchPurchased = parseInt(value);
	}
}
