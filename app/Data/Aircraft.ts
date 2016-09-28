import AircraftRole from "./AircraftRole";
import IIdDictionaryArray from "./IIdDictionaryArray";
import SpecialWeapon from "./SpecialWeapon";

export default class Aircraft
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
		const rt = new Aircraft();

		for (const i in obj)
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

	getCost(level: number)
	{
		return this.cost +
			Math.max(0, this.costTable[0] * Math.min(level - 1, 9)) +
			Math.max(0, this.costTable[1] * Math.min(level - 10, 5)) +
			Math.max(0, this.costTable[2] * Math.min(level - 15, 1)) +
			Math.max(0, this.costTable[3] * (level - 16));
	}

	getSlots(level: number)
	{
		const add =
			(level >= 6 ? 2 : 0) +
			(level >= 15 ? 1 : 0) +
			(level >= 20 ? 1 : 0);

		return this.slots.map(_ => _ + add);
	}
}
