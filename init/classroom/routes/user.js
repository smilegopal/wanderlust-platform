const express=require("express");
const router=express.Router();


//index-user
router.get("/",(req,res)=>{
    res.send("Get for user");
})
//show route
router.get("/:id",(req,res)=>{
    res.send("Get for  user id");
})
//post user
router.post("/",(req,res)=>{
    res.send("Post for  user");
})
//delete user
router.delete("/:id",(req,res)=>{
    res.send("delete for  user id");

})
module.exports=router;