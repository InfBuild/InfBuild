import * as React from "react";

export default function Dialog(props: {
	onClose: () => void;
	children?: React.ReactNode;
})
{
	return (
		<div className="dialog" onClick={e =>
		{
			e.stopPropagation();
			props.onClose();
		} }>
			<section onClick={e => e.stopPropagation()}>
				{props.children}
			</section>
		</div>
	);
}
