export interface BuildInfo {
    type: "onAfterBuild",
    data: {
        buildPath: string;
        name: string;
        outputName: string;
        platform: string;
        md5Cache: boolean;
    }
}