import Aircraft from "./Aircraft";
import Datalink from "./Datalink";
import Enemy from "./Enemy";
import IIdDictionaryArray from "./IIdDictionaryArray";
import Parts from "./Parts";
import SpecialWeapon from "./SpecialWeapon";
import Stage from "./Stage";

export default class Resources
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
