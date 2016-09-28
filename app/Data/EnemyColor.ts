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

export default EnemyColor;
