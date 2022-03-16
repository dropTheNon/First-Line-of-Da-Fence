module.exports = (req, res, next) => {
    // checks to see if the user's level allows the called function
    if (req.user.level === "Foreman" || req.user.level === "Helper") {
        return res.json({ message: "Unauthorized" });
    }
    next();
};