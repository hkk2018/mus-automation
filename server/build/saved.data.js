"use strict";
//saved main data
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMainData = exports.mainData = void 0;
var file_system_lib_1 = require("./file-system.lib");
var setting_1 = require("./setting");
file_system_lib_1.fileSys;
var BackData = /** @class */ (function () {
    function BackData() {
        this.musConfigs = [];
    }
    return BackData;
}());
var folderName = 'system-data';
var mainDatafilePath = folderName + "/" + setting_1.setting.systemDataFileName;
exports.mainData = loadMainData();
function loadMainData() {
    var loadedObj = file_system_lib_1.fileSys.readAsJson(mainDatafilePath, new BackData());
    //讀進來的檔案有可能是舊資料
    var md = new BackData();
    Object.keys(md).forEach(function (key) {
        if (loadedObj[key] === undefined)
            loadedObj[key] = md[key];
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
    return loadedObj;
}
function saveMainData() {
    file_system_lib_1.fileSys.writeAsJson(mainDatafilePath, exports.mainData);
}
exports.saveMainData = saveMainData;
