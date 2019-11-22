const Document = require('camo').Document;

module.exports = class DiscModel extends Document {

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

        this.title = String;

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

    static collectionName() {
        return 'discs';
    }
};
