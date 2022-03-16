module.exports = (req, res, next) => {
    // checks to see if the user's level allows the called function
    if (!req.user.level === "Admin") {
        return res.json({ message: "Unauthorized" });
    }
    next();
};