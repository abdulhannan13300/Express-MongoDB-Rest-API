const asyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register a user
//@route POST /api/contacts/register
//@access public
const registerUser =  asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password) { //check if any field is empty
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const userAvailable = await User.findOne({ email });
    if(userAvailable) { // To check if the user s already present or not
        res.status(400);
        throw new Error("User already exits")
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword)
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    })
    console.log(`New user created: ${user}`);
    if (user){
        res.status(201).json({_id: user.id, email: user.email});
    } else {
        res.json(400);
        throw new Error("User data is not valid");
    }

    res.json({message: "Register the user"});
})

//@desc Login user
//@route POST /api/contacts/login
//@access public
const loginUser = asyncHandler(async(req,res) => {
    const { email, password } = req.body;
    if( !email || !password) { //check if any field is empty
        res.status(400);
        throw new Error("All fields are mandatory");
    }
//Check if the user is present and then check if the password entered is correct
    const user = await User.findOne({ email });
    //compare the password entered with the stored hashedpassword
    if(user && (await bcrypt.compare(password,user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id,
            },
          }, 
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1m"}
        );
        res.status(200).json({ accessToken })
    } else {
        res.status(401)
        throw new Error("Email or password is not valid")
    }

})

//@desc Current user
//@route GET /api/contacts/current
//@access private
const currentUser = asyncHandler(async(req,res) => {
    res.json(req.user);
}
)
module.exports = { registerUser, loginUser, currentUser}