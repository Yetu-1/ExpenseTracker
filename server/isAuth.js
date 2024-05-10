// middleware to handle authenticated requests
const isAuth = (req, res, next) => {
    console.log("hello")
    if(req.user) next();
    res.json({loggedIn: false});
};

export default isAuth;