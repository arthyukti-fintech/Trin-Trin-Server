const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { ApiError } = require("../utils/apiError");

const ProfileSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+91[0-9]{10}$/, 'Phone number must be in the format +91XXXXXXXXXX'],
        unique: true,
        sparse: true,
    },
    profileId: {
        type: String,
        unique: true,
        sparse: true,
        immutable: true
    },
    fullName: {
        type: String,
    },
    ip: { type: String },
    userAgent: { type: String },
    os: { type: String },
    dob: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    emailVerification: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String,
    },
    status: {
        type: String,
        enum: ['verified', 'premium', 'normal'],
        default: 'normal',
    },
    role: {
        type: String,
        enum: ["user", "resturantsOwner", "superAdmin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    referralCode: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
    },
    gender: {
        type: String,
        enum: ["M", "F", "Others"],
        default: null
    },
    referredCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null
    },
    usedReferralCode: {
        type: Boolean,
        default: false
    },
    referredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        },
    ],
    sessions: [
        {
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    activityLog: [
        {
            date: { type: Date, default: Date.now }
        }
    ],
    password: {
        type: String
    },
    expoToken: {
        type: String
    },
    profileImage: {
        type: String
    }
}, {
    timestamps: true,
});

ProfileSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
ProfileSchema.index({ email: 1 }, { unique: true, sparse: true });
ProfileSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
ProfileSchema.index({ profileId: 1 }, { unique: true, sparse: true });
ProfileSchema.index({ referredBy: 1 });
ProfileSchema.index({ isActive: 1 });
ProfileSchema.index({ role: 1 });
ProfileSchema.index({ status: 1 });
ProfileSchema.index({ createdAt: -1 });

ProfileSchema.pre("save", function (next) {
    if (this.isNew && this.phoneNumber) {
        const first2 = this.phoneNumber.slice(3, 5);
        const last2 = this.phoneNumber.slice(-2);
        const randomNumber = Math.floor(10 + Math.random() * 90);
        this.profileId = `TRIN${first2}${randomNumber}${last2}`;
    }
    next();
});

ProfileSchema.pre("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 8);
    next();
});

ProfileSchema.methods.isCorrectPassword = async function (plainPassword) {
    if (!this.password) {
        throw new ApiError("Password is not set for this account. Please contact to management.", 400);
    }
    return await bcrypt.compare(plainPassword, this.password);
};

ProfileSchema.pre("save", function (next) {
    if (!this.referralCode && this.fullName) {
        const first4 = this.fullName.slice(0, 4).toUpperCase();
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        this.referralCode = `${first4}${randomNumber}`;
    }
    next();
});

ProfileSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = { Profile }