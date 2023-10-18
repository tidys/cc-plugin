import { Adaptation } from ".";

export class Base {
    protected adaptation: Adaptation;
    constructor(adaptation: Adaptation) {
        this.adaptation = adaptation;
    }
}