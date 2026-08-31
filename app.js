if(process.env.NODE_ENV !="production"){
  require('dotenv').config();

}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsyc=require("./utils/wrapAsyc.js");
const Expresserror=require("./utils/Expresserror.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport")
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");




const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");



let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// -------------------- Database Connection --------------------
main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


// -------------------- Middleware --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // serve css/js/images

// -------------------- Routes --------------------
const sessionOption={
   secret:"mysupersecreat",
    resave:false,
    saveUninitialized :true,
    cookie:{
      expires:Date.now()+7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true,

    },   

};
// app.get("/", (req, res) => {
//   res.redirect("/listings");
// });

app.use(session(sessionOption))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 




app.use((req, res, next) => {
  res.locals.currUser = req.user;         // ✅ logged user
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


// app.get("/demouser",async(req,res)=>{
//   let fakeUser= new User({
//     email:"smilegopal18@gmail.com",
//     username:"smilegopal"
//   })
//  let registerUser=await User.register(fakeUser,"helloworld");
//  res.send(registerUser);
// })

app.use("/listings/:id/reviews",reviewRouter);
app.use("/listings",listingRouter);



app.use("/",userRouter)

app.use((req, res, next) => {
  next(new Expresserror(404, "Page not found"));
});
//.............handle................error
app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong"}=err;
res.status(statusCode).render("error.ejs",{message})
})

// -------------------- Server --------------------
app.listen(8080, () => {
  console.log("🚀 Server is listening on port 8080");
});