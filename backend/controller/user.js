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