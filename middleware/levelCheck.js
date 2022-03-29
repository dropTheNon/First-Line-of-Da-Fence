module.exports = (req, res, next) => {
    console.log("level check being hit");
    // checks to see if the user's level allows the called function
    if (req.user?.level === "Foreman" || req.user?.level === "Helper") {
        return res.json({ message: "Unauthorized" });
    }
    next();
};