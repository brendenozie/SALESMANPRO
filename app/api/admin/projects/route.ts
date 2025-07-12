// pages/api/projects/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET all projects
    try {
      const projects = await prisma.project.findMany({
        include: {
          tasks: true, // Include related tasks
          events: true, // Include related events
          donations: true, // Include related donations
          members: {
            include: {
              user: true, // Include user details for project members
            },
          },
        },
      });
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // POST a new project
    const { name, description, startDate, endDate, status, budget, companyId } = req.body;
    try {
      const newProject = await prisma.project.create({
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
          budget,
          companyId,
        },
      });
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
