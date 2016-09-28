import * as React from "react";
import Dialog from "./Dialog";

export default function AboutDialog(props: {
	onClose: () => void;
})
{
	return (
		<Dialog onClose={props.onClose}>
			<h1>About InfBuild</h1>
			<dl>
				<dt>Main Developer</dt>
				<dd>
					<a href="https://twitter.com/mfakane">mfakane</a>
				</dd>
				<dt>Original damage calculation methods</dt>
				<dd>
					Original damage calculation methods are from <a href="http://berkut.blog.jp/">Berkut Method</a>.
				</dd>
				<dt>Database</dt>
				<dd>
					InfBuild is using data from <a href="https://github.com/InfBuild/InfData">InfData</a>, a repository for gathering data for ACEINF.
				</dd>
				<dt>License</dt>
				<dd>
					InfBuild is licensed under the <a href="https://opensource.org/licenses/MIT">MIT License</a>.
				</dd>
			</dl>
		</Dialog>
	);
}
