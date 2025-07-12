// pages/api/project-members/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET all project members (can be filtered by projectId)
    const { projectId } = req.query;
    try {
      const projectMembers = await prisma.projectMember.findMany({
        where: projectId ? { projectId } : {},
        include: {
          project: true,
          user: true,
        },
      });
      res.status(200).json(projectMembers);
    } catch (error) {
      console.error('Error fetching project members:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // POST a new project member
    const { projectId, userId, role } = req.body;
    try {
      const newProjectMember = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role,
        },
      });
      res.status(201).json(newProjectMember);
    } catch (error) {
      console.error('Error creating project member:', error);
      // Handle unique constraint violation (user already a member of this project)
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'User is already a member of this project.' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
