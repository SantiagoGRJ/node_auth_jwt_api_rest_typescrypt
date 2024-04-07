import { Request, Response } from "express";
import { comparePasswords, hashPassword } from "../services/password.service";
import prisma from '../models/user'
import { generateToken } from "../services/auth.service";

export const register = async (req: Request ,res:Response) : Promise<void> => {

    const {email,password} = req.body

    try {
        if(!email){
            res.status(400).json({
                message:"El Email es Obligatorio"
            })
            return
        }
        if(!password){
            res.status(400).json({
                message:"El Password es Obligatorio"
            })
            return
        }
        
        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword)

        const user = await prisma.create(
            {
                data:{
                    email,
                    password:hashedPassword
                }
            }
        )

        const token = generateToken(user)
        res.status(201).json({token}) 


    } catch (error : any ) {
        // TODO mejorar los errores
        
        console.log(error)
      

        if(error?.code === 'P2002' && error?.meta?.target?.includes('email')){
            res.status(400).json({
                message:"El Email Ingresado ya Existe"
            })
        }

        res.status(500).json({
            error:`Hubo un error en el registro`
        })
    }

}

export const login = async (req: Request, res:Response) : Promise<void> => {

    const {email,password} = req.body

    try {
        if(!email){
            res.status(400).json({
                message:"El Email es Obligatorio"
            })
            return
        }
        if(!password){
            res.status(400).json({
                message:"El Password es Obligatorio"
            })
            return
        }
        
        const user = await prisma.findUnique({where:{email}})
       
        if(!user){
            res.status(404).json({error: 'Usuario no encontrado' })
            return
        }

        const passwordMatch = await comparePasswords(password,user.password)
       
        if(!passwordMatch){
            res.status(401).json({error:`Usuario y contraseña no coinciden`})
        }

        const token = generateToken(user)
        res.status(200).json({token})


    } catch (error) {
        res.status(500).json({

        })
    }

}
