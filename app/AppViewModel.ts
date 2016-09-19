class AppViewModel
{
	static version = 20160916;
	static revision = 0;

	aircraftSets = new AircraftSetsViewModel(this);
	code = new AircraftCodeViewModel(this);

	language = "ja";
	selectingAircraft = false;
	selectedCalculator: Calculator = null;
	selectedPartsCategory = "Current";
	readonly calculators: Calculator[] = [];
	readonly enemies = [ko.observableArray<Enemy>(), ko.observableArray<Enemy>()];
	private _selectedStage: Stage = null;

	constructor(public resources: Resources, loadHash = true)
	{
		loadHash && this.loadHash() || this.reset();
		ko.track(this);
	}

	reset(calculators: Calculator[] = null)
	{
		this.calculators.splice(0, this.calculators.length);

		if (calculators)
			this.calculators.push(...calculators);

		if (this.calculators.length == 0)
			this.addCalculator();
		else
			this.selectedCalculator = this.calculators[0];
	}

	loadHash()
	{
		if (!location.hash && !location.search)
			return false;

		this.calculators.splice(0, this.calculators.length, ...(location.hash || location.search).substr(1).split(/-/g).map(_ => Calculator.load(this.resources, _)));
		this.selectedCalculator = this.calculators[0];

		return true;
	}

	private updateHash()
	{
		let code = "#" + this.calculators.map(_ => _.save()).join("-");

		if (window.history.replaceState && location.hash != code)
			window.history.replaceState(null, null, `${this.getAbsoluteUrl()}${code}`);
	}

	private getAbsoluteUrl()
	{
		let href = location.href;

		if (location.hash)
			href = href.slice(0, -location.hash.length);

		if (location.search)
			href = href.slice(0, -location.search.length);

		return href;
	}

	tweet()
	{
		let code = "#" + this.calculators.map(_ => _.save()).join("-");

		window.open(`https://twitter.com/intent/tweet?text=&hashtags=${encodeURIComponent("infbuild")}&url=${encodeURIComponent(this.getAbsoluteUrl() + code)}`, "_blank"); 
	}

	get aircraftName()
	{
		return this.selectedCalculator.aircraft.name;
	}

	set aircraftName(value: string)
	{
		if (!value)
			return;

		let aircraft = this.resources.aircraftList.byKey(value)

		if (aircraft)
		{
			this.selectedRole = aircraft.role;
			this.selectedCalculator.aircraft = aircraft;
		}
	}

	get aircraftsByRole()
	{
		return this.resources.aircraftList.filter(_ => _.role == this.selectedRole);
	}

	get selectedRole()
	{
		return this.selectedCalculator.aircraft.role;
	}

	set selectedRole(value: AircraftRole)
	{
		if (value != null && this.selectedCalculator.aircraft.role != value)
			this.selectedCalculator.aircraft = this.resources.aircraftList.filter(_ => _.role == value)[0];
	}

	get selectedStage()
	{
		return this._selectedStage;
	}

	set selectedStage(value: Stage)
	{
		this._selectedStage = value;
		this.updateEnemies();
	}

	private updateEnemies()
	{
		for (let i = 0; i < this.enemies.length; i++)
		{
			this.enemies[i].removeAll();
			this.enemies[i].push(...this.resources.enemyList.filter(_ => _.role == i && _.isInStage(this.selectedStage)).sort((x, y) => this.getHitPoint(x) - this.getHitPoint(y)));
		}
	}

	setParts(parts: Parts, addOrRemove: boolean)
	{
		if (addOrRemove && this.selectedCalculator.parts.length >= 7 ||
			!addOrRemove && this.selectedCalculator.parts.length <= 0)
			return false;

		if (addOrRemove)
			this.selectedCalculator.parts.push(parts);
		else
			this.selectedCalculator.parts.remove(parts);

		return true;
	}

	get partsByCategory()
	{
		return this.selectedPartsCategory == "Current" ? this.selectedCalculator.parts : this.resources.partsList.filter(_ => _.category == this.selectedPartsCategory.toUpperCase());
	}

	getHitPoint(enemy: Enemy)
	{
		return enemy.getHitPoint(this.selectedStage, this.selectedRole, this.resources);
	}

	getHitPointClass(enemy: Enemy)
	{
		let hp = this.getHitPoint(enemy);

		return hp > 2500 ? null : hp > 2000 ? "dmg-d2400" : hp > 1600 ? "dmg-d2000" : hp > 1400 ? "dmg-d1600" : null;
	}

	getDamageClass(dmg: number)
	{
		return dmg >= 2400 ? "dmg-d2400" : dmg >= 2000 ? "dmg-d2000" : dmg >= 1600 ? "dmg-d1600" : null;
	}

	private getGaugeLength(enemies: KnockoutObservableArray<Enemy>, damage: number)
	{
		return enemies().filter(_ => damage + 20 > this.getHitPoint(_)).length * 20 + "px";
	}

	getGauges(calculator: Calculator, role: number, type: number, gauge: number)
	{
		gauge++;

		let empty = {
			length: "0",
			text: "",
			damage: 0
		};
		let weapon = [
			calculator.mainWeapon,
			calculator.specialWeapon,
			calculator.specialWeapon,
			calculator.specialWeapon
		][type];

		if (!weapon)
			return empty;

		let damageSource = [
			calculator.result.main,
			calculator.result.special,
			calculator.result.specialStrong,
			calculator.result.specialWeak,
		][type];

		if (!damageSource)
			return empty;

		let damage: number = damageSource[[
			"airDamage",
			"groundDamage"
		][role]] * gauge;
		let rate: number = damageSource[[
			"airRate",
			"groundRate"
		][role]];
		let isUncertain: boolean = damageSource[[
			"isAirRateUncertain",
			"isGroundRateUncertain"
		][role]];

		this.updateHash();

		return {
			length: this.getGaugeLength(this.enemies[role], damage),
			text: gauge > 1
				? `x${gauge}`
				: type < 2
					? `${weapon.name} <b class="${this.getDamageClass(damage)}">${damage}</b> <b class="note ${isUncertain ? "uncertain" : ""}">${rate}</b>`
					: `${weapon.name}${"+-"[type - 2]} <b class="${this.getDamageClass(damage)}">${damage}</b> <b class="note">${type == 2 ? "×" + weapon.strongMultiplier : "÷" + weapon.weakDivider}</b>`,
			damage: damage
		};
	}

	getGaugeClass(calculator: Calculator, role: number, type: number, gauge: number)
	{
		let weapon = [
			calculator.mainWeapon,
			calculator.specialWeapon,
			calculator.specialWeapon,
			calculator.specialWeapon
		][type];

		return [
			["results-gauge-msl", "results-gauge-spw", "results-gauge-strong", "results-gauge-weak"][type],
			gauge > 0 ? "results-gauge-multi" : null,
			weapon.role != SpecialWeaponRole.Other && weapon.role != role ? "results-gauge-none" : null
		].join(" ");
	}

	getEnemyColor(enemy: Enemy)
	{
		return `enemy-${["y", "o", "r", "tgt"][enemy.color]}`;
	}

	getEnemySpecialEffetcs(enemy: Enemy)
	{
		return [
			enemy.weakAgainst
				? enemy.weakAgainst.filter(_ => this.calculators.some(c => c.specialWeapon.name == _))
					.map(_ => `<span class="enemy-strong">${_}+</span>`).join(" ")
				: null,
			enemy.strongAgainst
				? enemy.strongAgainst.filter(_ => this.calculators.some(c => c.specialWeapon.name == _))
					.map(_ => `<span class="enemy-weak">${_}-</span>`).join(" ")
				: null
		].filter(_ => _ != null).join(" ");
	}

	addCalculator()
	{
		let calc = new Calculator(this.resources);

		ko.getObservable(calc, "aircraft").subscribe(_ => this.updateEnemies());
		this.calculators.push(calc);
		this.selectedCalculator = calc;
	}

	removeCalculator()
	{
		if (this.calculators.length <= 1)
			return;

		let idx = this.calculators.indexOf(this.selectedCalculator);

		this.calculators.remove(this.selectedCalculator);
		this.selectedCalculator = this.calculators[Math.max(0, idx - 1)];
	}
}