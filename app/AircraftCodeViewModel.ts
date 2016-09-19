class AircraftCodeViewModel
{
	code: string = null;

	constructor(private app: AppViewModel)
	{
		ko.track(this);
	}

	showText()
	{
		$('#text-output').val(this.app.calculators.map(_ => _.toDetailString(this.app.language == "en")).join("\n\n"));
		$('#text').toggleClass('visible');
	}

	hideText()
	{
		$('#text').removeClass('visible');
	}
}