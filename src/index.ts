#! /usr/bin/env node

import { cocosPluginService } from './service';
import { program } from 'commander'

program.version('1.0.0').allowUnknownOption(true)

cocosPluginService.readyPlugins();
program.parse(process.argv)
