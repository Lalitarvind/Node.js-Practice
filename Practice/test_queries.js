const createProfile = "INSERT INTO user_profile (first_name,last_name,email,phone,gender,dob,image_path) VALUES (?,?,?,?,?,?,?);"
const createMulProfiles = "INSERT INTO user_profile (first_name,last_name,email,phone,gender,dob) VALUES ?;"
const getVisibleProfiles = "SELECT * FROM user_profile WHERE visibility = TRUE;"
const updateProfileVisibility = "UPDATE user_profile SET visibility = FALSE WHERE id IN (?);"
const getProfileByID = "SELECT * FROM user_profile WHERE id=?"
module.exports = {getVisibleProfiles, createProfile, updateProfileVisibility,getProfileByID,createMulProfiles}