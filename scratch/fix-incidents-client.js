const fs = require('fs');

let c = fs.readFileSync('app/admin/[slug]/transport-incidents/IncidentPageClient.tsx', 'utf8');

// Replace component declaration and initial state
const targetDeclaration = `const IncidentPageClient = () => {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Synchronize layout styling variables on load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Main Incidents State
  const [incidents, setIncidents] = useState<Incident[]>([
    { 
      id: 'INC-901', 
      date: '2026-01-14', 
      bus: 'BUS-202', 
      type: 'Minor Collision', 
      severity: 'Medium', 
      status: 'Under Investigation', 
      driver: 'Jane Cooper',
      notes: 'Fender bender near North Intersection. No injuries reported. Police report filed.',
      hasVideo: true,
      hasPhotos: true
    },
    { 
      id: 'INC-882', 
      date: '2026-01-12', 
      bus: 'BUS-101', 
      type: 'Engine Smoking', 
      severity: 'High', 
      status: 'Resolved', 
      driver: 'Robert Fox',
      notes: 'White smoke from manifold. Vehicle safely evacuated. Replacement dispatched within 12 minutes.',
      hasVideo: false,
      hasPhotos: true
    },
    { 
      id: 'INC-875', 
      date: '2026-01-08', 
      bus: 'VAN-03', 
      type: 'Route Deviation', 
      severity: 'Low', 
      status: 'Logged', 
      driver: 'Cody Fisher',
      notes: 'Unplanned detour due to standard road closure on Elm St. Logged for compliance tracking.',
      hasVideo: true,
      hasPhotos: false
    },
  ]);`;

const repDeclaration = `interface IncidentPageClientProps {
  initialIncidents?: Incident[];
  vehicles?: Array<{ id: string; registration: string; model?: string }>;
  schoolId?: string;
}

const IncidentPageClient: React.FC<IncidentPageClientProps> = ({
  initialIncidents = [],
  vehicles = [],
  schoolId = "",
}) => {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Synchronize layout styling variables on load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Main Incidents State
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);`;

if (c.includes(targetDeclaration)) {
  c = c.replace(targetDeclaration, repDeclaration);
} else {
  c = c.replace(targetDeclaration.replace(/\n/g, '\r\n'), repDeclaration.replace(/\n/g, '\r\n'));
}

// Replace handleReportSubmit with persistent API call
const targetSubmit = `  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = \`INC-\${Math.floor(100 + Math.random() * 900)}\`;
    const created: Incident = {
      id: generatedId,
      date: new Date().toISOString().split('T')[0],
      ...newIncident,
      hasVideo: Math.random() > 0.5,
      hasPhotos: Math.random() > 0.3
    };

    setIncidents([created, ...incidents]);
    setIsReportModalOpen(false);
    toast.success(\`\${generatedId} successfully logged to Safety Center\`);
    
    // Reset Form
    setNewIncident({
      bus: "",
      type: "",
      severity: "Medium",
      status: "Logged",
      driver: "",
      notes: ""
    });
  };`;

const repSubmit = `  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.bus || !newIncident.type) {
      toast.error("Please enter both vehicle/bus and incident type");
      return;
    }

    try {
      const res = await fetch("/api/admin/transport/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newIncident,
          companyId: schoolId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const created: Incident = json.data;
        setIncidents([created, ...incidents]);
        setIsReportModalOpen(false);
        toast.success("Incident successfully logged to Safety Center");
        setNewIncident({
          bus: "",
          type: "",
          severity: "Medium",
          status: "Logged",
          driver: "",
          notes: ""
        });
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to log incident");
      }
    } catch {
      toast.error("Network error logging incident");
    }
  };`;

if (c.includes(targetSubmit)) {
  c = c.replace(targetSubmit, repSubmit);
} else {
  c = c.replace(targetSubmit.replace(/\n/g, '\r\n'), repSubmit.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('app/admin/[slug]/transport-incidents/IncidentPageClient.tsx', c, 'utf8');
console.log('Updated IncidentPageClient.tsx successfully');
