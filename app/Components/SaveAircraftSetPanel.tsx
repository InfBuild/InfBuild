import * as React from "react";
import Field from "./Field";
import FieldSet from "./FieldSet";
import AircraftSet from "../AircraftSet";
import IBuild from "../Data/IBuild";
import Resources from "../Data/Resources";

interface ISaveAircraftSetPanelProps
{
	resources: Resources;
	onSaveAircraftSet: () => string[];
	onCancel: () => void;
}
interface ISaveAircraftSetPanelState
{
	aircraftSets: AircraftSet[];
	selectedIndex: number;
	aircraftSetName: string;
}
export default class SaveAircraftSetPanel extends React.Component<ISaveAircraftSetPanelProps, ISaveAircraftSetPanelState>
{
	constructor(props: ISaveAircraftSetPanelProps)
	{
		super(props);
		this.state = {
			aircraftSets: [],
			selectedIndex: -1,
			aircraftSetName: ""
		};
	}

	componentDidMount()
	{
		const sets = AircraftSet.loadSets() || [];

		this.setState({ aircraftSets: sets } as ISaveAircraftSetPanelState);
	}

	private onSaveAircraftSet(e: React.FormEvent<HTMLFormElement>)
	{
		e.preventDefault();

		const set = new AircraftSet(this.state.aircraftSetName, this.props.onSaveAircraftSet());
		const sets = this.state.aircraftSets;

		if (this.state.selectedIndex == -1)
			sets.push(set);
		else
			sets[this.state.selectedIndex] = set;

		AircraftSet.saveSets(sets);
		this.setState({ aircraftSets: sets } as ISaveAircraftSetPanelState);
	}

	private onDeleteAircraftSet(e: React.FormEvent<HTMLFormElement>)
	{
		e.preventDefault();

		if (this.state.selectedIndex != -1)
		{
			const sets = this.state.aircraftSets;

			sets.splice(this.state.selectedIndex, 1);
			AircraftSet.saveSets(sets);
			this.setState({
				aircraftSets: sets,
				selectedIndex: -1
			} as ISaveAircraftSetPanelState);
		}
	}

	render()
	{
		return (
			<form onSubmit={this.onSaveAircraftSet.bind(this)}>
				<FieldSet id="save-aircraftset" caption="Save Aircraft Set">
					<Field forId="save-aircraftset-sets" caption="Aircraft Sets">
						<select
							id="save-aircraftset-sets"
							size={8}
							value={this.state.selectedIndex}
							onChange={e => this.setState({
								selectedIndex: parseInt(e.currentTarget.value),
								aircraftSetName: e.currentTarget.value == "-1" ? "" : this.state.aircraftSets[parseInt(e.currentTarget.value)].name
							} as ISaveAircraftSetPanelState)}>
							<option value="-1">Save new...</option>
							{this.state.aircraftSets.map((v, i) =>
								<option key={i} value={i}>{v.name}</option>
							)}
						</select>
					</Field>
					<Field caption="Selected Set">
						<ul>
							{this.state.selectedIndex != -1 && this.state.aircraftSets[this.state.selectedIndex].codes
								.map(_ => IBuild.fromCode(this.props.resources, _))
								.map((build, i) =>
									<li key={i}>
										{build.aircraft.name}&nbsp;
										Lv.{build.level}&nbsp;
										<span className="note">
											{build.specialWeapon.name}&nbsp;
											Lv.{build.specialWeaponLevel}
										</span>
									</li>
								)
							}
						</ul>
					</Field>
					<Field forId="save-aircraftset-name" caption="Set Name">
						<input
							id="save-aircraftset-name"
							type="text"
							value={this.state.aircraftSetName}
							onChange={e => this.setState({
								aircraftSetName: e.currentTarget.value
							} as ISaveAircraftSetPanelState)} />
					</Field>
					<Field>
						<button type="submit">Save</button>
						<button disabled={this.state.selectedIndex == -1} onClick={this.onDeleteAircraftSet.bind(this)}>Delete</button>
						<button onClick={e =>
						{
							e.preventDefault();
							this.props.onCancel();
						} }>Cancel</button>
					</Field>
				</FieldSet>
			</form>
		);
	}
}
