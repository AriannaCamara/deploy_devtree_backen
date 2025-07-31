import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    handle: string
    name: string
    email: string
    password: string
    descripcion: string
    image: string
    links: string
}

const userSchema = new Schema<IUser>({
    handle: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    name: {
        type: String,
        required: true, // corregido: era `require`
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    links: {
        type: String,
        default: '[]'
    }
})

const User = mongoose.model<IUser>('User', userSchema)
export default User
