"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBs = exports.BackState = void 0;
var main_1 = require("./main");
var BackState = /** @class */ (function () {
    function BackState() {
        this.musDirStructure = {};
    }
    BackState.prototype.refresh = function () {
        this.musDirStructure = main_1.system.musDirStructure;
        return this;
    };
    return BackState;
}());
exports.BackState = BackState;
// private，因為怕別人用的時候忘記refresh，所以一律透過getBs存取
var bs = new BackState();
function getBs() { return bs.refresh(); }
exports.getBs = getBs;
;
