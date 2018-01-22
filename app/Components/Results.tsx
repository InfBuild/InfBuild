import * as React from "react";
import Enemy from "../Data/Enemy";
import EnemyRole from "../Data/EnemyRole";
import IBuild from "../Data/IBuild";
import IDamageResult from "../Data/IDamageResult";
import Resources from "../Data/Resources";
import SpecialWeaponRole from "../Data/SpecialWeaponRole";
import Stage from "../Data/Stage";

interface IResultsProps
{
	resources: Resources;
	builds: IBuild[];
	selectedBuildIndex: number;
	onSelectedBuildChanged: (selectedBuildIndex: number) => void;
	onAddBuild: () => void;
	onRemoveBuild: () => void;
}
export default class Results extends React.Component<IResultsProps, { selectedStage: Stage }>
{
	constructor(props: IResultsProps)
	{
		super(props);
		this.state = {
			selectedStage: null
		};
	}

	private onSelectedStageChanged(e: React.FormEvent<HTMLSelectElement>)
	{
		const id = parseInt(e.currentTarget.value);
		const selectedStage = id ? this.props.resources.stageList.byId(id) : null;

		this.setState({ selectedStage });
	}

	render()
	{
		const enemies = this.props.resources.enemyList.filter(_ => _.isInStage(this.state.selectedStage))
			.sort((x, y) => x.getHitPoint(this.state.selectedStage) - y.getHitPoint(this.state.selectedStage));
		const airEnemies = enemies.filter(_ => _.role == EnemyRole.Air);
		const groundEnemies = enemies.filter(_ => _.role == EnemyRole.Ground);

		return (
			<div>
				<div id="results-options">
					<select value={this.state.selectedStage ? this.state.selectedStage.id : 0} onChange={this.onSelectedStageChanged.bind(this)}>
						<option value="0">Filter...</option>
						{this.props.resources.stageList.map(_ =>
							<option key={_.id} value={_.id}>{_.name}</option>
						)}
					</select>
					<button onClick={e =>
					{
						e.preventDefault();
						this.props.onAddBuild();
					} }>Add Aircraft</button>
					<button onClick={e =>
					{
						e.preventDefault();
						this.props.onRemoveBuild();
					} } disabled={this.props.builds.length <= 1}>Remove Aircraft</button>
				</div>
				<EnemyList
					stage={this.state.selectedStage}
					builds={this.props.builds}
					airEnemies={airEnemies}
					groundEnemies={groundEnemies} />
				<GaugeList
					resources={this.props.resources}
					stage={this.state.selectedStage}
					builds={this.props.builds}
					selectedBuildIndex={this.props.selectedBuildIndex}
					airEnemies={airEnemies}
					groundEnemies={groundEnemies}
					onSelectedBuildChanged={this.props.onSelectedBuildChanged} />
			</div>
		);
	}
}

function EnemyList(props: {
	stage: Stage;
	builds: IBuild[];
	airEnemies: Enemy[];
	groundEnemies: Enemy[];
})
{
	return (
		<div id="enemies">
			<EnemyNames stage={props.stage} builds={props.builds} enemies={props.airEnemies} />
			<EnemyNames stage={props.stage} builds={props.builds} enemies={props.groundEnemies} />
		</div>
	);
}

function EnemyNames(props: {
	stage: Stage;
	builds: IBuild[];
	enemies: Enemy[];
})
{
	const getHitPointClass = (enemy: Enemy) =>
	{
		const hp = enemy.getHitPoint(props.stage);

		return hp > 2500 ? null : hp > 2000 ? "dmg-d2400" : hp > 1600 ? "dmg-d2000" : hp > 1400 ? "dmg-d1600" : null;
	};

	return (
		<dl>
			{props.enemies.reduce((arr, enemy, i) => arr.concat(
				<dt key={"dt-" + i} className={getHitPointClass(enemy)}>
					{enemy.getHitPoint(props.stage)}
				</dt>,
				<dd key={"dd-" + i} className={"enemy-" + ["y", "o", "r", "tgt"][enemy.color]}>
					<span className="enemy-id">
						{enemy.name}
						{enemy.detail &&
							<span className="enemy-name">&nbsp;({enemy.detail})</span>
						}
					</span>
					<span className="note">
						<span className="enemy-score">&nbsp;{enemy.score}</span>
						{enemy.weakAgainst && props.builds.map(_ => _.specialWeapon.name).filter(_ => ~enemy.weakAgainst.indexOf(_)).map(_ =>
							<span key={_ + "+"} className="enemy-strong">&nbsp;{_}+</span>
						)}
						{enemy.strongAgainst && props.builds.map(_ => _.specialWeapon.name).filter(_ => ~enemy.strongAgainst.indexOf(_)).map(_ =>
							<span key={_ + "-"} className="enemy-weak">&nbsp;{_}-</span>
						)}
					</span>
				</dd>
			), [])}
		</dl>
	);
}

function GaugeList(props: {
	resources: Resources;
	stage: Stage;
	builds: IBuild[];
	selectedBuildIndex: number;
	airEnemies: Enemy[];
	groundEnemies: Enemy[];
	onSelectedBuildChanged: (selectedBuildIndex: number) => void;
})
{
	return (
		<div id="gauges">
			<Gauges
				resources={props.resources}
				stage={props.stage}
				builds={props.builds}
				selectedBuildIndex={props.selectedBuildIndex}
				enemyRole={EnemyRole.Air}
				enemies={props.airEnemies}
				onSelectedBuildChanged={props.onSelectedBuildChanged} />
			<Gauges
				resources={props.resources}
				stage={props.stage}
				builds={props.builds}
				selectedBuildIndex={props.selectedBuildIndex}
				enemyRole={EnemyRole.Ground}
				enemies={props.groundEnemies}
				onSelectedBuildChanged={props.onSelectedBuildChanged} />
		</div>
	);
}

function Gauges(props: {
	resources: Resources;
	stage: Stage;
	builds: IBuild[];
	selectedBuildIndex: number;
	enemyRole: EnemyRole;
	enemies: Enemy[];
	onSelectedBuildChanged: (selectedBuildIndex: number) => void;
})
{
	return (
		<ul className="results-gauges">
			{props.builds.map((build, i) =>
				<Build
					key={i}
					resources={props.resources}
					stage={props.stage}
					build={build}
					buildIndex={i}
					selectedBuildIndex={props.selectedBuildIndex}
					enemyRole={props.enemyRole}
					enemies={props.enemies}
					onSelectedBuildChanged={props.onSelectedBuildChanged} />
			)}
		</ul>
	);
}

function Build(props: {
	resources: Resources;
	stage: Stage;
	build: IBuild;
	buildIndex: number;
	selectedBuildIndex: number;
	enemyRole: EnemyRole;
	enemies: Enemy[];
	onSelectedBuildChanged: (selectedBuildIndex: number) => void;
})
{
	const msl = props.build.aircraft.mainWeapon;
	const spw = props.build.specialWeapon;
	const gauges = [0, 1].concat(spw.strongMultiplier ? [2] : []).concat(spw.weakDivider ? [3] : [])
		.map(type => (Array.apply(null, { length: [msl, spw, spw, spw][type].numberOfGauges }).map(eval.call, Number) as number[])
			.reverse()
			.map(gaugeIndex =>
				<Gauge
					key={type + "-" + gaugeIndex}
					stage={props.stage}
					build={props.build}
					damageResult={IBuild.getDamageResult(props.resources, props.build)}
					enemyRole={props.enemyRole}
					enemies={props.enemies}
					type={type}
					multiplier={gaugeIndex + 1} />
			));

	return (
		<li className={[
			props.selectedBuildIndex == props.buildIndex ? "selected" : null,
			spw.strongMultiplier ? "results-has-strong" : null,
			spw.weakDivider ? "results-has-weak" : null
		].filter(_ => _).join(" ")}>
			<label htmlFor={"gauges-aircraft-" + props.buildIndex}>
				{props.enemyRole == EnemyRole.Air &&
					<input
						id={"gauges-aircraft-" + props.buildIndex}
						name="gauges-aircraft"
						type="radio"
						checked={props.selectedBuildIndex == props.buildIndex}
						onChange={e =>
						{
							if (e.currentTarget.checked)
								props.onSelectedBuildChanged(props.buildIndex);
						} } />
				}
				{props.build.aircraft.name}<br />
				Lv.{props.build.level}&nbsp;
				<span className="note">
					{props.build.specialWeapon.name}&nbsp;
					Lv.{props.build.specialWeaponLevel}
				</span>
			</label>
			{gauges}
		</li>
	);
}

function Gauge(props: {
	stage: Stage;
	build: IBuild;
	damageResult: IDamageResult;
	enemyRole: EnemyRole;
	enemies: Enemy[];
	type: number;
	multiplier: number;
})
{
	const weapon = props.type == 0 ? props.build.aircraft.mainWeapon : props.build.specialWeapon;
	const damageSet = [
		props.damageResult.main,
		props.damageResult.special,
		props.damageResult.specialStrong,
		props.damageResult.specialWeak
	][props.type];
	const damage = [damageSet.airDamage, damageSet.groundDamage][props.enemyRole] * props.multiplier;
	const rate = [damageSet.airRate, damageSet.groundRate][props.enemyRole];
	const isUncertain = [damageSet.isAirRateUncertain, damageSet.isGroundRateUncertain][props.enemyRole];
	const classes = [
		"results-gauge",
		["results-gauge-msl", "results-gauge-spw", "results-gauge-strong", "results-gauge-weak"][props.type],
		props.multiplier > 1 ? "results-gauge-multi" : null,
		(weapon.role != SpecialWeaponRole.Other && weapon.role != props.enemyRole as number) ? "results-gauge-none" : null
	].filter(_ => _).join(" ");
	const damageClass = damage >= 2400 ? "dmg-d2400" : damage >= 2000 ? "dmg-d2000" : damage >= 1600 ? "dmg-d1600" : null;
	const style = { height: props.enemies.filter(_ => damage + 20 > _.getHitPoint(props.stage)).length * 20 + "px" };
	const content = props.multiplier > 1
		? <span>x{props.multiplier}</span>
		: <span>
			{weapon.name}{props.type >= 2 ? "+-"[props.type - 2] : ""}&nbsp;
			<b className={damageClass}>{damage}</b>&nbsp;
			{props.type < 2
				? <b className={"note" + (isUncertain ? " uncertain" : "")}>{rate}</b>
				: <b className="note">{["×" + weapon.strongMultiplier, "÷" + weapon.weakDivider][props.type - 2]}</b>
			}
		</span>;

	return <span className={classes} style={style}>{content}</span>;
}
