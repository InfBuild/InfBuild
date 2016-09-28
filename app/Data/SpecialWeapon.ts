import AircraftRole from "./AircraftRole";
import DamageSet from "./DamageSet";
import IDamageSet from "./IDamageSet";
import Parts from "./Parts";
import SpecialWeaponRole from "./SpecialWeaponRole";

export default class SpecialWeapon
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
		const rt = new SpecialWeapon();

		for (const i in obj)
			if (i == "role")
				rt.role = SpecialWeaponRole.parse(obj[i]);
			else
				rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
	
	getCost(level: number)
	{
		return this.costs[level - 1];
	}

	getPower(level: number)
	{
		if (this.name == "MSL")
			return Math.min(level, 11) +
				Math.max(0, Math.min(level, 15) - 11) * 0.5 +
				Math.max(0, level - 15) * 0.25;
		else
			return this.levelRate1 + this.levelRateAdditionPerLevel * (level - 1);
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
