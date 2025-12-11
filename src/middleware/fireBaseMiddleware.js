const { admin } = require("../firebase/firebase");
const { ApiError } = require("../utils/apiError");


const verifyFirebaseToken = async (req, res, next) => {
  const uid = req.header("loginToken");
  if (!uid) return next(new ApiError("UID missing", 401));

  try {
    const userRecord = await admin.auth().getUser(uid);
    req.user = userRecord;
    next();
  } catch (error) {
    console.error("UID verification error:", error);
    return next(new ApiError("Invalid UID", 401));
  }
};

module.exports = { verifyFirebaseToken };
