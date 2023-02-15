var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";
import path from "path";
const { readFile, writeFile } = fs;
function transformType(sqlType) {
    const typeMap = {
        varchar: "string",
        int: "number",
        datetime: "Date",
    };
    return typeMap[sqlType];
}
function transformName(sqlName) {
    return sqlName.replace(/-([a-z])/, function (_, match) {
        return match.toUpperCase();
    });
}
const spinner = ora({ color: "blue" });
export default function (input, output) {
    return __awaiter(this, void 0, void 0, function* () {
        spinner.start("开始转换");
        try {
            const buffer = yield readFile(path.resolve(process.cwd(), input));
            const sqlContent = buffer.toString();
            const SQL_TABLE_REGX = /CREATE(\s+)TABLE(\s+)`(?<tablename>(.*))`([\s\S]*?)PRIMARY(\s+)KEY([\s\S]*?);/g;
            const SQL_TABLE_PARAM_REGX = /`(?<name>(.*))`(\s+)(?<type>(varchar|int|decimal))\((.*)\)(\s+)(NOT|DEFAULT)(\s+)NULL(\s+)(COMMENT|AUTO_INCREMENT)(\s?)(["'](?<description>(.*))['"])/g;
            const transformResult = sqlContent.replace(SQL_TABLE_REGX, function (str, ...arg) {
                const tableName = arg[2];
                let match = SQL_TABLE_PARAM_REGX.exec(str);
                const params = [];
                while (match !== null) {
                    params.push(match.groups);
                    match = SQL_TABLE_PARAM_REGX.exec(str);
                }
                const jsDoc = "/**\r\n" +
                    "*@description xxxx \r\n" +
                    params.map(({ name, description }) => `*@property ${transformName(name)} -${description || "-"}`).join("\r\n") +
                    "\r\n*/";
                const ts = `type ${transformName(tableName)} = {` +
                    params.map(({ name, type }) => `\r\n\t ${transformName(name)}: ${transformType(type)};`).join("") +
                    "\r\n}\r\n";
                return jsDoc + "\r\n" + ts + "\r\n";
            });
            yield writeFile(path.resolve(process.cwd(), output), Buffer.from(transformResult));
            spinner.succeed("转换成功!");
        }
        catch (e) {
            spinner.fail(chalk.redBright(`转换失败, 错误： ${e}`));
        }
        finally {
            spinner.clear();
        }
    });
}
