
import { system } from "./main";

export class BackState {
    musDirStructure: { [key: string]: null | Object } | undefined = {}
    refresh() {
        this.musDirStructure = system.musDirStructure;
        return this;
    }
}

// private，因為怕別人用的時候忘記refresh，所以一律透過getBs存取
const bs = new BackState();

export function getBs() { return bs.refresh() };