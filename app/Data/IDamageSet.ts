interface IDamageSet
{
	airRate: number;
	isAirRateUncertain: boolean;
	airDamage: number;
	groundRate: number;
	isGroundRateUncertain: boolean;
	groundDamage: number;
	multiply(rate: number): IDamageSet;
	divide(rate: number): IDamageSet;
}

export default IDamageSet;
