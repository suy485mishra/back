//by using promises
// next is just a flag that helps us to tell that execute next operation
const asyncHandler=(requestHandler)=>{
(req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
}
}
export default asyncHandler
//or simply export {asyncHandler}





// const asyncHandler=()=>{()=>{}}
//by using trycatch
// const asyncHandler=(func)=>async(req,res,next)=>{
// try {
//     await func(req,res,next);
// } catch (error) {
//     res.status(err.code||500).json({
//         success:false,
//         message:err.message
//     })
// }
// }
