#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const commander_1 = require("commander");
commander_1.program.version('1.0.0').allowUnknownOption(true);
service_1.cocosPluginService.readyPlugins();
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map