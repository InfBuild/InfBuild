import * as React from "react";
import Version from "../Version";

export default function Header(props: {
	version: Version;
	language: string;
	onLanguageChanged: (language: string) => void;
	onResetClicked: () => void;
	onLoadClicked: () => void;
	onSaveClicked: () => void;
	onTextClicked: () => void;
	onTweetClicked: () => void;
})
{
	const onButtonClick = (func: () => void) =>
		(e: React.FormEvent<HTMLButtonElement>) =>
		{
			e.preventDefault();
			func();
		};

	return (
		<header>
			<h1>
				InfBuild
			<span id="variant">{props.version.variant ? "/" + props.version.variant + "/" : ""}</span>
				<span id="version">{props.version.version}</span>
			</h1>
			<Languages language={props.language} onLanguageChanged={props.onLanguageChanged} />
			<p>
				ACEINF Aircraft Set Builder / Damage Calculator
			</p>
			<nav>
				<button onClick={onButtonClick(props.onResetClicked)}>Reset</button>
				<button onClick={onButtonClick(props.onLoadClicked)}>Load</button>
				<button onClick={onButtonClick(props.onSaveClicked)}>Save</button>
				<button onClick={onButtonClick(props.onTextClicked)}>Text</button>
				<button onClick={onButtonClick(props.onTweetClicked)}>Tweet</button>
			</nav>
		</header>
	);
}

function Languages(props: {
	language: string;
	onLanguageChanged: (language: string) => void;
})
{
	return (
		<div id="languages">
			{["en", "ja"].map(l =>
				<label key={l} htmlFor={"languages-" + l} className={props.language == l ? "checked" : ""}>
					<input
						name="languages"
						id={"languages-" + l}
						type="radio"
						value={l}
						checked={props.language == l}
						onChange={e => e.currentTarget.checked && props.onLanguageChanged(l)} />
					{l}
				</label>
			)}
		</div>
	);
}
