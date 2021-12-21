import webpack from 'webpack';
import * as Path from 'path'
import * as FsExtra from 'fs-extra';
import { CocosPluginManifest, CocosPluginOptions, PanelOptions, PluginVersion } from '../declare';



export default class Manifest {

    private plugin: CocosPluginManifest | null = null;

    constructor(plugin: CocosPluginManifest, options?: CocosPluginOptions) {
        this.plugin = plugin;
    }

    apply( ) {

    }

}
