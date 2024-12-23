import { user, user, user} from "../models/user";
import bcrypt from "bcryptjs";

export const register= async(req,res)=>{
   try {
    const {fullname,email,phonenumber,password,role}=req.body;
    if(!fullname || !email || !phonenumber || !password || !role ){
         return res.json({
            message:"some field is missing",
            success:false
         });
    };
    const user= await user.findOne({email})
    if(user){
        return res.json({
         message:"user already exist",
         success:false,
        })
    }
    const hased=await bcrypt.hash(password,10);
    await user.create({
      fullname,
      email,
      phonenumber,
      password:hased,
      role
    })
  } catch (error) {
   console.log(error);
  }
}

export const login=async(req,res)=>{
  try {
   const{email,password,role}=req.body;
      if( !email || !password || !role ){
         return res.json({
            message:"some field is missing",
            success:false
         });
      };
   
   let user = await user.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }

    const matchPass=await bcrypt.compare(password,user.password)
            if (!isPasswordMatch) {
               return res.status(400).json({
                  message: "Incorrect email or password.",
                  success: false,
               })
         };

       if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };
        const tokenData = {
         userId: user._id
     }
     const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

     user = {
         _id: user._id,
         fullname: user.fullname,
         email: user.email,
         phoneNumber: user.phoneNumber,
         role: user.role,
         profile: user.profile
     }

     return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
         message: `Welcome back ${user.fullname}`,
         user,
         success: true
     })


  } catch (error) {
   console.log(error)
  }

}

export const logout = async (req, res) => {
   try {
       return res.status(200).cookie("token", "", { maxAge: 0 }).json({
           message: "Logged out successfully.",
           success: true
       })
   } catch (error) {
       console.log(error);
   }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        // cloudinary ayega idhar
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray
      
        // resume comes later here...
        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}