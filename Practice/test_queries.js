const createProfile = "INSERT INTO user_profile (first_name,last_name,email,phone,gender,dob,image_path,country,state) VALUES (?,?,?,?,?,?,?,?,?);"
const createMulProfiles = "INSERT INTO user_profile (first_name,last_name,email,phone,gender,dob,country,state) VALUES ?;"
const getVisibleProfiles = "SELECT * FROM user_profile WHERE visibility = TRUE;"
const updateProfileVisibility = "UPDATE user_profile SET visibility = FALSE WHERE id IN (?);"
const getProfileByID = "SELECT * FROM user_profile WHERE id=?"
const getCountries = "SELECT DISTINCT country_code, country_name FROM country_state_map;"
const getStatesByCountry = "SELECT state_code, state_name FROM country_state_map WHERE country_code=?;"
module.exports = {getVisibleProfiles, createProfile, updateProfileVisibility,getProfileByID,createMulProfiles, getCountries, getStatesByCountry}