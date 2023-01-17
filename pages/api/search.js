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
    const data = await User.find(req.body);
    console.log('SEARCHING DOCUMENT');

    res.json({ data });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}