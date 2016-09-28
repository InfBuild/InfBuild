import AircraftRole from "./AircraftRole";
import EnemyColor from "./EnemyColor";
import EnemyRole from "./EnemyRole";
import IIdDictionaryArray from "./IIdDictionaryArray";
import Resources from "./Resources";
import Stage from "./Stage";

export default class Enemy
{
	name: string;
	detail: string = null;
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
		const rt = new Enemy();

		for (const i in obj)
			if (i == "role")
				rt.role = EnemyRole.parse(obj[i]);
			else if (i == "color")
				rt.color = EnemyColor.parse(obj[i]);
			else if (i == "stages")
				rt.stages = (<string[]>obj[i]).map(_ => stageList.byKey(_));
			else
				rt[i] = obj[i];

		const nameidx = rt.name.indexOf("(");

		if (nameidx >= 0)
		{
			rt.detail = rt.name.substr(nameidx).replace(/[\(\)]/g, "");
			rt.name = rt.name.substr(0, nameidx - 1);
		}

		rt.isDefaultHidden = rt.stages.every(_ => _.isSpecialRaid || _.isHard);

		return rt;
	}
	
	private static getRoundedFloat(n: number)
	{
		const precision = 5;

		return parseFloat(n.toPrecision(precision));
	}

	isInStage(stage: Stage)
	{
		return !stage && !this.isDefaultHidden
			|| stage && (~this.stages.indexOf(stage) || stage.originalStage && this.stages.some(_ => _.key == stage.originalStage));
	}

	getHitPoint(stage: Stage, aircraftRole: AircraftRole = null, resources: Resources = null, convertSoftTarget = false)
	{
		let rt = this.hitPoint;

		if (stage && stage.isHard)
			rt *= this.hardMultiplier || 1.2;

		if (aircraftRole !== null && resources && convertSoftTarget && this.isSoftTarget)
		{
			const msl = resources.specialWeaponList.byKey("MSL");
			const rates = [msl.airRate, msl.groundRate][this.role];

			rt = Enemy.getRoundedFloat(rt * (rates[aircraftRole] / rates[0]));
		}

		return rt;
	}
}
