import IDamageSet from "./IDamageSet";

export default class DamageSet implements IDamageSet
{
	airDamage: number;
	groundDamage: number;

	constructor(
		public totalCost: number,
		public airRate: number,
		public isAirRateUncertain: boolean,
		public groundRate: number,
		public isGroundRateUncertain: boolean
	)
	{
		this.airDamage = Math.ceil(totalCost * airRate);
		this.groundDamage = Math.ceil(totalCost * groundRate);
	}

	private static getRoundedFloat(n: number)
	{
		const precision = 5;

		return parseFloat(n.toPrecision(precision));
	}

	multiply(rate: number)
	{
		return new DamageSet(
			this.totalCost,
			DamageSet.getRoundedFloat(this.airRate * rate),
			this.isAirRateUncertain,
			DamageSet.getRoundedFloat(this.groundRate * rate),
			this.isGroundRateUncertain
		);
	}

	divide(rate: number)
	{
		return new DamageSet(
			this.totalCost,
			DamageSet.getRoundedFloat(this.airRate / rate),
			this.isAirRateUncertain,
			DamageSet.getRoundedFloat(this.groundRate / rate),
			this.isGroundRateUncertain
		);
	}
}
