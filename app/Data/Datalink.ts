export default class Datalink
{
	index: number;
	id: number;
	name: string;
	englishName: string;
	cost: number;

	static fromJsonObject(index: number, obj: any)
	{
		const rt = new Datalink();

		for (const i in obj)
			rt[i] = obj[i];

		rt.index = index;

		return rt;
	}
}
