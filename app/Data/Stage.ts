export default class Stage
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
		const rt = new Stage();

		for (const i in obj)
			rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
}