import * as React from "react";
import Field from "./Field";
import FieldSet from "./FieldSet";
import IBuild from "../Data/IBuild";

export default function TextOutputPanel(props: {
	language: string;
	builds: IBuild[];
	onClose: () => void;
})
{
	return (
		<form>
			<FieldSet id="text" caption="Text Output">
				<Field>
					<textarea
						id="text-output"
						readOnly={true}
						onClick={e =>
						{
							e.currentTarget.focus();
							e.currentTarget.select();
						}}>{props.builds.map(_ => IBuild.toDetailedString(_, props.language)).join("\r\n\r\n")}</textarea>
				</Field>
				<Field>
					<button onClick={e =>
					{
						e.preventDefault();
						props.onClose();
					} }>Close</button>
				</Field>
			</FieldSet>
		</form>
	);
}
