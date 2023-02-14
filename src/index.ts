import { program } from "commander";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import transformSql from "./scripts/sql.ts";

program.command("transform <input> <output›").description("转换文件").action(transformSql);
program.parse(process.argv);
