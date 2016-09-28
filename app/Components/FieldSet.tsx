import * as React from "react";

export default function FieldSet(props: {
	id: string;
	caption: string;
	note?: any;
	children?: React.ReactNode;
})
{
	return (
		<fieldset id={props.id}>
			<legend>
				{props.caption}
				<span className="note">{props.note}</span>
			</legend>
			<ul>
				{props.children}
			</ul>
		</fieldset>
	);
}
