const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const queries = require("./auth_queries");
const pool = require("../database");

async function encryptPassword(plainPassword) {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {

    console.error("Error encrypting password:", error);
  }
}


async function registerUser(username, password, email) {

    try {
        const encrypted_pass = await encryptPassword(password);
        const [result] = await pool.query(queries.registerUser, [username, encrypted_pass, email]);

        if (result.affectedRows === 0) {
            throw({status:500,message:"User registration failed. No rows affected."});
        }

        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function loginUser(emailID,password) {
    try {

        const users = await pool.query(queries.verifyUser, [emailID]);
        if (users.length === 0) {
            throw ({status:401, message:"User not found"});
        }
        const user = users[0][0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            throw({status:401, message:"Incorrect Password!"})
        }
        const accessToken = jwt.sign({ userId: user.id, emailId: emailID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id, emailId: emailID }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        
        await pool.execute(queries.updateRefreshToken, [user.id, refreshToken]);
        
        return { accessToken:accessToken, refreshToken:refreshToken };
    }catch (error) {
        throw ({status:500,message:"Login Failed"})
    }
}

async function logoutUser(refreshToken){
    try{
        await pool.execute(queries.deleteRefreshToken, [refreshToken]);
    }catch(error){
        throw new Error("Token Deletion Failed")
    }
}

async function refreshUserToken(refreshToken){
    try{
        const [tokens] = await pool.execute(queries.getRefreshToken, [refreshToken]);
        if (tokens.length === 0) throw new Error("Invalid refresh token")
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    await logoutUser(refreshToken)
                    throw ({status:403,message:"Refresh token expired, please log in again"});
                }
                throw ({status:403,message:"Invalid refresh token"});
            }
        
            const newAccessToken = jwt.sign({ userId: decoded.userId, emailId: decoded.emailId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        
            res.json({ accessToken: newAccessToken, ok:true });
        });
    }catch(error){
        throw ({status:500,message:"Token Deletion Failed"})
    }
}


module.exports = { registerUser, loginUser, logoutUser, refreshUserToken };
