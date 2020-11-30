"use strict";
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
exports.fileSys = void 0;
var fs = __importStar(require("fs"));
var verson = '1.3.0';
/**
 * 除了openFolder的路徑須以\連接以外，其他一律規定用/。
 *
 * node fs模組的特性（稍微測試過）：
 *
 * 1.root dir下的資料夾加不加./都可，例如./logs只要用logs即可。
 * 2.正反dash都抓得到檔案
 * 3.雙斜線路徑雖然如實(\\)顯示於console，但實際上是一組的：['C', ':', '\\', 'U', 's', 'e', 'r', 's', '\\', 'h', 'o',]
 */
var FileSys = /** @class */ (function () {
    function FileSys() {
    }
    FileSys.prototype.checkIsExist = function (path) {
        return fs.existsSync(path);
    };
    FileSys.prototype.makeIfNoDir = function (dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    };
    FileSys.prototype.appendFile = function (pathToFileWithExt, content, isWithLineBreak, encoding) {
        if (isWithLineBreak === void 0) { isWithLineBreak = true; }
        if (encoding === void 0) { encoding = 'utf8'; }
        fs.appendFileSync(pathToFileWithExt, (content + (isWithLineBreak ? '\r\n' : '')), encoding);
    };
    /**
     * ex: fruit/apple/red.json => fruit/apple
     */
    FileSys.prototype.getDirFromFilePath = function (pathToFileWithExt) {
        var i1 = pathToFileWithExt.lastIndexOf('/');
        var i2 = pathToFileWithExt.lastIndexOf('\\');
        var i = i1 > i2 ? i1 : i2; //取較後面的
        return pathToFileWithExt.slice(0, i); // 
    };
    /**
     * 有則如實讀入，無則幫創，可以json作為創建內容。
     * @param pathToFileWithExt
     * @param defaultJson 當無該檔案時以此作為新創檔案之內容
     */
    FileSys.prototype.readAsJson = function (pathToFileWithExt, defaultJson) {
        if (defaultJson === void 0) { defaultJson = {}; }
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        // 無則幫創
        if (!fs.existsSync(pathToFileWithExt))
            exports.fileSys.writeAsJson(pathToFileWithExt, defaultJson);
        var data = fs.readFileSync(pathToFileWithExt, 'utf8');
        return JSON.parse(data);
    };
    FileSys.prototype.writeAsJson = function (pathToFileWithExt, obj) {
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        fs.writeFileSync(pathToFileWithExt, JSON.stringify(obj), 'utf8');
    };
    FileSys.prototype.getDirNames = function (path, isFullPath) {
        if (isFullPath === void 0) { isFullPath = true; }
        return getDirEntries(path, 'directory', isFullPath);
    };
    FileSys.prototype.getFileNames = function (path, isFullPath) {
        if (isFullPath === void 0) { isFullPath = true; }
        return getDirEntries(path, 'file', isFullPath);
    };
    FileSys.prototype.saveFileSync = function (pathToFileWithExt, strToSave, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        var desitinationPath = getUniqueName(pathToFileWithExt);
        fs.writeFileSync(desitinationPath, strToSave, encoding);
        return desitinationPath;
    };
    FileSys.prototype.readFileSync = function (pathToFileWithExt, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    };
    FileSys.prototype.readFileSyncWithDefaultStr = function (pathToFileWithExt, defaultStr, encoding) {
        if (defaultStr === void 0) { defaultStr = ''; }
        if (encoding === void 0) { encoding = 'utf8'; }
        if (!fs.existsSync(pathToFileWithExt))
            exports.fileSys.saveFileSync(pathToFileWithExt, defaultStr, encoding);
        var data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    };
    /**
     * 得出檔案-資料夾巢狀結構，如下：
     * {
     *  dir1:{
     *          dir1-1:{}
     *       },
     *  file1:null
     * }
     */
    FileSys.prototype.digIntoTree = function (rootFolderPath) {
        var _this = this;
        var _a, _b;
        if (checkIfOffFormatPath(rootFolderPath))
            return;
        var treeObj = {};
        (_a = this.getFileNames(rootFolderPath, false)) === null || _a === void 0 ? void 0 : _a.forEach(function (fileName) { return treeObj[fileName] = null; });
        (_b = this.getDirNames(rootFolderPath, false)) === null || _b === void 0 ? void 0 : _b.forEach(function (dirName) { return treeObj[dirName] = _this.digIntoTree(rootFolderPath + '\\' + dirName) || {}; });
        ;
        return treeObj;
    };
    return FileSys;
}());
exports.fileSys = new FileSys();
function checkIfOffFormatPath(path) {
    var errStr = '';
    if (path.endsWith('\\')) {
        errStr = '結尾不應有\\，否則會造成isFullPath選項異常';
    }
    if (errStr)
        console.error(errStr);
    return errStr;
}
function getDirEntries(path, type, isFullPath) {
    if (isFullPath === void 0) { isFullPath = true; }
    if (checkIfOffFormatPath(path))
        return;
    var direntMethodName;
    if (type === 'file')
        direntMethodName = 'isFile';
    else
        direntMethodName = 'isDirectory';
    var arr = [];
    // 如果無該路徑readdirSync會導致程式直接結束
    if (fs.existsSync(path)) {
        // readdirSync之path結尾有無 \\皆可，但
        arr =
            fs.readdirSync(path, { withFileTypes: true })
                .filter(function (dirent) { return dirent[direntMethodName](); })
                .map(function (dirent) { return (isFullPath ? (path + '\\') : '') + dirent.name; });
        return arr;
    }
    else {
        //無該路徑會回傳undefined
    }
}
function getUniqueName(pathToSave) {
    if (fs.existsSync(pathToSave)) {
        var extPointIndex = pathToSave.lastIndexOf('.');
        var nameWithoutExt = pathToSave.slice(0, extPointIndex);
        var extWithPoint = pathToSave.slice(extPointIndex);
        // extension以前的部分
        var lastUnderLineIndex = nameWithoutExt.lastIndexOf('_');
        var firstPartInName = nameWithoutExt.slice(0, lastUnderLineIndex); //不含_
        var lastPartInName = nameWithoutExt.slice(lastUnderLineIndex); // _XXXX
        // console.log(extPointIndex, nameWithoutExt, extWithPoint, lastPartInName)
        // 找到_X*n n>=1的情況
        if (lastPartInName.length > 1) {
            var charsAfter_ = lastPartInName.slice(1);
            var numerizedLastChar = Number(charsAfter_);
            if (!isNaN(numerizedLastChar))
                return getUniqueName(firstPartInName + '_' + (numerizedLastChar + 1) + extWithPoint);
            else
                return getUniqueName(nameWithoutExt + '_1' + extWithPoint); //無法辨識索引 創新索引
        }
        // 找不到_所以取到第一個字母  以及  _在最後的情況
        else
            return getUniqueName(nameWithoutExt + '_1' + extWithPoint); //無法辨識索引 創新索引
    }
    else
        return pathToSave;
}
/**
 * 1.3.0：增加DirEntry介面
 * 1.2.0：增加digIntoTree，統一path check於checkIfOffFormatPath
 * 1.1.0：增加getFileNames,getDirNames增optional bool isFullPath
 * 1.0.0：初始版
 */
var changeLog = '';
// setInterval(() => { }, 20)
