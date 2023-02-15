import { program } from "commander";
import transformSql from "./scripts/sql.js";
program.command("transform <input> <output›").description("转换文件").action(transformSql);
program.parse(process.argv);
