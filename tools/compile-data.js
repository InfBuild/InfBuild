const fs = require("fs");
const path = require("path");
const parse = require("csv-parse");

const isUncertain = str => str == "" || str.includes("?");
const parseOrEmpty = (str, parser, defaultValue = null) => str == "" ? defaultValue : parser(str);
const defaultIfEmpty = (str, defaultValue = null) => str == "" ? defaultValue : str;

let costTable = {};

const sources = [
	{
		name: "AircraftCstTableList",
		output: false,
		parse: data =>
		{
			costTable[data["Name/Cst."]] = [data["2-10"], data["11-15"], data["16"], data["17-"]].map(_ => parseInt(_));
		}
	},
	{
		name: "SpecialWeaponList",
		parse: data => ({
			id: parseFloat(data["ID"]),
			name: data["Name"],
			role: data["Role"],
			category: data["Category"],
			airRate: [data["Air F"], data["Air M"], data["Air A"], data["Air B"], data["Air PF"]].map(_ => parseFloat(_)),
			isAirRateUncertain: [data["Air F"], data["Air M"], data["Air A"], data["Air B"], data["Air PF"]].map(_ => isUncertain(_)),
			groundRate: [data["Ground F"], data["Ground M"], data["Ground A"], data["Ground B"], data["Ground PF"]].map(_ => parseFloat(_)),
			isGroundRateUncertain: [data["Ground F"], data["Ground M"], data["Ground A"], data["Ground B"], data["Ground PF"]].map(_ => isUncertain(_)),
			strongMultiplier: parseFloat(data["Strong Multiplier"]),
			weakDivider: parseFloat(data["Weak Divider"]),
			numberOfGauges: parseInt(data["Max Simultaneous Attacks"]),
			levelRate1: parseFloat(data["Initial Power"]),
			isLevelRateUncertain: isUncertain(data["Initial Power"]),
			levelRateAdditionPerLevel: parseFloat(data["Power Increment"]),
			fixedBaseCost: parseOrEmpty(data["Fixed Base Cst."], parseInt),
			relatedDamage: defaultIfEmpty(data["Related Damage"]),
			costs: data["Cst."].split(",").map(_ => parseInt(_))
		})
	},
	{
		name: "AircraftList",
		dependsOn: "SpecialWeaponList",
		parse: data => ({
			id: parseFloat(data["ID"]),
			name: data["Name"],
			role: data["Role"],
			cost: parseInt(data["Base Cst."]),
			handicap: parseInt(data["Handicap"]) || 0,
			isHandicapUncertain: isUncertain(data["Handicap"]),
			mainWeapon: defaultIfEmpty(data["Main"], "MSL"),
			specialWeapons: [data["SP.W 1"], data["SP.W 2"], data["SP.W 3"]],
			slots: [data["BODY"], data["ARMS"], data["MISC"]].map(_ => parseInt(_)),
			costTable: costTable[data["Name"]] || costTable[data["Base Cst."]],
			equipCost: parseInt(data["Mod Cost"]),
			isEquipCostUncertain: isUncertain(data["Mod Cost"])
		})
	},
	{
		name: "PartsList",
		parse: data => ({
			id: parseFloat(data["ID"]),
			name: data["Name"],
			englishName: data["English Name"],
			cost: parseInt(data["Cst."]),
			slot: data["Slot"],
			slotUsage: parseInt(data["Slot Usage"]),
			category: data["Category"],
			sizeGroup: data["Group"],
			supportedWeapons: parseOrEmpty(data["SP.W"], _ => _.split(",")),
			supportedRoles: parseOrEmpty(data["Role"], _ => _.split(",")),
			power: parseInt(data["Power"]),
			hits: parseInt(data["Hits"])
		})
	},
	{
		name: "StageList",
		keyProperty: "key",
		parse: data => ({
			id: parseFloat(data["ID"]),
			key: data["Key"],
			name: data["Name"],
			isHard: Boolean(data["HARD"]),
			originalStage: defaultIfEmpty(data["Original"]),
			isSpecialRaid: Boolean(data["Special Raid"])
		})
	},
	{
		name: "EnemyList",
		dependsOn: "StageList",
		checkKeyDuplicate: false,
		parse: data => ({
			name: data["Name"],
			role: data["Role"],
			color: data["Color"],
			score: parseInt(data["Score"]),
			hitPoint: parseInt(data["HP"]),
			isSoftTarget: Boolean(data["Soft Target"]),
			hardMultiplier: parseFloat(data["Hard Multiplier"]),
			weakAgainst: parseOrEmpty(data["Weakness"], _ => _.split(",")),
			strongAgainst: parseOrEmpty(data["Strongness"], _ => _.split(",")),
			stages: data["Stages"].split(",")
		})
	},
	{
		name: "DatalinkList",
		parse: data => ({
			id: parseInt(data["ID"]),
			name: data["Name"],
			englishName: data["English Name"],
			cost: parseInt(data["Cst."])
		})
	},
];

Promise.all(sources.map(src => new Promise((resolve, reject) =>
	fs.createReadStream(path.join(__dirname, `../data/${src.name}.tsv`), "utf8")
		.on("error", err => reject(new Error(`Error reading ${src.name}: ${err.message}`)))
		.pipe(parse({ delimiter: "\t", comment: "#", columns: true }, (err, data) =>
		{
			let output = [];
			let ids = [];
			let keys = [];
			let idx = 0;

			for (let j in data)
			{
				let entry = src.parse(data[j]);

				if (!entry)
					continue;

				let line = `${src.name}.push(${JSON.stringify(entry)})`;
				let keyProperty = src.keyProperty || "name";

				if ((src.checkKeyDuplicate === undefined || src.checkKeyDuplicate) && entry[keyProperty] !== undefined)
				{
					line += `; ${src.name}ByKey[${src.name}[${idx}].${keyProperty}] = ${idx}`;

					if (keys.includes(entry[keyProperty]))
						throw new Error(`Error parsing ${src[keyProperty]}: Name ${entry[keyProperty]} is duplicate`);
					else
						keys.push(entry[keyProperty]);
				}

				if (entry.id !== undefined)
				{
					line += `; ${src.name}ById[${entry.id}] = ${idx}`;

					if (ids.includes(entry.id))
						throw new Error(`Error parsing ${src.name}: ID ${entry.id} is duplicate`);
					else
						ids.push(entry.id);
				}

				output.push(line);
				idx++;
			}

			resolve(output.join("; "));
		}))
		.on("error", err => reject(new Error(`Error parsing ${src}: ${err.message}`))))))
	.then(lines =>
	{
		try
		{
			let sourcesToWrite = sources.filter(src => src.output === undefined || src.output);
			let vars = sourcesToWrite.map(src => `${src.name} = [], ${src.name}ById = [], ${src.name}ByKey = []`).join("; ");
			let build = sourcesToWrite.map(src =>
			{
				return `${src.name} = ${src.name}.map(function(v, i) { return ${src.name.slice(0, -4)}.fromJsonObject(${src.dependsOn ? src.dependsOn + ", " : ""}i, v) });
					${src.name}.byId = function(_) { return ${src.name}[${src.name}ById[_]] };
					${src.name}.byKey = function(_) { return ${src.name}[${src.name}ByKey[_]] }`
			}).join("; ");
			let result = `var initializeResources = function(Resources, Aircraft, SpecialWeapon, Parts, Enemy, Datalink, Stage)
			{
				var ${vars};
				${lines.join("; ")};
				${build};
				return new Resources(AircraftList, SpecialWeaponList, PartsList, EnemyList, DatalinkList, StageList);
			}`;

			fs.writeFileSync(path.join(__dirname, `../dist/data.js`), result, { encoding: "utf8" });
		}
		catch (ex)
		{
			console.log(ex);
		}
	}, console.log);

