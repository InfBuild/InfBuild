class Version
{
	static publishDate: Date = null;
	static etc: string = null;

	static get version()
	{
		let date = Version.publishDate || new Date();

		return date.getUTCFullYear().toString().substr(2)
			+ ("0" + (date.getUTCMonth() + 1)).slice(-2)
			+ ("0" + date.getUTCDate()).slice(-2)
			+ "-"
			+ ("0" + date.getUTCHours()).slice(-2)
			+ ("0" + date.getUTCMinutes()).slice(-2);
	}

	static get variant()
	{
		return [Version.etc, Version.publishDate ? null : "dev"].filter(_ => _ != null).join("-");
	} 
}