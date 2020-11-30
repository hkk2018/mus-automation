"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.system = void 0;
var cms_lib_1 = require("./cms.lib");
var file_system_lib_1 = require("./file-system.lib");
var saved_data_1 = require("./saved.data");
var setting_1 = require("./setting");
var System = /** @class */ (function () {
    function System() {
        this.musDirStructure = file_system_lib_1.fileSys.digIntoTree(setting_1.setting.musRootFolder);
        if (this.musDirStructure) {
            var songNames = this.searchSongNames(this.musDirStructure);
            // console.log(songNames)
            var isChanged_1 = false;
            songNames.forEach(function (songName) {
                if (!saved_data_1.mainData.musConfigs.find(function (config) { return config.name === songName; })) {
                    saved_data_1.mainData.musConfigs.push({ name: songName, speed: 90 });
                    isChanged_1 = true;
                }
            });
            if (isChanged_1) {
                console.log('新增曲名於db');
                saved_data_1.saveMainData();
            }
        }
    }
    System.prototype.searchSongNames = function (dirStructure) {
        var _this = this;
        var songNames = [];
        Object.keys(dirStructure).forEach(function (key) {
            var value = dirStructure[key];
            if (value === null) {
                songNames.push(key);
            }
            else {
                _this.searchSongNames(value).forEach(function (songName) { return songNames.push(songName); });
            }
        });
        return songNames;
    };
    return System;
}());
exports.system = new System();
cms_lib_1.cmsLib.hostCmsServer();
