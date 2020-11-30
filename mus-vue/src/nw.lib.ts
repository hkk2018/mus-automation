import { socketLib } from './socket.lib';

declare let nw: any;

class NwLib {
    win: (nw.Window | null) = this.nw ? this.nw.Window.get() : null;
    resToCloseWindow() { }
    constructor(public nw: any) {
        let self = this;
        this.win?.on('close', function () {
            if (socketLib.getIsDisconnected()) self.win?.close(true);
            else socketLib.emitEvent('CLOSE_NW', null, () => {
                self.resToCloseWindow();
            });

            new Promise(res => {
                self.resToCloseWindow = res;
            }).then(() => {
                // this.hide(); // Pretend to be closed already
                // console.log("We're closing...");
                self.win?.close(true); // then close it forcefully
            })
        });
    }
    maximize() { this.win?.maximize(); }
    enterFullScreen() {
        this.win?.enterFullscreen();
    }
    setWinTitle(title: string) {
        // if (this.win) this.win.title = title;
        document.title = title;
    }

}
export let nwLib: NwLib;

// 不然程式直接壞掉
try {
    nwLib = new NwLib(nw);
    nwLib.maximize();
} catch (error) {
    console.log(error)
    nwLib = new NwLib(null);
}


