#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const commander_1 = require("commander");
commander_1.program.version('1.0.0').allowUnknownOption(true);
const service = new service_1.default(process.cwd());
service.run();
commander_1.program.parse(process.argv);
