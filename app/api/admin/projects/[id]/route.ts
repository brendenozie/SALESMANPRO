// pages/api/projects/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // GET a single project by ID
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: true,
          events: true,
          donations: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // PUT (Update) an existing project by ID
    const { name, description, startDate, endDate, status, budget, companyId } = req.body;
    try {
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
          budget,
          companyId,
          updatedAt: new Date(), // Manually update updatedAt
        },
      });
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.code === 'P2025') { // Prisma error code for record not found
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // DELETE a project by ID
    try {
      await prisma.project.delete({
        where: { id },
      });
      res.status(204).end(); // No content response for successful deletion
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
