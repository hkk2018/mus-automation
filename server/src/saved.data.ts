//saved main data

import { fileSys } from "./file-system.lib";
import { setting } from "./setting";

fileSys

class BackData {
    musConfigs: { name: string, speed: number }[] = [];
}
let folderName = 'system-data';
let mainDatafilePath = `${folderName}/${setting.systemDataFileName}`;

export let mainData: BackData = loadMainData();

function loadMainData(): BackData {
    let loadedObj = fileSys.readAsJson(mainDatafilePath, new BackData());
    //讀進來的檔案有可能是舊資料
    let md = new BackData();
    Object.keys(md).forEach(key => {
        if (loadedObj[key] === undefined) loadedObj[key] = (md as any)[key];
        else {
            if (key === 'programPathObj') {
                // const programPathObj = md[key];
                // Object.keys(programPathObj).forEach(keyInClassDef => {
                //     if (loadedObj[key][keyInClassDef] === undefined) {
                //         loadedObj[key][keyInClassDef] = (programPathObj as any)[keyInClassDef];
                //     }
                // })
            }
        }
    });
    return loadedObj as BackData
}

export function saveMainData() {
    fileSys.writeAsJson(mainDatafilePath, mainData);
}
