//general library

import * as child_process from 'child_process';
import { cmsLib } from './cms.lib';
cmsLib
class PsOption {
    constructor(
        public onDataMsgTransformer = (str: string) => str,
        public isShowDataOnReceiving = true,
    ) { }
}

export let mainService = {
    logWithColor(msg: string) {
        console.log('\x1b[33m%s\x1b[0m', msg);  //yellow
    },
    execFile(path: string, paramsToPass: string[] = [], isShowErrLog = true, isShowExecLog = true): Promise<string> {
        return new Promise((res, rej) => {
            // let child=child_process.exec(`powershell.exe`+psScript);
            const toEexcMsg = 'exec: ' + path + (paramsToPass.length === 0 ? '' : `(param:${paramsToPass.join(',')})`);

            if (isShowExecLog) {
                console.log(toEexcMsg);
                cmsLib.sendDataLog(toEexcMsg);
            }
            let child = child_process.execFile(path, paramsToPass, function (err, data) {
                if (err === null) {
                    if (isShowExecLog) {
                        const succMsg = 'success to exec ' + path;
                        cmsLib.sendDataLog(succMsg);
                    }
                    res(data.toString());
                }
                else {
                    console.log(err);
                    if (isShowErrLog) cmsLib.sendDataLog(err.message);
                    rej(err.message);
                }
                // console.log(data.toString());
            });
        })
    },
    getDateString(d: Date, isCompoentId = true) {
        const pad = (v: number) => {
            return (v < 10) ? ('0' + v) : v.toString()
        }
        let year = pad(d.getFullYear());
        let month = pad(d.getMonth() + 1)
        let day = pad(d.getDate())
        let hour = pad(d.getHours())
        let min = pad(d.getMinutes())
        let sec = pad(d.getSeconds())
        return isCompoentId ? (year + month + day + hour + min + sec) :
            (year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec);

        //YYYY-MM-DD hh:mm:ss
        //return year+"-"+month+"-"day+" "+hour+":"+min+":"+sec

    },
    hex2bin(hex: string) {
        let bin = (parseInt(hex, 16)).toString(2);
        bin = '0'.repeat((16 - bin.length)) + bin;
        return bin;
    },
    /**
     * 路徑輸入特殊
     * @param filePath 1.不可具./ 2.路徑須以\連接
     */
    openFile(filePath: string) {
        child_process.exec(`start "" "${filePath}"`);
    },
    /**
     * 路徑輸入特殊
     * @param folderPathNoPrefix 1.不可具./ 2.路徑須以\連接
     */
    openFolder(folderPathNoPrefix: string) {
        if (folderPathNoPrefix.includes(folderPathNoPrefix)) console.log('所開啟資料夾位址不可含有./');
        child_process.exec(`start "" "${folderPathNoPrefix}"`);
    },
    /**
     * https://stackoverflow.com/questions/51655571/how-to-open-a-select-folder-dialog-from-nodejs-server-side-not-browser
     * https://stackoverflow.com/questions/36769822/browseforfolder-dialog-center-and-make-topmost
     * https://stackoverflow.com/questions/54037292/folderbrowserdialog-bring-to-front
     * https://stackoverflow.com/questions/39421074/setting-focus-to-a-windows-application-from-node-js
     */
    selectFolderP(): Promise<string> {
        let psScript = `
Function Select-FolderDialog {
    param([string]$Description = "Select Folder", [string]$RootFolder = "Desktop")
        
    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null     
        
    $folderSelector = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderSelector.Description = "請選擇資料夾"
    $folderPath = ""
            
    $handle = Get-Process | Where-Object { ($_.MainWindowTitle.Contains( "RoboArm")) -and ($_.ProcessName -eq "nw") }  | Select-Object -ExpandProperty  MainWindowHandle  
            
    $Assemblies = (
        "System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
    )

    $classDef = @"
using System;
public class WindowWrapper : System.Windows.Forms.IWin32Window
{
    public WindowWrapper(IntPtr handle)
    {
        _hwnd = handle;
    }

    public IntPtr Handle
    {
        get { return _hwnd; }
    }

    private IntPtr _hwnd;
}
"@

    Add-Type -TypeDefinition $classDef -ReferencedAssemblies $Assemblies

    $window = [WindowWrapper]::new($handle)
        
    if ($folderSelector.ShowDialog($window) -eq "OK") {
        $folderPath += $folderSelector.SelectedPath
    }
    return $folderPath
}
        
$folder = Select-FolderDialog
$folder`;
        // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
        // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows

        // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue

        // let child=child_process.exec(`powershell.exe`+psScript);


        return mainService.execPowerShellScript(psScript, 'choosing folder').then(datas => datas[0])
    },
    /**
     * 取消則回傳空字串''
     * @param isChooseRecipe 
     */
    selectFileP(isChooseRecipe: boolean = true): Promise<string> {

        let psScript = `
# https://devblogs.microsoft.com/scripting/hey-scripting-guy-can-i-open-a-file-dialog-box-with-windows-powershell/
[System.Reflection.Assembly]::LoadWithPartialName(“System.windows.forms”) |
Out-Null

$handle = Get-Process | Where-Object { ($_.MainWindowTitle.Contains( "RoboArm")) -and ($_.ProcessName -eq "nw") }  | Select-Object -ExpandProperty  MainWindowHandle  

IF($handle -eq $null){
    $handle = Get-Process | Where-Object { $_.MainWindowTitle -and ($_.ProcessName -eq "chrome") }  | Select-Object -ExpandProperty  MainWindowHandle  
}

$Assemblies = (
    "System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
)

$classDef = @"
using System;
public class WindowWrapper : System.Windows.Forms.IWin32Window
{
public WindowWrapper(IntPtr handle)
{
    _hwnd = handle;
}

public IntPtr Handle
{
    get { return _hwnd; }
}

private IntPtr _hwnd;
}
"@

Add-Type -TypeDefinition $classDef -ReferencedAssemblies $Assemblies

$window = [WindowWrapper]::new($handle)

$OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog
$OpenFileDialog.initialDirectory = 'Desktop'
${isChooseRecipe ? '' : '# '}$OpenFileDialog.filter = "NMP files (*.nmp)|*.nmp"
$OpenFileDialog.ShowDialog($window) | Out-Null
$OpenFileDialog.filename`;
        return mainService.execPowerShellScript(psScript, 'choosing file').then(datas => datas[0])
    },
    /*
        setNwAsTopmost() {
            const psScript = `
    $handle = Get-Process | Where-Object { ($_.MainWindowTitle.Contains( "RoboArm")) -and ($_.ProcessName -eq "nw") }  | Select-Object -ExpandProperty  MainWindowHandle  
    
    $setPOS = @'
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, 
    IntPtr hWndInsertAfter, 
    int X, 
    int Y, 
    int cx, 
    int cy, 
    uint uFlags);
    '@
    
    $SetWindowPos = Add-Type -MemberDefinition $setPOS -name WinApiCall -passthru
    $SetWindowPos::SetWindowPos($handle,-1,0,0,0,0,3) | Out-Null`;
            let child = child_process.spawn(`powershell.exe`, [psScript]);
            child.stdout.on("data", function (data) {
                // console.log(typeof(data));
                data = data + '';//不然原本是物件
                data = data.replace('\n', ''); //實測是取消時會含有1個\n，不過多寫一行檔一下
                data = data.replace('\r\n', '');
                console.log(data);
            });
            child.stderr.on("data", function (data) {
                //this script block will get the output of the PS script
                console.log("Powershell Errors: " + data);
            });
            child.on("exit", function () {
                console.log("Powershell Script finished");
            });
            child.stdin.end(); //end input
        },*/
    // 即直接從on接收到的資料
    filterDataFromPs(data: Buffer) {
        const isShowInfoInConsole = false;
        if (isShowInfoInConsole) console.log(data);//Buffer
        if (isShowInfoInConsole) console.log(data.constructor.name);//Buffer
        let dataStr = data.toString(); //不然原本是物件
        if (isShowInfoInConsole) console.log(dataStr.length);//3
        dataStr = dataStr.replace('\n', ''); //實測是取消時會含有1個\n，不過多寫一行檔一下
        if (isShowInfoInConsole) console.log(dataStr.length);//2
        dataStr = dataStr.replace(String.fromCharCode(13), '');
        if (isShowInfoInConsole) console.log(dataStr.length);//1
        return dataStr
    },
    execPowerShellScript(psScript: string, taskName: string = 'powershell script', psOpt: PsOption = new PsOption()): Promise<string[]> {
        return new Promise((res, rej) => {

            let child = child_process.spawn(`powershell.exe`, [psScript],);
            let datas: string[] = [];
            child.stdout.on("data", function (data: Buffer) {
                let dataStr = mainService.filterDataFromPs(data);
                datas.push(dataStr);
                let msg = psOpt.onDataMsgTransformer(dataStr);
                if (psOpt.isShowDataOnReceiving) {
                    console.log(msg);
                    cmsLib.sendDataLog(msg);
                }
            });
            // child.stderr.setEncoding('binary')
            child.stderr.on("data", function (data: Buffer) {
                // console.log(data.constructor)
                // console.log(data instanceof Buffer)
                // console.log('starts here');
                // console.log(data)
                let dataStr = data.toString();
                const errMsg = `err in ps task ${taskName}: ` + dataStr;
                // cmsLib.sendAlarmLog(errMsg);

                rej(dataStr)
            });
            child.on("exit", function () {
                const endMsg = `ps task ${taskName} finished`;
                console.log(endMsg);
                cmsLib.sendDataLog(endMsg);
                res(datas);
            });
            child.stdin.end(); //end input
        })
        // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
        // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows

        // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue

        // let child=child_process.exec(`powershell.exe`+psScript);
    },
    closeProcessByPidP(pid: string) {
        let psScript = `Get-Process | Where-Object { $_.Id -eq "${pid}" } | Stop-Process`;
        return mainService.execPowerShellScript(psScript, 'closing process by pid')
    },
    hideWindow(pid: number): Promise<void> {
        // 藏起來以後要找的話
        // Get-Process | Where-Object{$_.ProcessName -eq "node"} | Stop-Process
        console.log(pid)
        let psScript = `
$host.ui.RawUI.WindowTitle = "window-to-hide"
$setPOS = @'
[DllImport("user32.dll")]
public static extern bool SetWindowPos(IntPtr hWnd, 
IntPtr hWndInsertAfter, 
int X, 
int Y, 
int cx, 
int cy, 
uint uFlags);
'@
$handle=Get-Process | Where-Object { ($_.MainWindowTitle -and  $_.MainWindowTitle -eq "window-to-hide") } | Select-Object -ExpandProperty  MainWindowHandle
$SetWindowPos = Add-Type -MemberDefinition $setPOS -name WinApiCall -passthru
$SetWindowPos::SetWindowPos($handle,1,0,0,0,0,0x0080) | Out-Null`;
        return mainService.execPowerShellScript(psScript, 'hide window').then(datas => {
            return
        })
    },
    // checkIfWinExistP(winTitle: string) {
    //     return mainService.execFile(`${setting.exeFolderPath}check-win-exist`, [winTitle], true, false).then(isExist => {
    //         return Boolean(Number(isExist as '0' | '1'));
    //     })
    // },
    // activateWin(winTitle: string) {
    //     return mainService.execFile(`${setting.exeFolderPath}win-active`, [winTitle], true, false);
    // },
    openSoftwares(absPathes: string[], windowTitleNameToActive: string = '', isMinimized = false) {
        absPathes = absPathes.filter(x => x !== '');//前端沒濾掉最後一個的話會有空字串，會導致後面錯誤
        if (absPathes.length === 0) return;
        absPathes.forEach(path => { mainService.openSoftware(path, windowTitleNameToActive, isMinimized) })
    },
    openSoftware(path: string, windowTitleNameToActive: string = '', isMinimized = false) {
        let psScript = `Start-Process "${path}" ${isMinimized ? '-WindowStyle Minimized' : ''}`;

        if (windowTitleNameToActive !== '') psScript += `
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate("${windowTitleNameToActive}")`;

        return mainService.execPowerShellScript(psScript, 'opening software');
    },
}

