import User from "../models/User"
import slug from "slug"
import formidable from 'formidable'
import { v4 as uuid } from 'uuid'
import { validationResult } from "express-validator"
import { Request, Response } from "express"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"
import { Error } from "mongoose"
import cloudinary from "../config/cloudinary"

export const createAccount = async (req: Request, res: Response) => {
    
    const { email, password } = req.body

    const userExiste = await User.findOne({email})
    if(userExiste) {
        const error = new Error('El usuario ya esta registrado')
        return res.status(409).json({error : error.message})
    }

    // evaluamos que el handle no lo tenga otro usuario
    const handle = slug(req.body.handle, '')
    const handleExiste = await User.findOne({handle})
     if(handleExiste) {
        const error = new Error('El nombre de usuario ya esta registrado')
        return res.status(409).json({error : error.message})
    }


    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle 

    await user.save()
    res.status(201).send('Registro creado correctamente')
}

export const login = async (req: Request, res: Response) => {
    // MANEJAR ERRORES
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()})
    }

    const { email, password } = req.body

    //REVISAR SI EL USUARIO ESTA REGISTRADO
    const user = await User.findOne({email})
    if(!user) {
        const error = new Error('El usuario no esta registrado')
        return res.status(401).json({error : error.message})
    }

    // COMPROBAR EL PASSWORD
    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect) {
        const error = new Error('Password incorrecto')
        return res.status(401).json({error : error.message})
    }

    const token = generateJWT({id: user._id})

    res.send(token)

}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
   try {
    const { descripcion, links } = req.body
    const handle = slug(req.body.handle, '')
    const handleExiste = await User.findOne({handle})
     if(handleExiste && handleExiste.email !== req.user.email) {
        const error = new Error('El nombre de usuario ya esta registrado')
        return res.status(409).json({error : error.message})
    }

    // ACTUALIZAR EL USUARIO
    req.user.descripcion = descripcion
    req.user.handle = handle
    req.user.links = links
    await req.user.save()
    res.send('Perfil actualizado correctamente')

   } catch (e) {
    const error = new Error('Hubo un error')
    return res.status(500).json({error: error.message})
   }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({multiples: false})
    

    try {
        form.parse(req, (error, fields, files) => {
        console.log()

        cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid() }, async function (error, result) {
            if(error) {
                const error = new Error('Hubo un error al subir la imagen')
                return res.status(500).json({error: error.message})
            }
            if(result) {
                req.user.image = result.secure_url
                await req.user.save()
                res.json({image: result.secure_url})
            }
            
        })
    })  
    } catch (e) {
        const error = new Error('Hubo un error')
        return res.status(500).json({error: error.message})
    }
}


export const getUserByHandle = async (req: Request, res: Response) => { 
    try {
        const { handle } = req.params
        const user = await User.findOne({handle}).select('-_id -__v -email -password')
        if(!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({error: error.message})
        }
        res.json(user)
        
    } catch (e) {
        const error = new Error('Hubo un error')
        return res.status(500).json({error: error.message})
    }

}

export const searchByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body
        const userExists = await User.findOne({handle})
        if(userExists) {
            const error = new Error(`${handle} ya esta registrado`)
            return res.status(409).json({error: error.message})
        }
        res.send(`${handle} está disponible`)  
    } catch (e) {
         const error = new Error('Hubo unn error')
        return res.status(500).json({error: error.message})
    }
} 