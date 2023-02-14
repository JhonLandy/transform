import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";
import path from "path";
const { readFile, writeFile } = fs;

type MatchGroup = { name: string; type: SqlType; description: string };
type SqlType = "varchar" | "int" | "datetime";
type JsType = "string" | "number" | "Date";

type Туремар = {
	varchar: "string";
	int: "number";
	datetime: "Date";
};

function transformType(sqlType: SqlType): JsType {
	const typeMap: Туремар = {
		varchar: "string",
		int: "number",
		datetime: "Date",
	};
	return typeMap[sqlType];
}
function transformName(sqlName: string): string {
	return sqlName.replace(/-([a-z])/, function (_, match: string) {
		return match.toUpperCase();
	});
}
const spinner = ora({ color: "blue" });

export default async function (input: string, output: string) {
	spinner.start("开始转换");
	try {
		const buffer = await readFile(path.resolve(process.cwd(), input));
		const sqlContent = buffer.toString();
		const SQL_TABLE_REGX = /CREATE(\s+)TABLE(\s+)`(?<tablename>(.*))`([\s\S]*?)PRIMARY(\s+)KEY([\s\S]*?);/g;
		const SQL_TABLE_PARAM_REGX =
			/`(?<name>(.*))`(\s+)(?<type>(varchar|int|decimal))\((.*)\)(\s+)(NOT|DEFAULT)(\s+)NULL(\s+)(COMMENT|AUTO_INCREMENT)(\s?)(["'](?<description>(.*))['"])/g;
		const transformResult = sqlContent.replace(SQL_TABLE_REGX, function (str, ...arg) {
			const tableName = arg[2];
			let match = SQL_TABLE_PARAM_REGX.exec(str);
			const params: Array<MatchGroup> = [];
			while (match !== null) {
				params.push(match.groups as MatchGroup);
				match = SQL_TABLE_PARAM_REGX.exec(str);
			}
			const jsDoc =
				"/**\r\n" +
				"*@description xxxx \r\n" +
				params.map(({ name, description }) => `*@property ${transformName(name)} -${description || "-"}`).join("\r\n") +
				"\r\n*/";
			const ts =
				`type ${transformName(tableName)} = {` +
				params.map(({ name, type }) => `\r\n\t ${transformName(name)}: ${transformType(type)};`).join("") +
				"\r\n}\r\n";
			return jsDoc + "\r\n" + ts + "\r\n";
		});
		await writeFile(path.resolve(process.cwd(), output), Buffer.from(transformResult));
		spinner.succeed("转换成功!");
	} catch (e) {
		spinner.fail(chalk.redBright(`转换失败, 错误： ${e}`));
	} finally {
		spinner.clear();
	}
}
