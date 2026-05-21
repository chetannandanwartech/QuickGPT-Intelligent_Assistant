

// API to register user

import User from "../models/User";

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try{
        const userExists = await User.findOne({email})
       
        if(userExists){
            return res.json({sucess: false, message: "user already exists"})
        }

        const user = await User.create({name, email, password})

    } catch (error){
        
    }
}