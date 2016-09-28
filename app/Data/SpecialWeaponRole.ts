enum SpecialWeaponRole
{
	ToAir,
	ToGround,
	Other,
}

module SpecialWeaponRole
{
	export function parse(str: string)
	{
		switch (str)
		{
			case "A":
				return SpecialWeaponRole.ToAir;
			case "G":
				return SpecialWeaponRole.ToGround;
			case "O":
				return SpecialWeaponRole.Other;
			default:
				throw new Error(`Invalid SpecialWeaponRole: ${str}`);
		}
	}
}

export default SpecialWeaponRole;
