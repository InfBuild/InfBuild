enum AircraftRole
{
	Fighter,
	Multirole,
	Attacker,
	Bomber,
	PistonFighter,
}

module AircraftRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "F":
				return AircraftRole.Fighter;
			case "M":
				return AircraftRole.Multirole;
			case "A":
				return AircraftRole.Attacker;
			case "B":
				return AircraftRole.Bomber;
			case "PF":
				return AircraftRole.PistonFighter;
			default:
				throw new Error(`Invalid AircraftRole: ${str}`);
		}
	}
}

export default AircraftRole;
