class AircraftSet
{
	constructor(public name: string, public codes: string[])
	{
	}

	static loadSets()
	{
		try
		{
			if (!window.localStorage["aircraftSets"])
				return [];
			else
				return <AircraftSet[]>JSON.parse(window.localStorage["aircraftSets"]);
		}
		catch (err)
		{
			return null;
		}
	}

	static saveSets(sets: AircraftSet[])
	{
		window.localStorage["aircraftSets"] = JSON.stringify(sets);
	}
}