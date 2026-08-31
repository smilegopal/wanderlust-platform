const mongoose = require("mongoose");
const listing = require("../models/listing.js");
const initData=require("./data.js");


main().then(() => {
    console.log("Successfully connected");

})
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');


}

const initDB= async()=>{
await listing.deleteMany({});
initData.data=initData.data.map((obj) => ({
    ...obj,
    owner:'690205cb9b2b62b27733fd57',
}));

await listing.insertMany(initData.data);
console.log("data was intialised");


}


initDB();