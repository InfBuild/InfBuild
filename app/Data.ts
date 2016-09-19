class Resources
{
	constructor(
		public aircraftList: IIdDictionaryArray<Aircraft>,
		public specialWeaponList: IIdDictionaryArray<SpecialWeapon>,
		public partsList: IIdDictionaryArray<Parts>,
		public enemyList: Enemy[],
		public datalinkList: IIdDictionaryArray<Datalink>,
		public stageList: IIdDictionaryArray<Stage>
	)
	{
	}
}

interface IDictionaryArray<T> extends Array<T>
{
	byKey(key: string): T;
}

interface IIdDictionaryArray<T> extends IDictionaryArray<T>
{
	byId(id: number): T;
}

class Aircraft
{
	index: number;
	id: number;
	name: string;
	role: AircraftRole;
	cost: number;
	handicap: number;
	isHandicapUncertain: boolean;
	mainWeapon: SpecialWeapon;
	specialWeapons: SpecialWeapon[];
	slots: number[];
	costTable: number[];
	equipCost: number;
	isEquipCostUncertain: boolean;

	static fromJsonObject(specialWeaponList: IIdDictionaryArray<SpecialWeapon>, index: number, obj: any)
	{
		let rt = new Aircraft();

		for (let i in obj)
			if (i == "mainWeapon")
				rt.mainWeapon = specialWeaponList.byKey(obj[i]);
			else if (i == "specialWeapons")
				rt.specialWeapons = (<string[]>obj[i]).map(specialWeaponList.byKey);
			else if (i == "role")
				rt.role = AircraftRole.parse(obj[i]);
			else
				rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
}

enum AircraftRole
{
	Fighter,
	Multirole,
	Attacker,
	Bomber,
	PistonFighter,
}

module AircraftRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "F":
				return AircraftRole.Fighter;
			case "M":
				return AircraftRole.Multirole;
			case "A":
				return AircraftRole.Attacker;
			case "B":
				return AircraftRole.Bomber;
			case "PF":
				return AircraftRole.PistonFighter;
			default:
				throw new Error(`Invalid AircraftRole: ${str}`);	
		}
	}
}

class SpecialWeapon
{
	index: number;
	id: number;
	name: string;
	role: SpecialWeaponRole;
	category: string;
	airRate: number[] = [];
	isAirRateUncertain: boolean[] = [];
	groundRate: number[] = [];
	isGroundRateUncertain: boolean[] = [];
	strongMultiplier: number;
	weakDivider: number;
	numberOfGauges: number;
	levelRate1: number;
	levelRateAdditionPerLevel: number;
	isLevelRateUncertain: boolean;
	fixedBaseCost: number;
	relatedDamage: string;
	costs: number[];

	static fromJsonObject(index: number, obj: any)
	{
		let rt = new SpecialWeapon();

		for (let i in obj)
			if (i == "role")
				rt.role = SpecialWeaponRole.parse(obj[i]);
			else
				rt[i] = obj[i];

		rt.index = index;

		return rt;
	}

	getResult(role: AircraftRole, baseCost: number, level: number, parts: Parts[]): IDamageSet
	{
		return new DamageSet(
			(this.fixedBaseCost ? this.fixedBaseCost : baseCost) + (level + parts.filter(_ => _.isSupported(role, this)).reduce((x, y) => x + y.power, 0)) * 50,
			this.airRate[role],
			this.isAirRateUncertain[role],
			this.groundRate[role],
			this.isGroundRateUncertain[role]
		);
	}
}

enum SpecialWeaponRole
{
	ToAir,
	ToGround,
	Other,
}

module SpecialWeaponRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "A":
				return SpecialWeaponRole.ToAir;
			case "G":
				return SpecialWeaponRole.ToGround;
			case "O":
				return SpecialWeaponRole.Other;
			default:
				throw new Error(`Invalid SpecialWeaponRole: ${str}`);	
		}
	}
}

class Parts
{
	index: number;
	id: number;
	name: string;
	englishName: string;
	slot: PartsSlot;
	slotUsage: number;
	power: number;
	hits: number;
	category: string;
	supportedRoles: AircraftRole[];
	supportedWeapons: string[];
	sizeGroup: string;
	cost: number;

	static fromJsonObject(index: number, obj: any)
	{
		let rt = new Parts();

		for (let i in obj)
			if (i == "slot")
				rt.slot = PartsSlot.parse(obj[i]);
			else if (i == "supportedRoles")
				rt.supportedRoles = obj[i] ? (<string[]>obj[i]).map(AircraftRole.parse) : null;	
			else
				rt[i] = obj[i];

		rt.index = index;

		return rt;
	}

	get isWeaponParts()
	{
		return this.category == "MSL" || this.category.indexOf("SP.") == 0;
	}

	getPrice(aircraft: Aircraft)
	{
		return this.cost == 0 ? 0 : Math.ceil(this.cost / 15) * aircraft.equipCost;
	}

	isSupported(role: AircraftRole, specialWeapon: SpecialWeapon)
	{
		return (!this.supportedRoles || ~this.supportedRoles.indexOf(role))
			&& <boolean>(!this.isWeaponParts || (this.supportedWeapons
				? ~this.supportedWeapons.indexOf(specialWeapon.name)
				: this.category == specialWeapon.category));
	}
}

enum PartsSlot
{
	Body,
	Arms,
	Misc,
}

module PartsSlot
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "BODY":
				return PartsSlot.Body;
			case "ARMS":
				return PartsSlot.Arms;
			case "MISC":
				return PartsSlot.Misc;
			default:
				throw new Error(`Invalid PartsSlot: ${str}`);	
		}
	}
}

class Enemy
{
	name: string;
	role: EnemyRole;
	color: EnemyColor;
	score: number;
	hitPoint: number;
	isSoftTarget: boolean;
	hardMultiplier: number;
	isDefaultHidden: boolean;
	weakAgainst: string[];
	strongAgainst: string[];
	stages: Stage[];

	static fromJsonObject(stageList: IIdDictionaryArray<Stage>, _index: number, obj: any)
	{
		let rt = new Enemy();

		for (let i in obj)
			if (i == "role")
				rt.role = EnemyRole.parse(obj[i]);
			else if (i == "color")
				rt.color = EnemyColor.parse(obj[i]);
			else if (i == "stages")
				rt.stages = (<string[]>obj[i]).map(_ => stageList.byKey(_));
			else
				rt[i] = obj[i];

		let nameidx = rt.name.indexOf("(");

		if (nameidx >= 0)
			rt.name = `${rt.name.substr(0, nameidx - 1)}<span class="enemy-name">${rt.name.substr(nameidx - 1)}</span>`;

		rt.isDefaultHidden = rt.stages.every(_ => _.isSpecialRaid || _.isHard);

		return rt;
	}

	isInStage(stage: Stage)
	{
		return !stage && !this.isDefaultHidden
			|| stage && (~this.stages.indexOf(stage) || stage.originalStage && this.stages.some(_ => _.key == stage.originalStage));
	}

	getHitPoint(stage: Stage, aircraftRole: AircraftRole, resources: Resources, convertSoftTarget = false)
	{
		let rt = this.hitPoint;

		if (stage && stage.isHard)
			rt *= this.hardMultiplier || 1.2;	
		
		if (convertSoftTarget && this.isSoftTarget)
		{
			let msl = resources.specialWeaponList.byKey("MSL");
			let rates = [msl.airRate, msl.groundRate][this.role];

			rt = Calculator.getRoundedFloat(rt * (rates[aircraftRole] / rates[0]));			
		}	

		return rt;
	}
}

enum EnemyRole
{
	Air,
	Ground,
}

module EnemyRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "A":
				return EnemyRole.Air;
			case "G":
				return EnemyRole.Ground;
			default:
				throw new Error(`Invalid EnemyRole: ${str}`);	
		}
	}
}

enum EnemyColor
{
	Yellow,
	Orange,
	Red,
	Target,
	Y = Yellow,
	O = Orange,
	R = Red,
	TGT = Target,
}

module EnemyColor
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "Y":
				return EnemyColor.Yellow;
			case "O":
				return EnemyColor.Orange;
			case "R":
				return EnemyColor.Red;
			case "TGT":
				return EnemyColor.Target;
			default:
				throw new Error(`Invalid EnemyColor: ${str}`);	
		}
	}
}

class Datalink
{
	index: number;
	id: number;
	name: string;
	englishName: string;
	cost: number;

	static fromJsonObject(index: number, obj: any)
	{
		let rt = new Datalink();

		for (let i in obj)
			rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
}

class Stage
{
	index: number;
	id: number;
	key: string;
	name: string;
	isHard: boolean;
	originalStage: string;
	isSpecialRaid: boolean;

	static fromJsonObject(index: number, obj: any)
	{
		let rt = new Stage();

		for (let i in obj)
			rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
}

interface IDamageSet
{
	airRate: number;
	isAirRateUncertain: boolean;
	airDamage: number;
	groundRate: number;
	isGroundRateUncertain: boolean;
	groundDamage: number;
	multiply(rate: number): IDamageSet;
	divide(rate: number): IDamageSet;
}

class DamageSet implements IDamageSet
{
	airDamage: number;
	groundDamage: number;

	constructor(public totalCost: number, public airRate: number, public isAirRateUncertain: boolean, public groundRate: number, public isGroundRateUncertain: boolean)
	{
		this.airDamage = Math.ceil(totalCost * airRate);
		this.groundDamage = Math.ceil(totalCost * groundRate);
	}

	multiply(rate: number)
	{
		return new DamageSet(this.totalCost, Calculator.getRoundedFloat(this.airRate * rate), this.isAirRateUncertain, Calculator.getRoundedFloat(this.groundRate * rate), this.isGroundRateUncertain);
	}

	divide(rate: number)
	{
		return new DamageSet(this.totalCost, Calculator.getRoundedFloat(this.airRate / rate), this.isAirRateUncertain, Calculator.getRoundedFloat(this.groundRate / rate), this.isGroundRateUncertain);
	}
}