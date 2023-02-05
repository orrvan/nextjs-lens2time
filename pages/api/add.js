import connectMongo from '../../utils/connectMongo';
import User from '../../models/MDModel';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function addUser(req, res) {
  try {
    console.log('CONNECTING TO MONGO');
    await connectMongo();
    console.log('CONNECTED TO MONGO');

    console.log('CREATING DOCUMENT');
    console.log(req.body)
    const data = await User.create(req.body);
    console.log('CREATED DOCUMENT');

    res.json({ data });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}