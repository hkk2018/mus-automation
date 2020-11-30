
import io from 'socket.io-client'; //最新版(3.x.x)好像有bug，所以用回跟roboarm-win的版本 
import { allData } from './data/all.data';
import { BackData } from './data/back.data';
// import { MainDataBack as BackData } from './data/back.db';


const port = 8082;
const url = 'http://localhost:' + port;//不輸入時會根據window.location連線
console.log('connected to ' + port);


type ListeningEvent = 'ALERT' | 'SYNC_BACK_STATE';

type EventNameToEmit =
    'OPEN_FOLDER' | 'SELECT_FOLDER' | 'CLOSE_NW' | 'INITIAL_DATA'|'PLAY_SONG'|'SAVE_SONG_CONFIGS';

class SocketLib {
    constructor() {
        this.socket.on('connect', () => {
            console.log('已連線');
            socketLib.emitEvent('INITIAL_DATA', null, (info: { backData: BackData, backState: any }) => {
                console.log(info)
                allData.backData = info.backData;
                allData.backState = info.backState;
                this.connectionRes();
            });
        });
        this.regiserListeningEvents();
    }
    private socket = io(url);//新版本這邊要io.io，不知道為啥，用回舊的(2.3.0)就ok
    getIsDisconnected() { return this.socket.disconnected }
    connectionRes = () => { };
    connectionProm = new Promise((res) => { this.connectionRes = res });
    emitEvent(eventName: EventNameToEmit, data?: any, onReplied?: Function) {
        if (this.socket.disconnected) alert(`系統未連線，請重新啟動。（異常發生於：${eventName}）`);
        else this.socket.emit(eventName, data, onReplied);
    }
    regiserListeningEvents() {
        interface ListenEventInfo {
            eventName: ListeningEvent;
            onListened: (data: any, reply: Function) => void;
        }

        const eventsToRigister: ListenEventInfo[] = [
            {
                eventName: 'ALERT',
                onListened: function (msg: string, reply: Function) {
                    alert(msg);
                }
            },
            {
                eventName: 'SYNC_BACK_STATE',
                onListened: function (bs: any, reply: Function) {
                    allData.backState = bs;
                }
            },
            // {
            //     eventName: '',
            //     onListened: function (data: any, reply: Function) { }
            // },
        ]

        eventsToRigister.forEach(info => {
            this.socket.on(info.eventName, info.onListened);
        })
    }
}

export let socketLib = new SocketLib();
