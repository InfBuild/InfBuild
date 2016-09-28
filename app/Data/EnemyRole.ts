enum EnemyRole
{
	Air,
	Ground,
}

module EnemyRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "A":
				return EnemyRole.Air;
			case "G":
				return EnemyRole.Ground;
			default:
				throw new Error(`Invalid EnemyRole: ${str}`);
		}
	}
}

export default EnemyRole;
