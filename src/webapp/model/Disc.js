
const _lastCoverChangeById = {};

export default class Disc {

    markCoverChanged() {
        _lastCoverChangeById[this.id] = Date.now().toString(36);
    }

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

    get coverUrl() {
        if (!this.id) {
            return '';
        }
        let lastChange = _lastCoverChangeById[this.id];
        return `/covers/${this.id}${lastChange ? '?' + lastChange : ''}`;
    }

    /**
     * @param {Disc} other
     * @return {number}
     */
    compareToByTitle(other) {
        return this.title.localeCompare(other.title || '');
    }

    /**
     * @param {Disc} other
     * @return {number}
     */
    compareToByDiscNumber(other) {
        return (this.discNumber || 0) - (other.discNumber || 0);
    }

    /** @override */
    toString() {
        return Disc[`"${this.title}"`];
    }
}
