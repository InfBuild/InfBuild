import Aircraft from "./Aircraft";
import Datalink from "./Datalink";
import IDamageResult from "./IDamageResult";
import Resources from "./Resources";
import Parts from "./Parts";
import SpecialWeapon from "./SpecialWeapon";

interface IBuild
{
	aircraft: Aircraft;
	level: number;
	specialWeapon: SpecialWeapon;
	specialWeaponLevel: number;
	datalink: Datalink;
	isDatalinkActive: boolean;
	extendedSlots: number;
	parts: Parts[];
}

namespace IBuild
{
	const codeVersion = 1;

	export function create(resources: Resources): IBuild
	{
		return {
			aircraft: resources.aircraftList.byKey("F-4E"),
			level: 1,
			specialWeapon: resources.specialWeaponList.byKey("HPAA"),
			specialWeaponLevel: 1,
			datalink: resources.datalinkList.byId(1),
			isDatalinkActive: false,
			extendedSlots: 0,
			parts: []
		};
	}

	export function fromCode(resources: Resources, code: string)
	{
		const version = parseInt(code.substr(0, 2), 36);

		if (version != codeVersion)
			throw new Error("Invalid code version: " + version);
		else if (code.length % 2 != 0)
			throw new Error("Invalid code length");

		const body = (Array.apply(null, { length: (code.length - 2) / 2 }).map(eval.call, Number) as number[]).map(_ => parseInt(code.substr(2 + _ * 2, 2), 36));
		const rt = IBuild.create(resources);

		if (body.length)
		{
			const id = body.shift() - 1;

			rt.aircraft = resources.aircraftList.byId(id);

			if (!rt.aircraft)
				throw new Error("Invalid aircraft id: " + id);
		}

		if (body.length)
		{
			rt.level = body.shift();

			if (rt.level < 0 || rt.level > 20)
				throw new Error("Invalid aircraft level: " + rt.level);
		}

		if (body.length)
			rt.extendedSlots = body.shift();

		if (body.length)
		{
			const id = body.shift() - 1;

			rt.specialWeapon = resources.specialWeaponList.byId(id);

			if (!rt.specialWeapon)
				throw new Error("Invalid special weapon id: " + id);
		}

		if (body.length)
		{
			rt.specialWeaponLevel = body.shift();

			if (rt.specialWeaponLevel < 0 || rt.specialWeaponLevel > 5)
				throw new Error("Invalid special weapon level: " + rt.specialWeaponLevel);
		}

		for (let i = 0; i < 7; i++)
		{
			if (!body.length)
				continue;

			const id = body.shift();

			if (id == 0)
				continue;

			const p = resources.partsList.byId(id);

			if (!p)
				throw new Error("Invalid parts id: " + id);
			else if (!~rt.parts.indexOf(p))
				rt.parts.push(p);
		}

		if (body.length)
		{
			const id = body.shift();

			rt.datalink = resources.datalinkList.byId(id);

			if (!rt.datalink)
				throw new Error("Invalid datalink id: " + id);
		}

		return rt;
	}

	export function toCode(build: IBuild)
	{
		return [
			codeVersion,
			build.aircraft.id + 1,
			build.level,
			build.extendedSlots,
			build.specialWeapon.id + 1,
			build.specialWeaponLevel
		]
			.concat(build.parts.map(_ => _.id).concat(0, 0, 0, 0, 0, 0, 0).slice(0, 7))
			.concat(build.datalink.id)
			.map(_ => ("0" + _.toString(36)).slice(-2)).join("");
	}

	export function toDetailedString(build: IBuild, language: string)
	{
		return [
			`${build.aircraft.name} Lv.${build.level} ${build.specialWeapon.name} Lv.${build.specialWeaponLevel}`,
			"CODE: " + IBuild.toCode(build),
			["BODY", "ARMS", "MISC"].map((slot, i) =>
				slot + ": " + build.parts.filter(_ => _.slot == i).reduce((x, y) => x + y.slotUsage, 0) + "/" + (build.aircraft.getSlots(build.level)[i] + build.extendedSlots)).join(", ") + (build.extendedSlots > 0 ? ` (+${build.extendedSlots})` : "")
		]
			.concat(build.parts.map(_ => language == "ja" ? _.name : _.englishName))
			.concat(language == "ja" ? build.datalink.name : build.datalink.englishName)
			.join("\r\n");
	}

	export function getTotalCost(build: IBuild)
	{
		return build.aircraft.getCost(build.level) +
			build.specialWeapon.getCost(build.specialWeaponLevel) +
			build.parts.reduce((x, y) => x + y.cost, 0);
	}

	export function getTotalPrice(build: IBuild)
	{
		return build.parts.reduce((x, y) => x + y.getPrice(build.aircraft), 0);
	}

	export function getDamageResult(resources: Resources, build: IBuild)
	{
		const msl = build.aircraft.mainWeapon;
		const spw = build.specialWeapon;
		const critical = build.datalink.id == 2 && build.isDatalinkActive ? 1 : 0;
		const role = build.aircraft.role;
		const cost = build.aircraft.cost + build.aircraft.cost % 50 + build.aircraft.handicap * 50;
		const main = msl.getResult(role, cost, msl.getPower(build.level) + critical, build.parts);
		const special = spw.getResult(role, cost, spw.getPower(build.specialWeaponLevel) + critical, build.parts);
		const rt: IDamageResult = {
			main,
			special,
			specialStrong: spw.strongMultiplier ? special.multiply(spw.strongMultiplier) : null,
			specialWeak: spw.weakDivider ? special.divide(spw.weakDivider) : null,
		};

		if (spw.relatedDamage)
		{
			let spw2 = spw;

			do
			{
				const rel = resources.specialWeaponList.byKey(spw2.relatedDamage);
				const relDamage = rel.getResult(role, cost, rel.getPower(build.specialWeaponLevel) + critical, []);

				rt.special.airDamage += relDamage.airDamage * rel.numberOfGauges;
				rt.special.groundDamage += relDamage.groundDamage * rel.numberOfGauges;
				spw2 = rel;
			}
			while (spw2.relatedDamage);
		}

		return rt;
	}
}

export default IBuild;