"use strict";
//this file is the editor related codes
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsLib = void 0;
var http = __importStar(require("http"));
var file_system_lib_1 = require("./file-system.lib");
var main_service_1 = require("./main.service");
var saved_data_1 = require("./saved.data");
var socket_io_1 = __importDefault(require("socket.io")); //最新版的會衝到@types的定義，鳥，然後用跟其他興和川專案一樣的版本就解決了
var state_for_front_class_1 = require("./state-for-front.class");
var setting_1 = require("./setting");
exports.cmsLib = {
    cmsSocket: null,
    cmsServerPort: 8082,
    armAndVmzConnetionP: Promise.resolve(),
    emitEvent: function (eventName, data, onReplied) {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit(eventName, data, onReplied);
    },
    hostCmsServer: function () {
        var server = http.createServer(function (request, response) { });
        var connectedRes = function () { };
        var connectionProm = new Promise(function (res) {
            connectedRes = res;
        });
        // about 0.0.0.0:
        // https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
        // https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
        server.listen(exports.cmsLib.cmsServerPort, '0.0.0.0', function () {
            console.log('--------');
            console.log('server is listening to CMS on: ' + exports.cmsLib.cmsServerPort);
            console.log('--------');
        });
        // socket.io需要聽http.server
        var serv_io = socket_io_1.default.listen(server);
        serv_io.sockets.on('connection', function (socket) {
            console.log('cms is connected.');
            // mainService.setNwAsTopmost();
            exports.cmsLib.cmsSocket = socket;
            // connectedRes(); //為了主程式版本訊息能show一度挪到最後面試試看，結果發現沒用，也許是要等connected的callback跑完才能生效
            // setTimeout(connectedRes,300); //但設50又還是不行
            connectedRes(); // 最後發現是被chrome的測試版吃走了
            var eventsToRigister = [
                //--- Main Task
                //--- generic affairs
                {
                    eventName: 'OPEN_FOLDER',
                    onListened: function (data, reply) {
                        var dir = 'logs';
                        file_system_lib_1.fileSys.makeIfNoDir(dir);
                        main_service_1.mainService.openFolder(dir);
                    }
                },
                {
                    eventName: 'CLOSE_NW',
                    onListened: function (data, reply) {
                        console.log('CLOSE_NW');
                        setTimeout(function () {
                            reply();
                            main_service_1.mainService.closeProcessByPidP(process.pid.toString());
                        }, 150);
                    }
                },
                //---Accounts
                //--- System
                {
                    eventName: 'INITIAL_DATA',
                    onListened: function (data, reply) {
                        console.log('INITIAL_DATA');
                        reply({ backData: saved_data_1.mainData, backState: state_for_front_class_1.getBs() });
                    }
                },
                {
                    eventName: 'PLAY_SONG',
                    onListened: function (path, reply) {
                        var fullPath = setting_1.setting.musRootFolder + path;
                        var songName = path.slice(path.lastIndexOf('\\') + 1);
                        var songConfig = saved_data_1.mainData.musConfigs.find(function (c) { return c.name === songName; });
                        var songSpeedStr = String(songConfig ? songConfig.speed : 90);
                        main_service_1.mainService.execFile('exec/mus-ctrl.exe', [fullPath, songSpeedStr]);
                    }
                },
                {
                    eventName: 'SAVE_SONG_CONFIGS',
                    onListened: function (data, reply) {
                        saved_data_1.mainData.musConfigs = data;
                        saved_data_1.saveMainData();
                    }
                },
            ];
            eventsToRigister.forEach(function (info) {
                socket.on(info.eventName, info.onListened);
            });
        });
        return connectionProm;
    },
    tellToAlert: function (msg) {
        // cmsLib.emitEvent('ALERT', msg);
    },
    sendDataLog: function (msg) { }
};
