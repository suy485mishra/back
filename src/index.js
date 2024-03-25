import connectDB from "./db/index.js";
import app from "./app.js";
/*dotenv-->this is experimental feature as of now so script change*/
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8001, () => {
      console.log(`Server started at port:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed", error);
  });
//1st approach to connect db

//iffy
// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.on("error",()=>{
//             console.log("err",error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Listening on port ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.log(error)
//         throw error
//     }
// })()
