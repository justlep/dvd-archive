const Document = require('camo').Document;
const path = require('path');

const COVER_FILE_BASE_PATH = path.join(__dirname, '../../data/covers');

module.exports = class DiscModel extends Document {

    static collectionName() {
        return 'discs';
    }

    /**
     * @param {string} id
     * @returns {Promise<DiscModel>}
     */
    static async findById(id) {
        return DiscModel.findOne({_id: id});
    }

    constructor() {
        super();

        this.discNumber = {
            type: Number,
            default: 0,
            min: 0
        };

        this.title = {
            type: String,
            validate: (s) => s && s.trim() === s
        };

        this.ean = {
            type: String,
            default: ''
        };
    }

    /**
     * @returns {Object}
     */
    toJson() {
        const {_id, title, discNumber, ean} = this;
        return {id: _id, title, discNumber, ean};
    }

    /**
     * @returns {string}
     */
    getCoverImagePath() {
        return this._id ? path.resolve(COVER_FILE_BASE_PATH, this._id) : null;
    }
};
