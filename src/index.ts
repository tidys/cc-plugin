#! /usr/bin/env node

import CocosPluginService from './service';
import { program } from 'commander'

program.version('1.0.0').allowUnknownOption(true)

const service = new CocosPluginService(process.cwd());
service.run();
program.parse(process.argv)
