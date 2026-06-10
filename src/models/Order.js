// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    timeSlot: Date,
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
            quantity: { type: Number, required: true, min: 1 },
            itemName: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ],

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'failed', 'completed'],
        default: 'pending',
        index: true
    },


    preparationStatus: {
        type: String,
        enum: [
            'not_started',
            'preparing',
            'ready',
            'picked_up',
            'out_for_delivery',
            'delivered'
        ],
        default: 'not_started'
    },

    isInProgress: {
        type: Boolean,
        default: true,
        index: true
    },

    statusHistory: [
        {
            status: String,
            preparationStatus: String,
            timestamp: { type: Date, default: Date.now },
            note: String,
            updatedBy: String // 'system', 'restaurant', 'user'
        }
    ],

    estimatedPreparationTime: Number,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,

    totalAmount: { type: Number, required: true },

    deliveryAddress: {
        street: String,
        city: String,
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    specialInstructions: String,

    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'wallet'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    completedAt: Date
}, {
    timestamps: true
});


orderSchema.index({ userId: 1, isInProgress: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, isInProgress: 1 });

orderSchema.pre('save', function (next) {
    if (this.isModified('status') || this.isModified('preparationStatus')) {
        this.statusHistory.push({
            status: this.status,
            preparationStatus: this.preparationStatus,
            timestamp: new Date(),
            note: `Status updated to ${this.status} - ${this.preparationStatus}`,
            updatedBy: 'system'
        });
    }

    // Auto-update isInProgress based on status
    this.updateProgressStatus();
});

// orderSchema.pre('save', function (next) {
//     if (this.estimatedDeliveryTime || !this.isModified("estimatedDeliveryTime")) return;
//     this.estimatedDeliveryTime=
// })

// Method to update progress status
orderSchema.methods.updateProgressStatus = function () {
    // Order is in progress if:
    // - Status is pending or confirmed
    // - AND not cancelled or failed
    // - AND not completed

    if (this.status === 'cancelled' || this.status === 'failed') {
        this.isInProgress = false;
    } else if (this.status === 'completed') {
        this.isInProgress = false;
        if (!this.completedAt) {
            this.completedAt = new Date();
        }
    } else if (this.status === 'confirmed' && this.preparationStatus === 'delivered') {
        this.status = 'completed';
        this.isInProgress = false;
        this.completedAt = new Date();
        this.actualDeliveryTime = new Date();
    } else {
        this.isInProgress = true;
    }
};

// Method to get user-friendly status message
orderSchema.methods.getStatusMessage = function () {
    const messages = {
        'pending': '⏳ Order Pending - Waiting for restaurant confirmation',
        'confirmed_not_started': '✅ Order Confirmed - Restaurant will start preparing soon',
        'confirmed_preparing': '👨‍🍳 Your food is being prepared with care',
        'confirmed_ready': '✨ Your order is ready for pickup/delivery!',
        'confirmed_picked_up': '🚗 Order picked up by delivery partner',
        'confirmed_out_for_delivery': '🛵 On the way to your location',
        'confirmed_delivered': '📦 Order delivered - Enjoy your meal!',
        'cancelled': '❌ Order has been cancelled',
        'failed': '⚠️ Order failed - Please contact support',
        'completed': '✅ Order completed successfully'
    };

    const key = this.status === 'confirmed'
        ? `confirmed_${this.preparationStatus}`
        : this.status;

    return messages[key] || 'Status unknown';
};

// Method to get progress percentage
orderSchema.methods.getProgressPercentage = function () {
    if (this.status === 'completed') return 100;
    if (this.status === 'cancelled' || this.status === 'failed') return 0;

    const statusMap = {
        'pending': 10,
        'confirmed_not_started': 20,
        'confirmed_preparing': 40,
        'confirmed_ready': 60,
        'confirmed_picked_up': 75,
        'confirmed_out_for_delivery': 90,
        'confirmed_delivered': 100
    };

    const key = this.status === 'confirmed'
        ? `confirmed_${this.preparationStatus}`
        : this.status;

    return statusMap[key] || 0;
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
    return this.isInProgress && (
        this.status === 'pending' ||
        (this.status === 'confirmed' && this.preparationStatus === 'not_started')
    );
};

// Static method to get in-progress orders for a user
orderSchema.statics.getInProgressOrders = function (userId) {
    return this.find({
        userId,
        isInProgress: true
    })
        .populate('restaurant', 'name address cuisine image rating')
        .sort({ createdAt: -1 });
};

// Static method to get all orders (with filter)
orderSchema.statics.getAllOrdersByUser = function (userId, includeCompleted = true) {
    const query = { userId };
    if (!includeCompleted) {
        query.isInProgress = true;
    }

    return this.find(query)
        .populate('restaurant', 'name address cuisine image rating')
        .sort({ createdAt: -1 });
};

// Static method to get restaurant's active orders
orderSchema.statics.getRestaurantActiveOrders = function (restaurantId) {
    return this.find({
        restaurant: restaurantId,
        isInProgress: true,
        status: { $ne: 'cancelled' }
    })
        .sort({ createdAt: -1 });
};

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order };