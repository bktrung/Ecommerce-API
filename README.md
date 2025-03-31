# Ecommerce-API

update pagination for search, find all draft, find all published

add apply discount, cancel discount, delete and update discount, research more about discount services

add user model

add cart 

implement event on cart and inventory

add const reservationSchema = new Schema({
    cartId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { _id: false }); for inventory

improve cart and order services

refactor checkout & order & redlock

update discord to only log error

add cache for optimize auth blacklist token