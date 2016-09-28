import * as React from "react";
import Version from "./Version";
import AboutDialog from "./Components/AboutDialog";
import BuildParameters from "./Components/BuildParameters";
import Header from "./Components/Header";
import LoadAircraftSetPanel from "./Components/LoadAircraftSetPanel";
import SaveAircraftSetPanel from "./Components/SaveAircraftSetPanel";
import TextOutputPanel from "./Components/TextOutputPanel";
import Results from "./Components/Results";
import IBuild from "./Data/IBuild";
import Resources from "./Data/Resources";

interface IAppProps
{
	version: Version;
	resources: Resources;
	hash: string;
}
interface IAppState
{
	language: string;
	builds: IBuild[];
	selectedBuildIndex: number;
	loadAircraftSetVisible: boolean;
	saveAircraftSetVisible: boolean;
	textOutputVisible: boolean;
	visibleDialogs: string[];
}
export default class App extends React.Component<IAppProps, IAppState>
{
	static readonly dialogNames = ["#about"];

	constructor(props: IAppProps)
	{
		super(props);

		this.state = {
			language: "ja",
			builds: props.hash && !~App.dialogNames.indexOf(props.hash)
				? this.getBuildsFromHash(props.hash)
				: [IBuild.create(props.resources)],
			selectedBuildIndex: 0,
			loadAircraftSetVisible: false,
			saveAircraftSetVisible: false,
			textOutputVisible: false,
			visibleDialogs: []
		};
	}

	componentWillReceiveProps(nextProps: IAppProps, _: any)
	{
		if (nextProps.hash && ~App.dialogNames.indexOf(nextProps.hash))
			this.setState({ visibleDialogs: this.state.visibleDialogs.concat(nextProps.hash) } as IAppState);
		else
			this.reset(nextProps.hash);
	}

	reset(hash?: string)
	{
		this.setState({
			builds: hash ? this.getBuildsFromHash(hash) : [IBuild.create(this.props.resources)],
			selectedBuildIndex: 0,
			visibleDialogs: []
		} as IAppState, () => this.updateHash());
	}

	loadAircraftSet(codes: string[])
	{
		this.setState({
			builds: codes.map(_ => IBuild.fromCode(this.props.resources, _)),
			selectedBuildIndex: 0,
			loadAircraftSetVisible: false
		} as IAppState, () => this.updateHash());
	}

	saveAircraftSet(): string[]
	{
		this.setState({ saveAircraftSetVisible: false } as IAppState);

		return this.state.builds.map(IBuild.toCode);
	}

	tweet()
	{
		window.open(`https://twitter.com/intent/tweet?text=&hashtags=${encodeURIComponent("infbuild")}&url=${encodeURIComponent(this.getAbsoluteUrlWithHash())}`, "_blank");
	}

	private getBuildsFromHash(hash: string)
	{
		return hash.replace("#", "").split(/-/g).map(_ => IBuild.fromCode(this.props.resources, _));
	}

	private getAbsoluteUrl()
	{
		let href = location.href;

		if (location.hash)
			href = href.slice(0, -location.hash.length);

		if (location.search)
			href = href.slice(0, -location.search.length);

		return href;
	}

	private getAbsoluteUrlWithHash()
	{
		return this.getAbsoluteUrl() + "#" + this.state.builds.map(IBuild.toCode).join("-");
	}

	private updateHash()
	{
		const url = this.getAbsoluteUrlWithHash();

		if (window.history.replaceState && location.href != url)
			window.history.replaceState(null, null, url);
	}

	private onBuildChanged(build: IBuild)
	{
		this.setState({
			builds: this.state.builds.map((v, i) => i == this.state.selectedBuildIndex ? build : v)
		} as IAppState, () => this.updateHash());
	}

	render()
	{
		return (
			<div>
				<div id="parameters">
					<Header
						version={this.props.version}
						language={this.state.language}
						onLanguageChanged={_ => this.setState({ language: _ } as IAppState)}
						onResetClicked={this.reset.bind(this)}
						onLoadClicked={() => this.setState({
							loadAircraftSetVisible: !this.state.loadAircraftSetVisible,
							saveAircraftSetVisible: false
						} as IAppState)}
						onSaveClicked={() => this.setState({
							loadAircraftSetVisible: false,
							saveAircraftSetVisible: !this.state.saveAircraftSetVisible
						} as IAppState)}
						onTextClicked={() => this.setState({ textOutputVisible: !this.state.textOutputVisible } as IAppState)}
						onTweetClicked={() => this.tweet()} />
					{this.state.loadAircraftSetVisible &&
						<LoadAircraftSetPanel
							resources={this.props.resources}
							onLoadAircraftSet={this.loadAircraftSet.bind(this)}
							onCancel={() => this.setState({ loadAircraftSetVisible: false } as IAppState)} />
					}
					{this.state.saveAircraftSetVisible &&
						<SaveAircraftSetPanel
							resources={this.props.resources}
							onSaveAircraftSet={this.saveAircraftSet.bind(this)}
							onCancel={() => this.setState({ saveAircraftSetVisible: false } as IAppState)} />
					}
					{this.state.textOutputVisible &&
						<TextOutputPanel
							language={this.state.language}
							builds={this.state.builds}
							onClose={() => this.setState({ textOutputVisible: false } as IAppState)} />
					}
					<BuildParameters
						language={this.state.language}
						resources={this.props.resources}
						build={this.state.builds[this.state.selectedBuildIndex]}
						onChanged={this.onBuildChanged.bind(this)} />
				</div>
				<form id="results">
					<Results
						resources={this.props.resources}
						builds={this.state.builds}
						selectedBuildIndex={this.state.selectedBuildIndex}
						onSelectedBuildChanged={_ => this.setState({
							selectedBuildIndex: _
						} as IAppState)}
						onAddBuild={() => this.setState({
							builds: this.state.builds.concat(IBuild.create(this.props.resources)),
							selectedBuildIndex: this.state.builds.length
						} as IAppState, () => this.updateHash())}
						onRemoveBuild={() => this.setState({
							builds: this.state.builds.filter((_, i) => i != this.state.selectedBuildIndex),
							selectedBuildIndex: Math.max(this.state.selectedBuildIndex - 1, 0)
						} as IAppState, () => this.updateHash())} />
				</form>
				{!!~this.state.visibleDialogs.indexOf("#about") &&
					<AboutDialog onClose={() => history.back()} />
				}
			</div>
		);
	}
}
