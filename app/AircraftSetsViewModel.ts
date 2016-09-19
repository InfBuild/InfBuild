class AircraftSetsViewModel
{
	readonly sets = AircraftSet.loadSets();
	selectedSet: AircraftSet = null;
	setSaveName: string = null;

	constructor(private app: AppViewModel)
	{
		ko.track(this);
		ko.getObservable(this, "selectedSet").subscribe(_ => 
		{
			if (this.selectedSet)
				this.setSaveName = this.selectedSet.name;
		});
	}

	get isEnabled()
	{
		return this.sets != null;
	}

	load()
	{
		this.app.reset(this.selectedSet.codes.map(_ => Calculator.load(this.app.resources, _)));
		this.hideLoad();
	}

	save()
	{
		let set = new AircraftSet(this.setSaveName, this.app.calculators.map(_ => _.save()));

		if (this.selectedSet)
			this.sets.splice(this.sets.indexOf(this.selectedSet), 1, set);
		else
			this.sets.push(set);

		this.selectedSet = set;

		AircraftSet.saveSets(this.sets);
		this.hideSave();
	}

	remove()
	{
		if (this.selectedSet)
		{
			this.sets.remove(this.selectedSet);
			AircraftSet.saveSets(this.sets);
		}
	}

	showLoad()
	{
		this.hideSave();
		$('#load-aircraftset').toggleClass('visible');
	}

	hideLoad()
	{
		$('#load-aircraftset').removeClass('visible');
	}

	showSave()
	{
		this.hideLoad();
		$('#save-aircraftset').toggleClass('visible');
		$('#save-aircraftset-name').focus();
	}

	hideSave()
	{
		$('#save-aircraftset').removeClass('visible');
	}
}