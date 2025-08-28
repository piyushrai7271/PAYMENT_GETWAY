import Users from "../model/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await Users.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Error in generating token !");
  }
};
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // validating comming input
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "These fields are required !!",
      });
    }

    //find user with email and phone
    const existingUser = await Users.findOne({ email, phone });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "user already exist with this email and phone ",
      });
    }

    //create user
    const user = await Users.create({
      fullName,
      email,
      phone,
      password,
    });

    //return success response
    return res.status(201).json({
      success: true,
      message: "User created successfully !!",
      data: user,
    });
  } catch (error) {
    console.error("Error in registering User :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !!",
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required for login !!",
      });
    }

    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist with this email !!",
      });
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect.",
      });
    }

    // Generate tokens (await this if it's async)
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);


    const LoggerInUser = await Users.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options
    const options = {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    };

    // Set cookies and return response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User Logged In successfully",
        accessToken,
        data: LoggerInUser,
      });

  } catch (error) {
    console.error("Error in login user :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !!",
      error: error.message,
    });
  }
};
const logOut = async (req, res) => {
  try {
    await Users.findByIdAndUpdate(
    req.userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
        success:true,
        message:"User Logout successfully !!"
    });
  } catch (error) {
    console.error("Error in logout ",error);
    return res.status(500).json({
        success:false,
        message:"Internal server error !!"
    })
  }
};
const changePassword = async (req, res) => {
    try {
        const {password,newPassword,confirmPassword} = req.body;
        const userId = req.userId;

        // validate commig input 
        if(!password || !newPassword || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All the fieds are required to cha ge the password"
            })
        }

        //check user id is comming 
        if(!userId){
          return res.status(400).json({
            success:false,
            message:"Unauthorized user as userId didn't find!!"
          })
        }

        //check that newPassword and confirmPassword is matching 
        if(newPassword !== confirmPassword ){
          return res.status(400).json({
            success:false,
            message:"NewPassword is not matching to confirmPassword"
          })
        }

        // find user with userId
        const user = await Users.findById(userId);
        if(!user){
          return res.status(400).json({
            success:false,
            message:"User is not found with user is"
          })
        }

        //validate password
        const validatePassword = await user.isPasswordCorrect(password);
        if(!validatePassword){
          return res.status(400).json({
            success:false,
            message:"Password is not valid"
          })
        }
       
        //update password in db
        user.password = newPassword;
        await user.save()

        //return success response
        return res.status(200).json({
          success:true,
          message:"Password changed successfully !!"
        })
    } catch (error) {
        console.error("Error in changing password :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server Error !!"
        })
    }
};

export { registerUser, loginUser, logOut, changePassword };
