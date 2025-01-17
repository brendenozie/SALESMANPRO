import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

// POST /api/post
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { productId, quantity, damaged, action, companyId, salesAgentId, reason, adminId, commissionRate, target } = req.body;

  // Input validation
  if (!productId || !action || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid product ID or quantity.' });
  }

  try {
    // Find inventory item by product ID
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: { productId },
    });

    // If inventory item doesn't exist and action is RESTOCK or NEWSTOCK, create a new inventory item
    if (!inventoryItem && (action === 'RESTOCK' || action === 'NEWSTOCK')) {
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          product: {
                connect: {
                  id: productId, // Assuming `productId` exists in the Product table
                },
              },
          company: {
              connect: {
                id: companyId, // Connect to existing company
              },
            },
          quantity,
          reorderThreshold: 10, // Default reorder threshold
        },
      });

      // Create a log for the new stock addition
      await prisma.inventoryLog.create({
        data: {
          inventoryId: inventoryItem.id,
          action: 'NEWSTOCK', // Default action for new items
          damaged: damaged,
          quantity,
        },
      });

      return res.status(201).json({ message: 'New inventory item added.', inventory: inventoryItem });
    }

     if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    // Check if the action is 'RESTOCK' and quantity is valid
    if (action === 'RESTOCK' && quantity > 0) {
      // Update inventory quantity
      const updatedInventory = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantity: inventoryItem.quantity + quantity,
        updatedAt: new Date(),
      },
      });

      // Add inventory log
      await prisma.inventoryLog.create({
      data: {
        inventoryId: inventoryItem.id,
        action: action,        
        damaged:damaged,
        quantity,
      },
      });

      return res.status(200).json({ message: 'Product restocked successfully.', inventory: updatedInventory });
    }  

    if (action === 'ASSIGN') {
      // Ensure sufficient quantity in inventory
      if (inventoryItem.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient inventory quantity.' });
      }

      // Find agent inventory item by product ID
      let agentinventoryItem = await prisma.agentInventory.findFirst({
        where: { inventoryItemId: inventoryItem.id },
      });

      // Update main inventory quantity
      let updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity - quantity,
          updatedAt: new Date(),
        },
      });

      // Create or update commission
      let commission = await prisma.commission.upsert({
        where: {
          salesAgentId_productId: { salesAgentId, productId: inventoryItem.productId },
        },
        update: {
          commissionEarned: { increment: quantity * commissionRate },
          updatedAt: new Date(),
        },
        create: {
          salesAgentId,
          productId: inventoryItem.productId,
          orderId: null, // Assign later if needed
          commissionRate,
          commissionEarned: quantity * commissionRate,
          basedOn: 'QUANTITY',
        },
      });

      // Create or update target
      let targetP = await prisma.target.upsert({
        where: {
          salesAgentId_productId: { salesAgentId, productId: inventoryItem.productId },
        },
        update: {
          achievedValue: { increment: quantity },
          updatedAt: new Date(),
        },
        create: {
          salesAgentId,
          productId: inventoryItem.productId,
          targetType: target.type,
          targetValue: target.value, // Set a default target value
          achievedValue: quantity,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      // If inventory item doesn't exist and action is RESTOCK or NEWSTOCK, create a new inventory item
      if (!agentinventoryItem) {
        agentinventoryItem = await prisma.agentInventory.create({
          data: {
            salesAgentId,
            inventoryItemId: inventoryItem.id,
            quantity,
          },
        });

        // Add inventory log
        await prisma.inventoryLog.create({
          data: {
            inventoryId: inventoryItem.id,
            action: 'ASSIGN',
            damaged,
            quantity,
          },
        });

        return res.status(200).json({
          message: 'Product assigned successfully.',
          inventory: updatedInventory,
          commission,
          targetP,
        });
      }

      // Update agent inventory quantity
      const updatedAgentInventory = await prisma.agentInventory.update({
        where: { id: agentinventoryItem.id },
        data: {
          quantity: agentinventoryItem.quantity + quantity,
          updatedAt: new Date(),
        },
      });

      // Add inventory log
      await prisma.agentInventoryLog.create({
        data: {
          agentInventoryId: agentinventoryItem.id,
          action: action,
          damaged: damaged,
          quantity,
        },
      });

      return res.status(200).json({
        message: 'Product assigned successfully.',
        inventory: updatedInventory,
        commission,
        targetP,
      });
  }


    // if (action === 'ASSIGN') {
    //   // Ensure sufficient quantity in inventory
    //   if (inventoryItem.quantity < quantity) {
    //     return res.status(400).json({ error: 'Insufficient inventory quantity.' });
    //   }


    //   // Find agent inventory item by product ID
    // let agentinventoryItem = await prisma.agentInventory.findFirst({
    //   where: { inventoryItemId : inventoryItem.id },
    // });

    // // Update main inventory quantity
    //   let updatedInventory = await prisma.inventoryItem.update({
    //     where: { id: inventoryItem.id },
    //     data: {
    //       quantity: inventoryItem.quantity - quantity,
    //       updatedAt: new Date(),
    //     },
    //   });

    // // If inventory item doesn't exist and action is RESTOCK or NEWSTOCK, create a new inventory item
    // if (!agentinventoryItem) {

    //     agentinventoryItem = await prisma.agentInventory.create({
    //       data: {
    //         salesAgentId,
    //         inventoryItemId:inventoryItem.id,
    //         quantity,
    //       },
    //     });

    //   // Add inventory log
    //   await prisma.inventoryLog.create({
    //     data: {
    //       inventoryId: inventoryItem.id,
    //       action: 'ASSIGN',
    //       damaged,
    //       quantity,
    //     },
    //   });      

    //   return res.status(200).json({ message: 'Product assigned successfully.', inventory: updatedInventory });
    // }

    
    // // Update agent inventory quantity
    //   const updatedAgentInventory = await prisma.agentInventory.update({
    //   where: { id: agentinventoryItem.id },
    //   data: {
    //     quantity: agentinventoryItem.quantity + quantity,
    //     updatedAt: new Date(),
    //   },
    //   });

    //   // Add inventory log
    //   await prisma.agentInventoryLog.create({
    //     data: {
    //       agentInventoryId: inventoryItem.id,
    //       action: action,        
    //       damaged:damaged,
    //       quantity,
    //     },
    //   });

    //   return res.status(200).json({ message: 'Product assigned successfully.', inventory: updatedInventory });
    // }

    if (action === 'RETURN') {

      // Ensure sufficient quantity in inventory
      if (inventoryItem.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient Agent inventory quantity.' });
      }

      // Find agent inventory item by product ID
      let agentinventoryItem = await prisma.agentInventory.findFirst({
        where: { inventoryItemId : inventoryItem.id },
      });

      if (!agentinventoryItem || agentinventoryItem.quantity < quantity) {
          return res.status(400).json({ error: 'Insufficient Agent inventory quantity.' });
        }

      // If inventory item doesn't exist and action is RESTOCK or NEWSTOCK, create a new inventory item
      if (!agentinventoryItem) {    
        return res.status(400).json({ message: 'Error Something\'s not write.'});
      }
      
      // Update main inventory quantity
      let updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity + quantity,
          updatedAt: new Date(),
        },
      });

    // Update agent inventory quantity
      const updatedAgentInventory = await prisma.agentInventory.update({
      where: { id: agentinventoryItem.id },
      data: {
        quantity: agentinventoryItem.quantity - quantity,
        updatedAt: new Date(),
      },
      });

      // Add inventory log
      await prisma.agentInventoryLog.create({
        data: {
          agentInventoryId: inventoryItem.id,
          action: action,        
          damaged:damaged,
          quantity,
        },
      });

      // Add return log
      await prisma.return.create({
        data: {
          inventoryItem: { connect: { id: inventoryItem.id } },
          returnedBy: { connect: { id: salesAgentId } },
          quantity,
          reason,
          ApprovedBy: { connect: { id: adminId } },
        },
      });

      // Add inventory log
      await prisma.inventoryLog.create({
        data: {
          inventoryId: inventoryItem.id,
          action: action,
          damaged,
          quantity,
        },
      });

      return res.status(200).json({ message: 'Product returned successfully.', inventory: updatedInventory });
    }

    if (action === 'REQUEST') {
      // Create a request for admin approval
      const request = await prisma.request.create({
        data: {
          requestedById : salesAgentId,
          ApprovedById : adminId,
          productId : productId,
          quantity,
          status: 'PENDING', // Default status
        },
      });

      return res.status(200).json({ message: 'Request submitted successfully.', request });
    }
    
    return res.status(400).json({ error: 'Invalid action or quantity.' });

  } catch (error) {
    console.error('Restock Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
