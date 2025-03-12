const registerUser="INSERT INTO users (username,password,emailId) VALUES (?,?,?)"
const verifyUser = "SELECT * FROM users WHERE emailId = ?"
const updateRefreshToken = "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)"
const deleteRefreshToken = "DELETE FROM refresh_tokens WHERE token = ?"
const getRefreshToken = "SELECT * FROM refresh_tokens WHERE token = ?"
module.exports = {registerUser,verifyUser, updateRefreshToken, getRefreshToken, deleteRefreshToken}