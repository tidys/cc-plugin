#! /usr/bin/env node

import CocosPluginService from './service';

const service = new CocosPluginService(process.cwd());
service.run();
