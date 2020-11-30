import * as fs from 'fs';

const verson = '1.3.0';

/**
 * 除了openFolder的路徑須以\連接以外，其他一律規定用/。
 * 
 * node fs模組的特性（稍微測試過）：
 * 
 * 1.root dir下的資料夾加不加./都可，例如./logs只要用logs即可。
 * 2.正反dash都抓得到檔案
 * 3.雙斜線路徑雖然如實(\\)顯示於console，但實際上是一組的：['C', ':', '\\', 'U', 's', 'e', 'r', 's', '\\', 'h', 'o',]
 */
class FileSys {
    checkIsExist(path: string) {
        return fs.existsSync(path);
    }
    makeIfNoDir(dir: string) {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
    }
    appendFile(pathToFileWithExt: string, content: string, isWithLineBreak: boolean = true, encoding = 'utf8') {
        fs.appendFileSync(
            pathToFileWithExt,
            (content + (isWithLineBreak ? '\r\n' : '')),
            encoding
        );
    }
    /**
     * ex: fruit/apple/red.json => fruit/apple
     */
    getDirFromFilePath(pathToFileWithExt: string) {
        let i1 = pathToFileWithExt.lastIndexOf('/');
        let i2 = pathToFileWithExt.lastIndexOf('\\');
        let i = i1 > i2 ? i1 : i2; //取較後面的
        return pathToFileWithExt.slice(0, i); // 
    }
    /**
     * 有則如實讀入，無則幫創，可以json作為創建內容。
     * @param pathToFileWithExt 
     * @param defaultJson 當無該檔案時以此作為新創檔案之內容
     */
    readAsJson(pathToFileWithExt: string, defaultJson: Object = {}): { [key: string]: any } {
        let dir = fileSys.getDirFromFilePath(pathToFileWithExt);
        fileSys.makeIfNoDir(dir);
        // 無則幫創
        if (!fs.existsSync(pathToFileWithExt)) fileSys.writeAsJson(pathToFileWithExt, defaultJson);
        let data = fs.readFileSync(pathToFileWithExt, 'utf8');
        return JSON.parse(data);
    }
    writeAsJson(pathToFileWithExt: string, obj: Object) {
        let dir = fileSys.getDirFromFilePath(pathToFileWithExt);
        fileSys.makeIfNoDir(dir);
        fs.writeFileSync(pathToFileWithExt, JSON.stringify(obj), 'utf8');
    }
    getDirNames(path: string, isFullPath = true) {
        return getDirEntries(path, 'directory', isFullPath);
    }
    getFileNames(path: string, isFullPath = true) {
        return getDirEntries(path, 'file', isFullPath);
    }
    saveFileSync(pathToFileWithExt: string, strToSave: string, encoding: string = 'utf8') {
        let dir = fileSys.getDirFromFilePath(pathToFileWithExt);
        fileSys.makeIfNoDir(dir);
        let desitinationPath = getUniqueName(pathToFileWithExt)
        fs.writeFileSync(desitinationPath, strToSave, encoding);
        return desitinationPath
    }
    readFileSync(pathToFileWithExt: string, encoding: 'utf8' = 'utf8') {
        let data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    }
    readFileSyncWithDefaultStr(pathToFileWithExt: string, defaultStr = '', encoding: 'utf8' = 'utf8') {
        if (!fs.existsSync(pathToFileWithExt)) fileSys.saveFileSync(pathToFileWithExt, defaultStr, encoding);
        let data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    }
    /**
     * 得出檔案-資料夾巢狀結構，如下：
     * {
     *  dir1:{
     *          dir1-1:{}      
     *       },
     *  file1:null
     * }
     */
    digIntoTree(rootFolderPath: string) {
        if (checkIfOffFormatPath(rootFolderPath)) return;
        let treeObj: DirEntry = {};

        this.getFileNames(rootFolderPath, false)?.forEach(fileName => treeObj[fileName] = null);
        this.getDirNames(rootFolderPath, false)?.forEach(dirName => treeObj[dirName] = this.digIntoTree(rootFolderPath + '\\' + dirName) || {});;

        return treeObj
    }
}

export let fileSys = new FileSys();

function checkIfOffFormatPath(path: string): string {
    let errStr = '';
    if (path.endsWith('\\')) {
        errStr = '結尾不應有\\，否則會造成isFullPath選項異常';
    }
    if (errStr) console.error(errStr);
    return errStr;

}

function getDirEntries(path: string, type: 'file' | 'directory', isFullPath = true): undefined | string[] {
    if (checkIfOffFormatPath(path)) return;

    let direntMethodName: 'isDirectory' | 'isFile';

    if (type === 'file') direntMethodName = 'isFile';
    else direntMethodName = 'isDirectory';

    let arr: string[] = [];

    // 如果無該路徑readdirSync會導致程式直接結束
    if (fs.existsSync(path)) {
        // readdirSync之path結尾有無 \\皆可，但
        arr =
            fs.readdirSync(path, { withFileTypes: true })
                .filter(dirent => dirent[direntMethodName]())
                .map(dirent => (isFullPath ? (path + '\\') : '') + dirent.name);
        return arr;
    }
    else {
        //無該路徑會回傳undefined
    }
}

function getUniqueName(pathToSave: string): string {
    if (fs.existsSync(pathToSave)) {
        let extPointIndex = pathToSave.lastIndexOf('.');
        let nameWithoutExt = pathToSave.slice(0, extPointIndex);
        let extWithPoint = pathToSave.slice(extPointIndex);

        // extension以前的部分
        let lastUnderLineIndex = nameWithoutExt.lastIndexOf('_');
        let firstPartInName = nameWithoutExt.slice(0, lastUnderLineIndex); //不含_
        let lastPartInName = nameWithoutExt.slice(lastUnderLineIndex); // _XXXX
        // console.log(extPointIndex, nameWithoutExt, extWithPoint, lastPartInName)
        // 找到_X*n n>=1的情況
        if (lastPartInName.length > 1) {
            let charsAfter_ = lastPartInName.slice(1);
            let numerizedLastChar = Number(charsAfter_);
            if (!isNaN(numerizedLastChar)) return getUniqueName(firstPartInName + '_' + (numerizedLastChar + 1) + extWithPoint);
            else return getUniqueName(nameWithoutExt + '_1' + extWithPoint);//無法辨識索引 創新索引
        }
        // 找不到_所以取到第一個字母  以及  _在最後的情況
        else return getUniqueName(nameWithoutExt + '_1' + extWithPoint);//無法辨識索引 創新索引
    }
    else return pathToSave;
}


// console.log(fileSys.digIntoTree("C:\\Users\\hongk\\Desktop\\after-tete"))

/**
 * key為檔名則值為null，否則會是物件
 */
export interface DirEntry { [key: string]: null | DirEntry }



/**
 * 1.3.0：增加DirEntry介面
 * 1.2.0：增加digIntoTree，統一path check於checkIfOffFormatPath
 * 1.1.0：增加getFileNames,getDirNames增optional bool isFullPath
 * 1.0.0：初始版
 */
const changeLog = '';

// setInterval(() => { }, 20)