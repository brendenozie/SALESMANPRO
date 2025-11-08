import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Assuming your Modal component is correctly imported

// Define types for better type safety
// interface Agent {
//   id: string;
//   name: string;
//   profilePicture?: string;
//   // Add other agent properties if needed
// }



// interface AssignProductModalProps {
//   showAssignProductModal: boolean;
//   setShowAssignProductModal: (show: boolean) => void;
//   product: Product;
// }

const AssignProductModal: React.FC<any> = ({ showAssignProductModal, setShowAssignProductModal, product, companyId }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [agents, setAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [assignQuantity, setAssignQuantity] = useState<number>(0);
  const [targetType, setTargetType] = useState<string>("QUANTITY");
  const [targetValue, setTargetValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1); // New state for stepper

  const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${apiUrl}/admin/get-all-agents?companyId=${encodeURIComponent(companyId)}`);
        if (!response.ok) throw new Error("Failed to load agents.");

        const agentsData = await response.json();
        console.log("Fetched agents data:", agentsData);
        setAgents(agentsData.data || []);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (showAssignProductModal && agents.length === 0) {
      fetchAgents();
    }
  }, [showAssignProductModal, apiUrl, agents.length]);

  // --- Handlers & Logic ---
  const handleAssign = async () => {
    try {
      if (!selectedAgent) {
        alert("Please select a sales agent.");
        return;
      }
      if (assignQuantity <= 0) {
        alert("Quantity to assign must be greater than 0.");
        return;
      }
      if (targetValue < 0) {
        alert("Target value must be valid (non-negative).");
        return;
      }

      setIsLoading(true);

      const response = await fetch(`${apiUrl}/admin/post-restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          salesAgentId: selectedAgent,
          quantity: assignQuantity,
          action: "ASSIGN",
          damaged: 0,
          commissionRate: product.commissionRate,
          commissionType: product.commissionType,
          target: {
            type: targetType,
            value: targetValue,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to assign sales agent.");

      alert("Sales agent assigned successfully. 🎉");
      setShowAssignProductModal(false);
      // Reset state after successful assignment and closing modal
      setSelectedAgent("");
      setAssignQuantity(0);
      setTargetValue(0);
      setCurrentStep(1);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent: any) =>
    agent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAgentDetails = agents.find(a => a.id === selectedAgent);

  // --- Step Content Components ---

  const Step1SelectAgent: React.FC = () => (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search agent by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-white">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading agents...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No agents found.</div>
        ) : (
          filteredAgents.map((agent: any) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-3 flex items-center space-x-3 rounded-md cursor-pointer transition duration-150 ease-in-out ${
                selectedAgent === agent.id 
                  ? 'bg-blue-50 border border-blue-500 ring-2 ring-blue-500 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={agent.profilePicture || '/placeholder-avatar.png'}
                alt={agent.name}
                className="h-10 w-10 rounded-full object-cover border border-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-800">{agent.user.name}</p>
                <p className="text-xs text-gray-500 truncate">ID: {agent.id}</p>
              </div>
              {selectedAgent === agent.id && (
                <svg className="ml-auto w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!selectedAgent}
          className={`px-6 py-2 rounded-lg text-white font-medium transition duration-150 ${
            selectedAgent 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          Next: Assignment Details
        </button>
      </div>
    </>
  );

  const Step2AssignmentDetails: React.FC = () => (
    <>
      <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center space-x-3">
        <img
          src={selectedAgentDetails?.profilePicture || '/placeholder-avatar.png'}
          alt={selectedAgentDetails?.name}
          className="h-12 w-12 rounded-full object-cover border-2 border-blue-400"
        />
        <div>
          <p className="text-sm text-gray-600">Assigning to:</p>
          <p className="font-bold text-lg text-blue-800">{selectedAgentDetails?.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700 block mb-1">
            📦 Quantity of **{product.name}** to Assign
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="Enter quantity (e.g., 100)"
            value={assignQuantity}
            min="1"
            onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Target Group */}
        <fieldset className="border p-4 rounded-lg space-y-4">
          <legend className="px-2 text-md font-semibold text-gray-700">🎯 Set Sales Target (Optional)</legend>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Target Type Dropdown */}
            <div>
              <label htmlFor="target-type" className="text-sm font-medium text-gray-700 block mb-1">Target Metric</label>
              <select
                id="target-type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white"
              >
                <option value="QUANTITY">Quantity Sold</option>
                <option value="REVENUE">Revenue (Value)</option>
                <option value="ORDERS">Number of Orders</option>
                <option value="COST">Cost (e.g., Budget)</option>
                <option value="UNITS">Units (Other Metric)</option>
              </select>
            </div>

            {/* Target Value Input */}
            <div>
              <label htmlFor="target-value" className="text-sm font-medium text-gray-700 block mb-1">Target Value</label>
              <input
                id="target-value"
                type="number"
                placeholder="Enter value (e.g., 5000)"
                value={targetValue}
                min="0"
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
        </fieldset>
        
        {/* Read-only Commission Info */}
        <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>Commission for this product: **{product.commissionRate}%** ({product.commissionType})</p>
            <p className="text-xs mt-1">This rate is pulled from the product details and will be applied to the agent's sales.</p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-100 transition duration-150"
        >
          ⬅️ Back
        </button>

        <button
          onClick={handleAssign}
          disabled={assignQuantity <= 0 || targetValue < 0 || isLoading}
          className={`px-8 py-2 rounded-lg text-white font-semibold transition duration-150 flex items-center justify-center ${
            assignQuantity > 0 && targetValue >= 0 && !isLoading
              ? 'bg-green-600 hover:bg-green-700 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Assign Product Now'
          )}
        </button>
      </div>
    </>
  );

  // --- Main Render ---
  return (
    <Modal
      // contentClassName="bg-white rounded-xl shadow-2xl w-full max-w-2xl" // Wider and more modern modal styling
      isOpen={showAssignProductModal}
      onClose={() => setShowAssignProductModal(false)}
      title={`Assign **${product.name}** to Sales Agent`}
    >
      <div className="p-6">
        {/* Stepper Indicator */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
              1
            </div>
            <span className={`ml-2 text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Select Agent</span>
            <div className={`flex-1 mx-4 h-0.5 ${currentStep > 1 ? 'bg-blue-400' : 'bg-gray-300'} w-12`}></div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Define Assignment</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && <Step1SelectAgent />}
        {currentStep === 2 && <Step2AssignmentDetails />}
      </div>
    </Modal>
  );
};

export default AssignProductModal;