import * as React from "react";
import Field from "./Field";
import FieldSet from "./FieldSet";
import Aircraft from "../Data/Aircraft";
import AircraftRole from "../Data/AircraftRole";
import Datalink from "../Data/Datalink";
import IBuild from "../Data/IBuild";
import Parts from "../Data/Parts";
import PartsSlot from "../Data/PartsSlot";
import Resources from "../Data/Resources";
import SpecialWeapon from "../Data/SpecialWeapon";

interface IBuildParametersProps
{
	language: string;
	resources: Resources;
	build: IBuild;
	onChanged: (build: IBuild) => void;
}
export default class BuildParameters extends React.Component<IBuildParametersProps, IBuild>
{
	constructor(props: IBuildParametersProps)
	{
		super(props);
		this.state = props.build;
	}

	componentWillReceiveProps(nextProps: IBuildParametersProps, _: any)
	{
		this.setState(nextProps.build);
	}

	private onChanged(properties: any)
	{
		this.setState(properties as IBuild, () => this.props.onChanged(this.state));
	}

	render()
	{
		return (
			<form>
				<AircraftParameters
					resources={this.props.resources}
					aircraft={this.state.aircraft}
					level={this.state.level}
					extendedSlots={this.state.extendedSlots}
					onAircraftChanged={_ =>
					{
						this.onChanged({ aircraft: _ });

						if (!~_.specialWeapons.indexOf(this.state.specialWeapon))
							this.onChanged({ specialWeapon: _.specialWeapons[0] });
					} }
					onLevelChanged={_ => this.onChanged({ level: _ })}
					onExtendedSlotsChanged={_ => this.onChanged({ extendedSlots: _ })} />
				<SpecialWeaponParameters
					specialWeapons={this.state.aircraft.specialWeapons}
					specialWeapon={this.state.specialWeapon}
					level={this.state.specialWeaponLevel}
					onSpecialWeaponChanged={_ => this.onChanged({ specialWeapon: _ })}
					onLevelChanged={_ => this.onChanged({ specialWeaponLevel: _ })} />
				<DatalinkParameters
					language={this.props.language}
					resources={this.props.resources}
					datalink={this.state.datalink}
					isDatalinkActive={this.state.isDatalinkActive}
					onDatalinkChanged={_ => this.onChanged({ datalink: _ })}
					onDatalinkActiveChanged={_ => this.onChanged({ isDatalinkActive: _ })}
					/>
				<EquipmentParameters
					language={this.props.language}
					resources={this.props.resources}
					build={this.state}
					parts={this.state.parts}
					onPartsChanged={_ => this.onChanged({ parts: _ })}
					/>
			</form>
		);
	}
}

function AircraftParameters(props: {
	resources: Resources;
	aircraft: Aircraft;
	level: number;
	extendedSlots: number;
	onAircraftChanged: (aircraft: Aircraft) => void;
	onLevelChanged: (level: number) => void;
	onExtendedSlotsChanged: (extendedSlots: number) => void;
})
{
	const aircraft = props.aircraft;
	const level = props.level;
	const onLevelChanged = (e: React.FormEvent<HTMLSelectElement>) =>
		props.onLevelChanged(parseInt(e.currentTarget.value));

	return (
		<FieldSet id="aircraft" caption="Aircraft" note={`Cst: ${aircraft.getCost(level)}`}>
			<Field caption="Aircraft" forId="aircraft-name"
				note={`Cst: ${aircraft.cost} (${(aircraft.handicap >= 0 ? "+" : "") + aircraft.handicap})`}
				isUncertain={aircraft.isHandicapUncertain}>
				<AircraftName
					resources={props.resources}
					aircraft={aircraft}
					onAircraftChanged={props.onAircraftChanged} />
			</Field>
			<Field caption="Lv." forId="aircraft-lv"
				note={`Internal Power: ${aircraft.mainWeapon.getPower(level)}`}>
				<select
					id="aircraft-lv"
					value={level}
					onChange={onLevelChanged}>
					{(Array.apply(null, { length: 20 }).map(eval.call, Number) as number[]).map(_ => _ + 1).map(_ =>
						<option value={_} key={_}>{_}</option>
					)}
				</select>
			</Field>
			<Field caption="Slot Extensions" forId="aircraft-exslot">
				<AircraftExtendedSlots
					extendedSlots={props.extendedSlots}
					onExtendedSlotsChanged={props.onExtendedSlotsChanged} />
			</Field>
		</FieldSet>
	);
}

interface IAircraftNameProps
{
	resources: Resources;
	aircraft: Aircraft;
	onAircraftChanged: (aircraft: Aircraft) => void;
}
class AircraftName extends React.Component<IAircraftNameProps, { aircraftName: string }>
{
	constructor(props: IAircraftNameProps)
	{
		super(props);
		this.state = { aircraftName: props.aircraft.name };
	}

	componentWillReceiveProps(nextProps: IAircraftNameProps, _: any)
	{
		this.setState({ aircraftName: nextProps.aircraft.name });
	}

	private onRoleChanged(e: React.FormEvent<HTMLInputElement>)
	{
		const role = parseInt(e.currentTarget.value);
		const aircraft = this.props.resources.aircraftList.filter(_ => _.role == role)[0];

		this.setState({ aircraftName: aircraft.name });
		this.props.onAircraftChanged(aircraft);
	}

	private onNameChanged(e: React.FormEvent<HTMLInputElement>)
	{
		const aircraft = this.props.resources.aircraftList.byKey(e.currentTarget.value);

		this.setState({ aircraftName: e.currentTarget.value });

		if (aircraft)
			this.props.onAircraftChanged(aircraft);
	}

	private onAircraftChanged(e: React.FormEvent<HTMLSelectElement>)
	{
		const aircraft = this.props.resources.aircraftList.byId(parseInt(e.currentTarget.value));

		this.setState({ aircraftName: aircraft.name });
		this.props.onAircraftChanged(aircraft);
	}

	render()
	{
		return (
			<span id="aircraft-select">
				<select
					className={"role-" + ["f", "m", "a", "b", "pf"][this.props.aircraft.role]}
					value={this.props.aircraft.role}
					onChange={this.onRoleChanged.bind(this)}>
					<option className="role-f" value={AircraftRole.Fighter}>F</option>
					<option className="role-m" value={AircraftRole.Multirole}>M</option>
					<option className="role-a" value={AircraftRole.Attacker}>A</option>
					<option className="role-b" value={AircraftRole.Bomber}>B</option>
					<option className="role-pf" value={AircraftRole.PistonFighter}>PF</option>
				</select>
				<select id="aircraft-list" value={this.props.aircraft.id} onChange={this.onAircraftChanged.bind(this)}>
					{this.props.resources.aircraftList.filter(_ => _.role == this.props.aircraft.role).map(_ =>
						<option value={_.id} key={_.id}>{_.name}</option>
					)}
				</select>
				<input
					id="aircraft-name"
					type="text"
					value={this.state.aircraftName}
					onChange={this.onNameChanged.bind(this)}
					onBlur={_ => _.currentTarget.value = this.props.aircraft.name}
					autoComplete="off"
					list="aircraft-name-list" />
				<datalist id="aircraft-name-list">
					{this.props.resources.aircraftList.map(_ => <option key={_.id}>{_.name}</option>)}
				</datalist>
			</span>
		);
	}
}

interface IAircraftExtendedSlotsProps
{
	extendedSlots: number;
	onExtendedSlotsChanged: (extendedSlots: number) => void;
}
class AircraftExtendedSlots extends React.Component<IAircraftExtendedSlotsProps, { extendedSlots: number }>
{
	constructor(props: IAircraftExtendedSlotsProps)
	{
		super(props);
		this.state = { extendedSlots: props.extendedSlots };
	}

	componentWillReceiveProps(nextProps: IAircraftExtendedSlotsProps, _: any)
	{
		this.setState({ extendedSlots: nextProps.extendedSlots });
	}

	private onExtendedSlotsChanged(e: React.FormEvent<HTMLInputElement>)
	{
		const extendedSlots = /^[0-9]+$/.test(e.currentTarget.value) ? parseInt(e.currentTarget.value) : 0;

		this.setState({ extendedSlots })
		this.props.onExtendedSlotsChanged(extendedSlots);
	}

	render()
	{
		return (
			<input
				id="aircraft-exslot"
				type="number"
				min="0"
				max="44"
				value={this.state.extendedSlots}
				onChange={this.onExtendedSlotsChanged.bind(this)} />
		);
	}
}

function SpecialWeaponParameters(props: {
	specialWeapons: SpecialWeapon[];
	specialWeapon: SpecialWeapon;
	level: number;
	onSpecialWeaponChanged: (specialWeapon: SpecialWeapon) => void;
	onLevelChanged: (level: number) => void;
})
{
	const specialWeapons = props.specialWeapons;
	const specialWeapon = props.specialWeapon;
	const level = props.level;

	const onSpecialWeaponChanged = (e: React.FormEvent<HTMLSelectElement>) =>
		props.onSpecialWeaponChanged(specialWeapons[parseInt(e.currentTarget.value)]);
	const onLevelChanged = (e: React.FormEvent<HTMLSelectElement>) =>
		props.onLevelChanged(parseInt(e.currentTarget.value));

	return (
		<FieldSet id="spw" caption="Special Weapon" note={`Cst: ${specialWeapon.getCost(level)}`}>
			<Field caption="SP.W" forId="spw-name">
				<select
					id="spw-name"
					className={"spw-" + "ago"[specialWeapon.role]}
					value={specialWeapons.indexOf(specialWeapon)}
					onChange={onSpecialWeaponChanged.bind(this)}>
					{specialWeapons.map((v, i) => <option className={"spw-" + "ago"[v.role]} value={i} key={i}>{v.name}</option>)}
				</select>
			</Field>
			<Field caption="Lv." forId="spw-lv"
				note={`Internal Power: ${specialWeapon.getPower(level)}`} isUncertain={specialWeapon.isLevelRateUncertain}>
				<select id="spw-lv" value={level} onChange={onLevelChanged}>
					{(Array.apply(null, { length: 5 }).map(eval.call, Number) as number[]).map(_ => _ + 1).map(_ =>
						<option value={_} key={_}>{_}</option>
					)}
				</select>
			</Field>
		</FieldSet>
	);
}

function DatalinkParameters(props: {
	language: string;
	resources: Resources;
	datalink: Datalink;
	isDatalinkActive: boolean;
	onDatalinkChanged: (datalink: Datalink) => void;
	onDatalinkActiveChanged: (isDatalinkActive: boolean) => void;
})
{
	const onDatalinkChanged = (e: React.FormEvent<HTMLSelectElement>) =>
		props.onDatalinkChanged(props.resources.datalinkList.byId(parseInt(e.currentTarget.value)));
	const onDatalinkActiveChanged = (e: React.FormEvent<HTMLInputElement>) =>
		props.onDatalinkActiveChanged(e.currentTarget.checked);

	return (
		<FieldSet id="datalink" caption="Datalink">
			<Field caption="Datalink" forId="datalink-name">
				<select
					id="datalink-name"
					value={props.datalink.id}
					onChange={onDatalinkChanged.bind(this)}>
					{props.resources.datalinkList.map(_ => <option value={_.id} key={_.id}>{props.language == "ja" ? _.name : _.englishName}</option>)}
				</select>
			</Field>
			{props.datalink.id == 2 &&
				<Field caption="Critical" forId="datalink-active"
					note={`Internal Power: ${props.isDatalinkActive ? 1 : 0}`}>
					<label htmlFor="datalink-active">
						<input
							id="datalink-active"
							type="checkbox"
							checked={props.isDatalinkActive}
							onChange={onDatalinkActiveChanged} /> Datalink Active
					</label>
				</Field>
			}
		</FieldSet>
	);
}

interface IEquipmentParametersProps
{
	language: string;
	resources: Resources;
	build: IBuild;
	parts: Parts[];
	onPartsChanged: (parts: Parts[]) => void;
}
class EquipmentParameters extends React.Component<IEquipmentParametersProps, {
	selectedCategory: string;
}>
{

	constructor(props: IEquipmentParametersProps)
	{
		super(props);
		this.state = {
			selectedCategory: "Current"
		};
	}

	render()
	{
		const slotUsage = [PartsSlot.Body, PartsSlot.Arms, PartsSlot.Misc].map(slot => this.props.parts.reduce((x, y) => x + (y.slot == slot ? y.slotUsage : 0), 0));
		const maxSlots = this.props.build.aircraft.getSlots(this.props.build.level).map(_ => _ + this.props.build.extendedSlots);
		const partsByCategory = this.state.selectedCategory == "Current" ? this.props.parts : this.props.resources.partsList.filter(_ => _.category.toLowerCase() == this.state.selectedCategory.toLowerCase());
		const getClassNameForCategory = (category: string) => category.replace(/\./g, "").toLowerCase();

		return (
			<fieldset id="parts">
				<EquipmentHeader
					selectedCategory={this.state.selectedCategory}	
					slotUsage={slotUsage}
					maxSlots={maxSlots}
					totalCost={IBuild.getTotalCost(this.props.build)}
					totalPrice={IBuild.getTotalPrice(this.props.build)}
					getClassNameForCategory={getClassNameForCategory}
					onSelectedCategoryChanged={_ => this.setState({ selectedCategory: _ })} />
				<div id="parts-categorized" className={partsByCategory.length ? "" : "empty"}>
					<ul className={"parts-categorized-" + getClassNameForCategory(this.state.selectedCategory)}>
						{partsByCategory.map(_ =>
							<Equipment
								key={_.id}
								language={this.props.language}
								aircraft={this.props.build.aircraft}
								specialWeapon={this.props.build.specialWeapon}
								item={_}
								equippedParts={this.props.parts}
								onPartsChanged={this.props.onPartsChanged} />
						)}
					</ul>
				</div>
			</fieldset>
		);
	}
}

interface IEquipmentHeaderProps
{
	selectedCategory: string;
	slotUsage: number[]
	maxSlots: number[];
	totalCost: number;
	totalPrice: number;
	getClassNameForCategory: (category: string) => string;
	onSelectedCategoryChanged: (category: string) => void;
}
class EquipmentHeader extends React.Component<IEquipmentHeaderProps, {
	partsHeaderClass: string;
	partsHeaderTop: string;
}>
{
	private onScroll = () =>
	{
		const partsHeader = document.getElementById("parts-header");
		const parts = partsHeader.parentElement;
		const isSplitScreen = window.innerWidth > 960;
		const scrollTop = isSplitScreen
			? document.getElementById("parameters").scrollTop
			: window.scrollY;
		const partsTop = parts.offsetTop;
		const partsHeight = parts.offsetHeight;
		const headerHeight = partsHeader.offsetHeight;

		if (scrollTop > partsTop && scrollTop < headerHeight + partsTop + partsHeight)
			this.setState({
				partsHeaderClass: "fixed",
				partsHeaderTop: Math.min(0, partsTop + partsHeight - scrollTop - headerHeight - 8) + "px",
			});
		else
			this.setState({
				partsHeaderClass: "",
				partsHeaderTop: "",
			});
	};

	constructor(props: IEquipmentHeaderProps)
	{
		super(props);
		this.state = {
			partsHeaderClass: "",
			partsHeaderTop: ""
		};
	}

	componentDidMount()
	{
		window.addEventListener("scroll", this.onScroll);
		window.addEventListener("resize", this.onScroll);
		document.getElementById("parameters").addEventListener("scroll", this.onScroll);
	}

	componentWillUnmount()
	{
		window.removeEventListener("scroll", this.onScroll);
		window.removeEventListener("resize", this.onScroll);
		document.getElementById("parameters").removeEventListener("scroll", this.onScroll);
	}

	private onSelectedCategoryChanged(e: React.FormEvent<HTMLInputElement>)
	{
		this.props.onSelectedCategoryChanged(e.currentTarget.value);
	}

	render()
	{
		const slotUsage = this.props.slotUsage;
		const maxSlots = this.props.maxSlots;

		return (
			<div id="parts-header" className={this.state.partsHeaderClass} style={{ top: this.state.partsHeaderTop }}>
				<legend>
					Equipments
						<span className="note">
						<SlotUsage slot={PartsSlot.Body} slotUsage={slotUsage[0]} maxSlots={maxSlots[0]} />&nbsp;
							<SlotUsage slot={PartsSlot.Arms} slotUsage={slotUsage[1]} maxSlots={maxSlots[1]} />&nbsp;
							<SlotUsage slot={PartsSlot.Misc} slotUsage={slotUsage[2]} maxSlots={maxSlots[2]} />&nbsp;
							<span id="parts-ttlcst">
							TtlCost: {this.props.totalCost}
						</span>
						&nbsp;
							{this.props.totalPrice}&nbsp;Cr
						</span>
				</legend>
				<div id="parts-categories">
					{["Current", "Speed", "Mobility", "Defense", "MSL", "SP.M", "SP.B", "SP.O", "Misc"].map(_ =>
						<label
							key={_}
							htmlFor={"parts-categories-" + this.props.getClassNameForCategory(_)}
							className={this.props.selectedCategory == _ ? "checked" : ""}>
							<input
								id={"parts-categories-" + this.props.getClassNameForCategory(_)}
								name="parts-category"
								type="radio"
								value={_}
								checked={this.props.selectedCategory == _}
								onChange={this.onSelectedCategoryChanged.bind(this)} />
							{_}
						</label>
					)}
				</div>
			</div>
		);
	}
}

function SlotUsage(props: {
	slot: PartsSlot;
	slotUsage: number;
	maxSlots: number;
})
{
	return (
		<span className={"slots-" + ["body", "arms", "misc"][props.slot]}>
			{["BODY", "ARMS", "MISC"][props.slot]}: <span className={props.slotUsage > props.maxSlots ? "slots-exceed" : ""}>{props.slotUsage}</span>/{props.maxSlots}
		</span>
	);
}

function Equipment(props: {
	language: string;
	aircraft: Aircraft;
	specialWeapon: SpecialWeapon;
	item: Parts;
	equippedParts: Parts[];
	onPartsChanged: (parts: Parts[]) => void;
})
{
	const item = props.item;
	const id = props.item.id;
	const equippedParts = props.equippedParts;
	const isEquipped = !!~equippedParts.indexOf(item);
	const isSupported = item.isSupported(props.aircraft.role, props.aircraft.mainWeapon)
		|| item.isSupported(props.aircraft.role, props.specialWeapon);

	const onPartsChanged = (e: React.FormEvent<HTMLInputElement>) =>
	{
		const isChecked = e.currentTarget.checked;

		if (isChecked)
			props.onPartsChanged(equippedParts.concat(item));
		else
			props.onPartsChanged(equippedParts.filter(_ => _.id != id));
	};

	return (
		<li className={[
			isEquipped && "checked",
			equippedParts.some(_ => _.sizeGroup && _.sizeGroup == item.sizeGroup) && "category-checked",
			!isSupported && "unsupported",
			!isEquipped && equippedParts.length >= 7 && "disabled"
		].filter(_ => _).join(" ")}>
			<label htmlFor={"parts-categorized-" + id}>
				<input
					id={"parts-categorized-" + id}
					type="checkbox"
					value={id}
					checked={isEquipped}
					disabled={!isEquipped && equippedParts.length >= 7}
					onChange={onPartsChanged.bind(this)} />
				<span className="parts-name">
					{props.language == "ja" ? item.name : item.englishName}
				</span>
				{item.power &&
					<span className="parts-power">
						+{item.power}
					</span>
				}
				{item.hits &&
					<span className="parts-hits">
						{item.hits}hits
					</span>
				}
				<span className={"parts-slots slots-" + ["body", "arms", "misc"][item.slot]}>
					{item.slotUsage}
				</span>
				<span className="parts-cost">
					Cst: {item.cost}
				</span>
				<span className="parts-price">
					{item.getPrice(props.aircraft)}&nbsp;Cr
				</span>
			</label>
		</li>
	);
}
