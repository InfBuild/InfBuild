import Aircraft from "./Aircraft";
import AircraftRole from "./AircraftRole";
import PartsSlot from "./PartsSlot";
import SpecialWeapon from "./SpecialWeapon";

export default class Parts
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
		const rt = new Parts();

		for (const i in obj)
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
