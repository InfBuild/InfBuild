class Calculator
{
	static codeVersion = 1;
	static precision = 5;

	static levelRange = [1, 20];
	static specialWeaponLevelRange = [1, 5];
	static maxExtendedSlots = 38;

	aircraft: Aircraft = null;
	level = 1;
	extendedSlots: number = null;
	specialWeapon: SpecialWeapon = null;
	specialWeaponLevel = 1;
	parts: Parts[] = [];
	datalink: Datalink = null;
	criticalActive = false;

	constructor(private resources: Resources)
	{
		this.aircraft = resources.aircraftList.byKey("F-4E");
		this.specialWeapon = this.aircraft.specialWeapons[0];
		this.datalink = resources.datalinkList[0];

		ko.track(this);
	}

	static getRoundedFloat(n: number)
	{
		return parseFloat(n.toPrecision(Calculator.precision));
	}

	get leveledAircraftCost()
	{
		var table = this.aircraft.costTable;
		var acst =
			Math.max(0, table[0] * Math.min(this.level - 1, 9)) +
			Math.max(0, table[1] * Math.min(this.level - 10, 5)) +
			Math.max(0, table[2] * Math.min(this.level - 15, 1)) +
			Math.max(0, table[3] * (this.level - 16));

		return this.aircraft.cost + acst;
	}

	get totalCost()
	{
		return this.leveledAircraftCost +
			this.specialWeapon.costs[this.specialWeaponLevel - 1] +
			this.parts.reduce((x, y) => x + y.cost, 0);
	}

	get totalEquipCost()
	{
		return this.parts.reduce((x, y) => x + y.getPrice(this.aircraft), 0);
	}

	get realLevel()
	{
		if (this.aircraft.role == AircraftRole.Bomber)
		{
			var mgpb = this.resources.specialWeaponList.byKey("MGPB");

			return Calculator.getRoundedFloat(mgpb.levelRate1 + mgpb.levelRateAdditionPerLevel * (this.level - 1));
		}
		else
			return this.level > 15
				? 13 + (this.level - 15) * 0.25
				: this.level > 11
					? 11 + (this.level - 11) * 0.5
					: this.level;
	}

	get realSpecialWeaponLevel()
	{
		return Calculator.getRoundedFloat(this.specialWeapon == null ? 1 : this.specialWeapon.levelRate1 + this.specialWeapon.levelRateAdditionPerLevel * (this.specialWeaponLevel - 1));
	}

	get slotUsage()
	{
		return [PartsSlot.Body, PartsSlot.Arms, PartsSlot.Misc].map(c =>
			this.parts.filter(_ => _.slot == c).reduce((x, y) => x + y.slotUsage, 0));
	}

	get levelAddedSlots()
	{
		return (this.level >= 6 ? 2 : 0) + (this.level >= 15 ? 1 : 0) + (this.level >= 20 ? 1 : 0);
	}

	get extraSlots()
	{
		var ex = parseInt(<any>this.extendedSlots);

		return (ex || 0) + this.levelAddedSlots;
	}

	get maxSlots()
	{
		return this.aircraft.slots.map(_ => Math.min(_ + this.extraSlots, Calculator.maxExtendedSlots + this.levelAddedSlots));
	}

	get mainWeapon()
	{
		return this.aircraft.mainWeapon;
	}

	get result(): IDamageResult
	{
		var critical = this.datalink && this.datalink.id == 2 && this.criticalActive ? 1 : 0;
		var cost = this.aircraft.cost + this.aircraft.cost % 50 + this.aircraft.handicap * 50;
		var special = this.specialWeapon.getResult(this.aircraft.role, cost, this.realSpecialWeaponLevel + critical, this.parts);
		var specialStrong = this.specialWeapon.strongMultiplier;
		var specialWeak = this.specialWeapon.weakDivider;
		var rt: IDamageResult = {
			main: this.mainWeapon.getResult(this.aircraft.role, cost, this.realLevel + critical, this.parts),
			special,
			specialStrong: specialStrong ? special.multiply(specialStrong) : null,
			specialWeak: specialWeak ? special.divide(specialWeak) : null,
		};

		if (this.specialWeapon.relatedDamage)
		{
			var sp = this.specialWeapon;

			do
			{
				var rel = this.resources.specialWeaponList.byKey(sp.relatedDamage);
				var relDamage = rel.getResult(this.aircraft.role, cost, rel.levelRate1 + rel.levelRateAdditionPerLevel * (this.specialWeaponLevel - 1) + critical, []);

				rt.special.airDamage += relDamage.airDamage * rel.numberOfGauges;
				rt.special.groundDamage += relDamage.groundDamage * rel.numberOfGauges;
				sp = rel;
			}
			while (sp.relatedDamage);
		}

		return rt;
	}

	static load(resources: Resources, code: string)
	{
		let rt = new Calculator(resources);

		rt.loadCore(code);

		return rt;
	}

	private loadCore(code: string)
	{
		var version = parseInt(code.substr(0, 2), 36);

		if (version != Calculator.codeVersion)
			throw "invalid version";

		var codebody = code.substr(2);

		if (codebody.length % 2 != 0)
			throw "invalid length";

		var parts = [];

		this.datalink = this.resources.datalinkList[0];

		for (var i = 0; i * 2 < codebody.length; i++)
		{
			var value = parseInt(codebody.substr(i * 2, 2), 36);

			switch (i)
			{
				case 0:
					var a = value == 0 ? null : this.resources.aircraftList.byId(value - 1);

					if (!a)
						throw "invalid aircraft";

					this.aircraft = a;

					break;
				case 1:
					if (value < Calculator.levelRange[0] ||
						value > Calculator.levelRange[1])
						throw "invalid aircraft level";

					this.level = value;

					break;
				case 2:
					this.extendedSlots = value;

					break;
				case 3:
					var s = value == 0 ? null : this.resources.specialWeaponList.byId(value - 1);

					if (!s)
						throw "invalid special weapon";

					this.specialWeapon = s;

					break;
				case 4:
					if (value < Calculator.specialWeaponLevelRange[0] ||
						value > Calculator.specialWeaponLevelRange[1])
						throw "invalid special weapon level";

					this.specialWeaponLevel = value;

					break;
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
				case 10:
				case 11:
					var p = this.resources.partsList.byId(value);

					if (p && !~parts.indexOf(p))
						parts.push(p);

					break;
				case 12:
					this.datalink = this.resources.datalinkList.byId(value);

					break;
			}
		}

		this.parts = parts;
	}

	save()
	{
		var version = ("0" + Calculator.codeVersion.toString(36)).substr(-2);
		var codebody =
			[
				this.aircraft == null ? 0 : this.aircraft.id + 1,
				this.level,
				parseInt(<any>this.extendedSlots),
				this.specialWeapon == null ? 0 : this.specialWeapon.id + 1,
				this.specialWeaponLevel,
			]
				.concat(this.parts.concat([null, null, null, null, null, null, null]).slice(0, 7).map(_ => _ ? _.id : 0))
				.concat([this.datalink ? this.datalink.id : 0])
				.map(_ => ("0" + (_ || 0).toString(36)).substr(-2))
				.join("");

		return version + codebody;
	}

	toString()
	{
		return `${this.aircraft.name} Lv.${this.level} ${this.specialWeapon.name} Lv.${this.specialWeaponLevel}`;
	}

	toDetailString(isEnglish: boolean)
	{
		return [
			`${this.aircraft.name} Lv.${this.level} ${this.specialWeapon.name} Lv.${this.specialWeaponLevel}`,
			"CODE: " + this.save(),
			`BODY: ${this.slotUsage[0]}/${this.maxSlots[0]}, ARMS: ${this.slotUsage[1]}/${this.maxSlots[1]}, MISC: ${this.slotUsage[2]}/${this.maxSlots[2]}${this.extendedSlots > 0 ? ` (+${this.extendedSlots})` : ""}`,
		]
			.concat(this.parts.filter(_ => _.id > 0).map(_ => isEnglish ? _.englishName : _.name))
			.concat([!this.datalink ? "" : isEnglish ? this.datalink.englishName : this.datalink.name]).join("\r\n");
	}
}

interface IDamageResult
{
	main: IDamageSet;
	special: IDamageSet;
	specialStrong: IDamageSet;
	specialWeak: IDamageSet;
}