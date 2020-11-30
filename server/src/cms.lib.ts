//this file is the editor related codes

import * as http from 'http';
import { fileSys } from './file-system.lib';
import { mainService } from './main.service';
import { mainData, saveMainData } from './saved.data';
import io from 'socket.io'; //最新版的會衝到@types的定義，鳥，然後用跟其他興和川專案一樣的版本就解決了
import { getBs } from './state-for-front.class';
import { setting } from './setting';

type EventNameToEmit = '';

type ListeningEvent =
    'OPEN_FOLDER'
    | 'CLOSE_NW' | 'PLAY_SONG' | 'CHOOSE_PROC_PATH' |
    'INITIAL_DATA' | 'SYNC_BACK_STATE' | 'SAVE_SONG_CONFIGS';

export let cmsLib = {
    cmsSocket: null as null | io.Socket,
    cmsServerPort: 8082,
    armAndVmzConnetionP: Promise.resolve(),
    emitEvent(eventName: EventNameToEmit, data?: any, onReplied?: (data: any) => void) {
        cmsLib.cmsSocket?.emit(eventName, data, onReplied);
    },
    hostCmsServer() {
        let server = http.createServer(function (request, response) { });
        let connectedRes = () => { };
        let connectionProm = new Promise(res => {
            connectedRes = res;
        })

        // about 0.0.0.0:
        // https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
        // https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
        server.listen(cmsLib.cmsServerPort, '0.0.0.0', function () {
            console.log('--------');
            console.log('server is listening to CMS on: ' + cmsLib.cmsServerPort);
            console.log('--------');
        });
        // socket.io需要聽http.server
        let serv_io = io.listen(server);
        serv_io.sockets.on('connection', function (socket) {
            console.log('cms is connected.');

            // mainService.setNwAsTopmost();
            cmsLib.cmsSocket = socket;

            // connectedRes(); //為了主程式版本訊息能show一度挪到最後面試試看，結果發現沒用，也許是要等connected的callback跑完才能生效
            // setTimeout(connectedRes,300); //但設50又還是不行
            connectedRes();// 最後發現是被chrome的測試版吃走了


            interface ListenEventInfo {
                eventName: ListeningEvent;
                onListened: (data: any, reply: (data: any) => void) => void;
            }

            const eventsToRigister: ListenEventInfo[] = [
                //--- Main Task
                //--- generic affairs
                {
                    eventName: 'OPEN_FOLDER',
                    onListened: function (data: null, reply: Function) {
                        const dir = 'logs';
                        fileSys.makeIfNoDir(dir);
                        mainService.openFolder(dir);
                    }
                },
                {
                    eventName: 'CLOSE_NW',
                    onListened: function (data: null, reply: Function) {
                        console.log('CLOSE_NW');
                        setTimeout(() => {
                            reply();
                            mainService.closeProcessByPidP(process.pid.toString());
                        }, 150);

                    }
                },
                //---Accounts
                //--- System
                {
                    eventName: 'INITIAL_DATA',
                    onListened: function (data: null, reply: Function) {
                        console.log('INITIAL_DATA')
                        reply({ backData: mainData, backState: getBs() });
                    }
                },
                {
                    eventName: 'PLAY_SONG',
                    onListened: function (path: string, reply: Function) {
                        const fullPath = setting.musRootFolder + path;
                        const songName = path.slice(path.lastIndexOf('\\') + 1);
                        const songConfig = mainData.musConfigs.find(c => c.name === songName);
                        const songSpeedStr = String(songConfig ? songConfig.speed : 90);
                        mainService.execFile('exec/mus-ctrl.exe', [fullPath, songSpeedStr]);
                    }
                },
                {
                    eventName: 'SAVE_SONG_CONFIGS',
                    onListened: function (data: any, reply: Function) {
                        mainData.musConfigs = data;
                        saveMainData();
                    }
                },

                // {
                //     eventName: '',
                //     onListened: function (data: any, reply: Function) { }
                // }, 
            ]
            eventsToRigister.forEach(info => {
                socket.on(info.eventName, info.onListened);
            })
        });
        return connectionProm;
    },
    tellToAlert(msg: string) {
        // cmsLib.emitEvent('ALERT', msg);
    },
    sendDataLog(msg: string) { }

}