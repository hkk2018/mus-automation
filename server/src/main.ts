import { cmsLib } from "./cms.lib";
import { DirEntry, fileSys } from "./file-system.lib";
import { mainData, saveMainData } from "./saved.data";
import { setting } from "./setting";

class System {
    constructor() {
        if (this.musDirStructure) {
            const songNames = this.searchSongNames(this.musDirStructure);
            // console.log(songNames)
            let isChanged = false;
            songNames.forEach(songName => {
                if (!mainData.musConfigs.find(config => config.name === songName)) {
                    mainData.musConfigs.push({ name: songName, speed: 90 });
                    isChanged = true;
                }
            })
            if (isChanged) {
                console.log('新增曲名於db');
                saveMainData();
            }
        }
    }
    musDirStructure = fileSys.digIntoTree(setting.musRootFolder);
    searchSongNames(dirStructure: DirEntry): string[] {
        const songNames: string[] = [];
        Object.keys(dirStructure).forEach(key => {
            let value = dirStructure[key];
            if (value === null) {
                songNames.push(key);
            }
            else {
                this.searchSongNames(value).forEach(songName => songNames.push(songName));
            }
        });
        return songNames
    }
}

export const system = new System();


cmsLib.hostCmsServer();


