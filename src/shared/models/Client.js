import mongoose from "mongoose";

const clientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    slug: {
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowerCase: true,
        match: /^[a-z0-9-]+$/,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        maxLength: 500,
        default: '',
    },
    website: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        dataRetenionDays:{
            type: Number,
            default: 30,
            min: 7,
            max: 365
        },
        alertsEnabled: {
            type: Boolean,
            default: true
        },
        timeZone: {
            type: String,
            default: "UTC"
        }
    }
},{
    timestamps: true,
    collection: "clients"
});

clientSchema.index({isActive : 1});

const Client = mongoose.model("Client",clientSchema);

export default Client;