"use strict";
//general library
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainService = void 0;
var child_process = __importStar(require("child_process"));
var cms_lib_1 = require("./cms.lib");
cms_lib_1.cmsLib;
var PsOption = /** @class */ (function () {
    function PsOption(onDataMsgTransformer, isShowDataOnReceiving) {
        if (onDataMsgTransformer === void 0) { onDataMsgTransformer = function (str) { return str; }; }
        if (isShowDataOnReceiving === void 0) { isShowDataOnReceiving = true; }
        this.onDataMsgTransformer = onDataMsgTransformer;
        this.isShowDataOnReceiving = isShowDataOnReceiving;
    }
    return PsOption;
}());
exports.mainService = {
    logWithColor: function (msg) {
        console.log('\x1b[33m%s\x1b[0m', msg); //yellow
    },
    execFile: function (path, paramsToPass, isShowErrLog, isShowExecLog) {
        if (paramsToPass === void 0) { paramsToPass = []; }
        if (isShowErrLog === void 0) { isShowErrLog = true; }
        if (isShowExecLog === void 0) { isShowExecLog = true; }
        return new Promise(function (res, rej) {
            // let child=child_process.exec(`powershell.exe`+psScript);
            var toEexcMsg = 'exec: ' + path + (paramsToPass.length === 0 ? '' : "(param:" + paramsToPass.join(',') + ")");
            if (isShowExecLog) {
                console.log(toEexcMsg);
                cms_lib_1.cmsLib.sendDataLog(toEexcMsg);
            }
            var child = child_process.execFile(path, paramsToPass, function (err, data) {
                if (err === null) {
                    if (isShowExecLog) {
                        var succMsg = 'success to exec ' + path;
                        cms_lib_1.cmsLib.sendDataLog(succMsg);
                    }
                    res(data.toString());
                }
                else {
                    console.log(err);
                    if (isShowErrLog)
                        cms_lib_1.cmsLib.sendDataLog(err.message);
                    rej(err.message);
                }
                // console.log(data.toString());
            });
        });
    },
    getDateString: function (d, isCompoentId) {
        if (isCompoentId === void 0) { isCompoentId = true; }
        var pad = function (v) {
            return (v < 10) ? ('0' + v) : v.toString();
        };
        var year = pad(d.getFullYear());
        var month = pad(d.getMonth() + 1);
        var day = pad(d.getDate());
        var hour = pad(d.getHours());
        var min = pad(d.getMinutes());
        var sec = pad(d.getSeconds());
        return isCompoentId ? (year + month + day + hour + min + sec) :
            (year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec);
        //YYYY-MM-DD hh:mm:ss
        //return year+"-"+month+"-"day+" "+hour+":"+min+":"+sec
    },
    hex2bin: function (hex) {
        var bin = (parseInt(hex, 16)).toString(2);
        bin = '0'.repeat((16 - bin.length)) + bin;
        return bin;
    },
    /**
     * 路徑輸入特殊
     * @param filePath 1.不可具./ 2.路徑須以\連接
     */
    openFile: function (filePath) {
        child_process.exec("start \"\" \"" + filePath + "\"");
    },
    /**
     * 路徑輸入特殊
     * @param folderPathNoPrefix 1.不可具./ 2.路徑須以\連接
     */
    openFolder: function (folderPathNoPrefix) {
        if (folderPathNoPrefix.includes(folderPathNoPrefix))
            console.log('所開啟資料夾位址不可含有./');
        child_process.exec("start \"\" \"" + folderPathNoPrefix + "\"");
    },
    /**
     * https://stackoverflow.com/questions/51655571/how-to-open-a-select-folder-dialog-from-nodejs-server-side-not-browser
     * https://stackoverflow.com/questions/36769822/browseforfolder-dialog-center-and-make-topmost
     * https://stackoverflow.com/questions/54037292/folderbrowserdialog-bring-to-front
     * https://stackoverflow.com/questions/39421074/setting-focus-to-a-windows-application-from-node-js
     */
    selectFolderP: function () {
        var psScript = "\nFunction Select-FolderDialog {\n    param([string]$Description = \"Select Folder\", [string]$RootFolder = \"Desktop\")\n        \n    [System.Reflection.Assembly]::LoadWithPartialName(\"System.windows.forms\") | Out-Null     \n        \n    $folderSelector = New-Object System.Windows.Forms.FolderBrowserDialog\n    $folderSelector.Description = \"\u8ACB\u9078\u64C7\u8CC7\u6599\u593E\"\n    $folderPath = \"\"\n            \n    $handle = Get-Process | Where-Object { ($_.MainWindowTitle.Contains( \"RoboArm\")) -and ($_.ProcessName -eq \"nw\") }  | Select-Object -ExpandProperty  MainWindowHandle  \n            \n    $Assemblies = (\n        \"System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089\"\n    )\n\n    $classDef = @\"\nusing System;\npublic class WindowWrapper : System.Windows.Forms.IWin32Window\n{\n    public WindowWrapper(IntPtr handle)\n    {\n        _hwnd = handle;\n    }\n\n    public IntPtr Handle\n    {\n        get { return _hwnd; }\n    }\n\n    private IntPtr _hwnd;\n}\n\"@\n\n    Add-Type -TypeDefinition $classDef -ReferencedAssemblies $Assemblies\n\n    $window = [WindowWrapper]::new($handle)\n        \n    if ($folderSelector.ShowDialog($window) -eq \"OK\") {\n        $folderPath += $folderSelector.SelectedPath\n    }\n    return $folderPath\n}\n        \n$folder = Select-FolderDialog\n$folder";
        // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
        // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows
        // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue
        // let child=child_process.exec(`powershell.exe`+psScript);
        return exports.mainService.execPowerShellScript(psScript, 'choosing folder').then(function (datas) { return datas[0]; });
    },
    /**
     * 取消則回傳空字串''
     * @param isChooseRecipe
     */
    selectFileP: function (isChooseRecipe) {
        if (isChooseRecipe === void 0) { isChooseRecipe = true; }
        var psScript = "\n# https://devblogs.microsoft.com/scripting/hey-scripting-guy-can-i-open-a-file-dialog-box-with-windows-powershell/\n[System.Reflection.Assembly]::LoadWithPartialName(\u201CSystem.windows.forms\u201D) |\nOut-Null\n\n$handle = Get-Process | Where-Object { ($_.MainWindowTitle.Contains( \"RoboArm\")) -and ($_.ProcessName -eq \"nw\") }  | Select-Object -ExpandProperty  MainWindowHandle  \n\nIF($handle -eq $null){\n    $handle = Get-Process | Where-Object { $_.MainWindowTitle -and ($_.ProcessName -eq \"chrome\") }  | Select-Object -ExpandProperty  MainWindowHandle  \n}\n\n$Assemblies = (\n    \"System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089\"\n)\n\n$classDef = @\"\nusing System;\npublic class WindowWrapper : System.Windows.Forms.IWin32Window\n{\npublic WindowWrapper(IntPtr handle)\n{\n    _hwnd = handle;\n}\n\npublic IntPtr Handle\n{\n    get { return _hwnd; }\n}\n\nprivate IntPtr _hwnd;\n}\n\"@\n\nAdd-Type -TypeDefinition $classDef -ReferencedAssemblies $Assemblies\n\n$window = [WindowWrapper]::new($handle)\n\n$OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog\n$OpenFileDialog.initialDirectory = 'Desktop'\n" + (isChooseRecipe ? '' : '# ') + "$OpenFileDialog.filter = \"NMP files (*.nmp)|*.nmp\"\n$OpenFileDialog.ShowDialog($window) | Out-Null\n$OpenFileDialog.filename";
        return exports.mainService.execPowerShellScript(psScript, 'choosing file').then(function (datas) { return datas[0]; });
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
    filterDataFromPs: function (data) {
        var isShowInfoInConsole = false;
        if (isShowInfoInConsole)
            console.log(data); //Buffer
        if (isShowInfoInConsole)
            console.log(data.constructor.name); //Buffer
        var dataStr = data.toString(); //不然原本是物件
        if (isShowInfoInConsole)
            console.log(dataStr.length); //3
        dataStr = dataStr.replace('\n', ''); //實測是取消時會含有1個\n，不過多寫一行檔一下
        if (isShowInfoInConsole)
            console.log(dataStr.length); //2
        dataStr = dataStr.replace(String.fromCharCode(13), '');
        if (isShowInfoInConsole)
            console.log(dataStr.length); //1
        return dataStr;
    },
    execPowerShellScript: function (psScript, taskName, psOpt) {
        if (taskName === void 0) { taskName = 'powershell script'; }
        if (psOpt === void 0) { psOpt = new PsOption(); }
        return new Promise(function (res, rej) {
            var child = child_process.spawn("powershell.exe", [psScript]);
            var datas = [];
            child.stdout.on("data", function (data) {
                var dataStr = exports.mainService.filterDataFromPs(data);
                datas.push(dataStr);
                var msg = psOpt.onDataMsgTransformer(dataStr);
                if (psOpt.isShowDataOnReceiving) {
                    console.log(msg);
                    cms_lib_1.cmsLib.sendDataLog(msg);
                }
            });
            // child.stderr.setEncoding('binary')
            child.stderr.on("data", function (data) {
                // console.log(data.constructor)
                // console.log(data instanceof Buffer)
                // console.log('starts here');
                // console.log(data)
                var dataStr = data.toString();
                var errMsg = "err in ps task " + taskName + ": " + dataStr;
                // cmsLib.sendAlarmLog(errMsg);
                rej(dataStr);
            });
            child.on("exit", function () {
                var endMsg = "ps task " + taskName + " finished";
                console.log(endMsg);
                cms_lib_1.cmsLib.sendDataLog(endMsg);
                res(datas);
            });
            child.stdin.end(); //end input
        });
        // psScript = psScript.replace(/(?:\r\n|\r|\n)/g, ' '); //用exec時line-break好像會導致問題(不確定因為搞不出來)，用spawn又不能去空行
        // cmd /c chcp 65001>nul &&  //https://stackoverflow.com/questions/20731785/wrong-encoding-when-using-child-process-spawn-or-exec-under-windows
        // https://stackoverflow.com/questions/14549750/powershell-windows-form-browes-dialogue
        // let child=child_process.exec(`powershell.exe`+psScript);
    },
    closeProcessByPidP: function (pid) {
        var psScript = "Get-Process | Where-Object { $_.Id -eq \"" + pid + "\" } | Stop-Process";
        return exports.mainService.execPowerShellScript(psScript, 'closing process by pid');
    },
    hideWindow: function (pid) {
        // 藏起來以後要找的話
        // Get-Process | Where-Object{$_.ProcessName -eq "node"} | Stop-Process
        console.log(pid);
        var psScript = "\n$host.ui.RawUI.WindowTitle = \"window-to-hide\"\n$setPOS = @'\n[DllImport(\"user32.dll\")]\npublic static extern bool SetWindowPos(IntPtr hWnd, \nIntPtr hWndInsertAfter, \nint X, \nint Y, \nint cx, \nint cy, \nuint uFlags);\n'@\n$handle=Get-Process | Where-Object { ($_.MainWindowTitle -and  $_.MainWindowTitle -eq \"window-to-hide\") } | Select-Object -ExpandProperty  MainWindowHandle\n$SetWindowPos = Add-Type -MemberDefinition $setPOS -name WinApiCall -passthru\n$SetWindowPos::SetWindowPos($handle,1,0,0,0,0,0x0080) | Out-Null";
        return exports.mainService.execPowerShellScript(psScript, 'hide window').then(function (datas) {
            return;
        });
    },
    // checkIfWinExistP(winTitle: string) {
    //     return mainService.execFile(`${setting.exeFolderPath}check-win-exist`, [winTitle], true, false).then(isExist => {
    //         return Boolean(Number(isExist as '0' | '1'));
    //     })
    // },
    // activateWin(winTitle: string) {
    //     return mainService.execFile(`${setting.exeFolderPath}win-active`, [winTitle], true, false);
    // },
    openSoftwares: function (absPathes, windowTitleNameToActive, isMinimized) {
        if (windowTitleNameToActive === void 0) { windowTitleNameToActive = ''; }
        if (isMinimized === void 0) { isMinimized = false; }
        absPathes = absPathes.filter(function (x) { return x !== ''; }); //前端沒濾掉最後一個的話會有空字串，會導致後面錯誤
        if (absPathes.length === 0)
            return;
        absPathes.forEach(function (path) { exports.mainService.openSoftware(path, windowTitleNameToActive, isMinimized); });
    },
    openSoftware: function (path, windowTitleNameToActive, isMinimized) {
        if (windowTitleNameToActive === void 0) { windowTitleNameToActive = ''; }
        if (isMinimized === void 0) { isMinimized = false; }
        var psScript = "Start-Process \"" + path + "\" " + (isMinimized ? '-WindowStyle Minimized' : '');
        if (windowTitleNameToActive !== '')
            psScript += "\n$wshell = New-Object -ComObject wscript.shell\n$wshell.AppActivate(\"" + windowTitleNameToActive + "\")";
        return exports.mainService.execPowerShellScript(psScript, 'opening software');
    },
};
