const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },  // e.g. "ticket"
    seq: { type: Number, default: 0 }
});

/**
 * Atomically increments and returns the next sequence number.
 * Uses findOneAndUpdate with $inc which is a single atomic MongoDB operation —
 * guaranteed no two calls ever return the same number, even under high concurrency.
 */
counterSchema.statics.getNext = async function (name) {
    const counter = await this.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
