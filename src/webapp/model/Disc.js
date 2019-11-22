
export default class Disc {

    constructor({id, title = '', discNumber = 0, ean = ''}) {
        Object.assign(this, {id, title, discNumber, ean});
    }

    isNew() {
        return !this.id;
    }

    toJson() {
        const {id, title, discNumber, ean} = this;
        return {id, title, discNumber, ean};
    }

    /** @override */
    toString() {
        return Disc[`"${this.title}"`];
    }
}
