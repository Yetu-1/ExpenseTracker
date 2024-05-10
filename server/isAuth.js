// middleware to handle authenticated requests
const isAuth = (req, res, nex) => {
    console.log("hello")
    if(req.user) next();
    res.json({loggedIn: false});
};

export default isAuth;