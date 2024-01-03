"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
class Log {
    red(str) {
        console.log(chalk_1.default.red(str));
    }
    blue(str) {
        console.log(chalk_1.default.blue(str));
    }
    yellow(str) {
        console.log(chalk_1.default.yellow(str));
    }
    green(str) {
        console.log(chalk_1.default.green(str));
    }
}
exports.log = new Log();
//# sourceMappingURL=log.js.map