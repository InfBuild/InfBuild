import IDamageSet from "./IDamageSet";

interface IDamageResult
{
	main: IDamageSet;
	special: IDamageSet;
	specialStrong: IDamageSet;
	specialWeak: IDamageSet;
}

export default IDamageResult;
