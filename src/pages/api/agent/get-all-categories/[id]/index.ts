import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from "../../../../server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  // if (!session.isAdmin) {
  //   return res.status(401).end()
  // }
  if (req.method === 'GET') {
    await GetCity(req, res)
    return;
  }
  if (req.method === 'DELETE') {
    await deleteCity(req, res)
    return;
  } 
  if (req.method === 'PUT') {
    await updateCity(req, res)
    return;
  }
  
  else {
    res.status(404).end()
    return;
  }
}

async function GetCity(req: NextApiRequest, res: NextApiResponse) {
  const cityId = req.query.id as string
  try {
    const city = await prisma.exercise.findFirst({
      where: {
        id: cityId,
      },
    })
    return res.status(200).json({InfoResponse:{count: 1,
                    next: "2",
                    pages: 10,
                    prev: "0"},
              results: city
              })
  } catch (e) {
    console.log(e)
    res.status(500)
  }
}

async function deleteCity(req: NextApiRequest, res: NextApiResponse) {
  const amaId = req.query.id as string
  try {
    const ama = await prisma.exercise.delete({
      where: {
        id: amaId,
      },
    })
    return res.status(204).json({ id: ama.id })
  } catch (e) {
    console.log(e)
    res.status(500)
  }
}

async function updateCity(req: NextApiRequest, res: NextApiResponse) {

    const {
      id,
      cityName,
      publicId,
      url,
      status,
    } = req.body;

    const session = await getSession({ req });
    try {

    // const result = await prisma.exercise.update({
    //                   where: {
    //                     id: id,
    //                   },
    //                 data: {
    //                 },
    //                 });
    return res.json("result");

  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}
