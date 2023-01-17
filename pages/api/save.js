import connectMongo from '../../utils/connectMongo';
import User from '../../models/MDModel';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function findIdAndSave(req, res) {
  try {
    console.log('CONNECTING TO MONGO');
    await connectMongo();
    console.log('CONNECTED TO MONGO');
    // console.log(req.body)
    console.log('SEARCHING DOCUMENT');
    let id ={_id:req.body.id}
    let value = JSON.stringify(req.body.value) 
    // console.log(id)
    // console.log(value)
    // const data= await User.findById(id,function(err,user){
    //     if (err) return handleError(err);
    //     user.data=value
    //     user.save(function(err,updatedUser){
    //         if (err) return handleError(err);
    //         console.log(updatedUser)
    //         res.json('updatedUser');
    //         // res.json('success');
    //     })
    // }).clone().catch(function(err){ console.log(err)});
    const findData =await User.findById(id)
    findData.data = value
    findData.save(function(err,updatedUser){
        if (err) return handleError(err);
        res.json(updatedUser);
    })
    // console.log(findData)
    console.log('SEARCHING DOCUMENT');
    // res.json({ data });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}