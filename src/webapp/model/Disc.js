
export default class Disc {

    constructor({id, title = '', discNumber = 0, ean = ''}) {
        Object.assign(this, {id, title, discNumber, ean});
    }

    /** @override */
    toString() {
        return Disc[`"${this.title}"`];
    }
}
