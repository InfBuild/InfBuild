export default class Version
{
	static etc: string = null;

	constructor(private publishDate: Date = null)
	{
	}

	get version()
	{
		const date = this.publishDate || new Date();

		return date.getUTCFullYear().toString().substr(2)
			+ ("0" + (date.getUTCMonth() + 1)).slice(-2)
			+ ("0" + date.getUTCDate()).slice(-2)
			+ "-"
			+ ("0" + date.getUTCHours()).slice(-2)
			+ ("0" + date.getUTCMinutes()).slice(-2);
	}

	get variant()
	{
		return [Version.etc, this.publishDate ? null : "dev"].filter(_ => _ != null).join("-");
	} 
}