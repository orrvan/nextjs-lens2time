import connectMongo from '../../utils/connectMongo';
import User from '../../models/MDModel';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function getUser(req, res) {
  try {
    console.log('CONNECTING TO MONGO');
    await connectMongo();
    console.log('CONNECTED TO MONGO');

    console.log('SEARCHING DOCUMENT');
    let data
    console.log(req.body)
    if(req.body.name != 'allUsers'){
      console.log('1111')
      data = await User.find(req.body);
    }else{
      console.log('2222')
      data = await User.find();
    }

    console.log('SEARCHING DOCUMENT');

    res.json({ data });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}