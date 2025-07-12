import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

import prisma, { client } from "@/server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  // if (!session.isAdmin) {
  //   return res.status(401).end()
  // }

  if (req.method === 'DELETE') {
    deleteUser(req, res)
  } else if (req.method === 'PUT') {
    updateUser(req, res)
  } else {
    res.status(404).end()
  }
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const amaId = req.query.id as string
  const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  
  try {
    // const ama = await prisma.exercise.delete({
    //   where: {
    //     id: amaId,
    //   },
    // })
    // return res.status(204).json({ id: ama.id })
  } catch (e) {
    console.log(e)
    NextResponse
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const amaId = req.query.id as string
  const { question } = JSON.parse(req.body)
  try {
    // const ama = await prisma.booking.update({
    //   where: {
    //     id: amaId,
    //   },
    //   data: {
    //     question: question.question,
    //     answer: question.answer,
    //     status: question.status,
    //     audioUrl: question.audioUrl ?? null,
    //     audioWaveform: Array.isArray(question.audioWaveform)
    //       ? question.audioWaveform
    //       : Prisma.DbNull,
    //   },
    // })

    return res.status(200).json("ama")
  } catch (e) {
    console.log(e)
    NextResponse.end()
  }
}
