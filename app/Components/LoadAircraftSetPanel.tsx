import * as React from "react";
import Field from "./Field";
import FieldSet from "./FieldSet";
import AircraftSet from "../AircraftSet";
import IBuild from "../Data/IBuild";
import Resources from "../Data/Resources";

interface ILoadAircraftSetPanelProps
{
	resources: Resources;
	onLoadAircraftSet: (codes: string[]) => void;
	onCancel: () => void;
}
interface ILoadAircraftSetPanelState
{
	aircraftSets: AircraftSet[];
	selectedIndex: number;
}
export default class LoadAircraftSetPanel extends React.Component<ILoadAircraftSetPanelProps, ILoadAircraftSetPanelState>
{
	constructor(props: ILoadAircraftSetPanelProps)
	{
		super(props);
		this.state = {
			aircraftSets: [],
			selectedIndex: -1
		};
	}

	componentDidMount()
	{
		const sets = AircraftSet.loadSets() || [];

		this.setState({
			aircraftSets: sets,
			selectedIndex: sets.length ? 0 : -1
		} as ILoadAircraftSetPanelState);
	}

	private onLoadAircraftSet(e: React.FormEvent<HTMLFormElement>)
	{
		e.preventDefault();

		if (this.state.selectedIndex != -1)
			this.props.onLoadAircraftSet(this.state.aircraftSets[this.state.selectedIndex].codes);
	}

	render()
	{
		return (
			<form onSubmit={this.onLoadAircraftSet.bind(this)}>
				<FieldSet id="load-aircraftset" caption="Load Aircraft Set">
					<Field forId="load-aircraftset-sets" caption="Aircraft Sets">
						<select
							id="load-aircraftset-sets"
							size={8}
							value={this.state.selectedIndex}
							onChange={e => this.setState({ selectedIndex: parseInt(e.currentTarget.value) } as ILoadAircraftSetPanelState)}>
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
					<Field>
						<button type="submit" disabled={this.state.selectedIndex == -1}>Load</button>
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
