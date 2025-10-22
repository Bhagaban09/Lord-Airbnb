
const User =require("../models/user");

module.exports.renderSignUpForm =(req,res)=>{
   res.render("users/signup.ejs");
};

module.exports.signUp =async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        // Automatically log the user in
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Crick-Zone");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login =async(req,res)=>{
        req.flash("success","Welcome back Again !");
        let redirectUrl =res.locals.redirectUrl || "/listings"
        res.redirect(redirectUrl);
};

module.exports.logout =(req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are successfully Logged Out");
        res.redirect("/listings"); // ✅ End the response here
    });
};