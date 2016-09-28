import * as React from "react";

export default function Field(props: {
	caption?: string;
	forId?: string;
	note?: any;
	isUncertain?: boolean;
	children?: React.ReactNode;
})
{
	return (
		<li>
			{props.caption &&
				<label htmlFor={props.forId}>
					{props.caption}
					<span className={"note" + (props.isUncertain ? " uncertain" : "")}>{props.note}</span>
				</label>
			}
			{props.children}
		</li>);
}
