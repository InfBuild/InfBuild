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

export default PartsSlot;
