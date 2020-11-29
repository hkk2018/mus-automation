import * as fs from 'fs';

/**
 * 除了openFolder的路徑須以\連接以外，其他一律規定用/。
 * 
 * node fs模組的特性（稍微測試過）：
 * 
 * 1.root dir下的資料夾加不加./都可，例如./logs只要用logs即可。
 * 2.正反dash都抓得到檔案
 */
export let fileSys = {
    checkIsExist(path: string) {
        return fs.existsSync(path);
    },
    makeIfNoDir(dir: string) {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
    },
    appendFile(pathToFileWithExt: string, content: string, isWithLineBreak: boolean = true, encoding = 'utf8') {
        fs.appendFileSync(
            pathToFileWithExt,
            (content + (isWithLineBreak ? '\r\n' : '')),
            encoding
        );
    },
    /**
     * ex: fruit/apple/red.json => fruit/apple
     */
    getDirFromFilePath(pathToFileWithExt: string) {
        let i1 = pathToFileWithExt.lastIndexOf('/');
        let i2 = pathToFileWithExt.lastIndexOf('\\');
        let i = i1 > i2 ? i1 : i2; //取較後面的
        return pathToFileWithExt.slice(0, i); // 
    },
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
    },
    writeAsJson(pathToFileWithExt: string, obj: Object) {
        let dir = fileSys.getDirFromFilePath(pathToFileWithExt);
        fileSys.makeIfNoDir(dir);
        fs.writeFileSync(pathToFileWithExt, JSON.stringify(obj), 'utf8');
    },
    getDirNames(path: string) {
        let arr: string[] = [];
        if (fs.existsSync(path)) arr = fs.readdirSync(path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => path + '\\' + dirent.name)
        // console.log(arr);
        return arr;
    },
    saveFileSync(pathToFileWithExt: string, strToSave: string, encoding: string = 'utf8') {
        let dir = fileSys.getDirFromFilePath(pathToFileWithExt);
        fileSys.makeIfNoDir(dir);
        let desitinationPath = getUniqueName(pathToFileWithExt)
        fs.writeFileSync(desitinationPath, strToSave, encoding);
        return desitinationPath
    },
    readFileSync(pathToFileWithExt: string, encoding: 'utf8' = 'utf8') {
        let data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    },
    readFileSyncWithDefaultStr(pathToFileWithExt: string, defaultStr = '', encoding: 'utf8' = 'utf8') {
        if (!fs.existsSync(pathToFileWithExt)) fileSys.saveFileSync(pathToFileWithExt, defaultStr, encoding);
        let data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    },
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
