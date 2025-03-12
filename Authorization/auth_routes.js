const auth_methods = require('./auth_controller')
const express = require('express')


const router = express.Router();

router.post('/register',async (req,res)=>{
    const {userName, password, emailId} = req.body
    try{
        const result = await auth_methods.registerUser(userName, password, emailId)
        res.status(201).json({result:true,message:"User Registered Successfully"})
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})

router.post('/refresh', async (req,res)=>{
    const refreshToken = req.cookies.refreshToken; // Read from cookie
    if (!refreshToken || !refreshTokensDB.has(refreshToken)) {
        return res.status(403).json({ error: "Refresh token invalid" });
    }
    try{
        const response = await auth_methods.refreshUserToken(refreshToken)
    }catch(error){
        res.status(error.status||500).json({ error: error.message });
    }
})

router.post('/login',async (req,res)=>{
    const { emailId, password } = req.body;
    try{
        const data = await auth_methods.loginUser(emailId,password)
        res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        res.status(201).json({message: "Login Successful!",result:true,data:{access_token:data.accessToken}})
    }catch(error){
        res.status(error.status||500).json({ error: error.message });
    }
})

router.post('/logout',async (req,res)=>{
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });
    try{
        await auth_methods.logoutUser(refreshToken)
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });
        res.status(200).json({message:"Logged out successfully"})
    }catch(error){
        res.status(error.status||500).json({ error: error.message,result:False});
    }
})

module.exports=router