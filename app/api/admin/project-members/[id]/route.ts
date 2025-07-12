// pages/api/project-members/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query; // 'id' here refers to the ProjectMember's unique _id

  if (req.method === 'GET') {
    // GET a single project member by ID
    try {
      const projectMember = await prisma.projectMember.findUnique({
        where: { id },
        include: {
          project: true,
          user: true,
        },
      });
      if (!projectMember) {
        return res.status(404).json({ message: 'Project member not found' });
      }
      res.status(200).json(projectMember);
    } catch (error) {
      console.error('Error fetching project member:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // PUT (Update) an existing project member by ID
    const { role } = req.body; // Assuming only role can be updated via this route
    try {
      const updatedProjectMember = await prisma.projectMember.update({
        where: { id },
        data: {
          role,
          updatedAt: new Date(), // Manually update updatedAt if you add it to the model
        },
      });
      res.status(200).json(updatedProjectMember);
    } catch (error) {
      console.error('Error updating project member:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project member not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // DELETE a project member by ID
    try {
      await prisma.projectMember.delete({
        where: { id },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting project member:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project member not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
