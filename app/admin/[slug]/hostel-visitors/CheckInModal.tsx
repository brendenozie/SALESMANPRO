"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CheckInModal = ({ schoolId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    relation: "Parent",
    idType: "National ID",
  });

  // Simple debounced search for students
  useEffect(() => {
    if (studentSearch.length > 2) {
      const fetchStudents = async () => {
        const res = await fetch(`/api/admin/students/search?q=${studentSearch}&schoolId=${schoolId}`);
        const data = await res.json();
        setSearchResults(data.students);
      };
      fetchStudents();
    } else {
      setSearchResults([]);
    }
  }, [studentSearch, schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return toast.error("Please select a student being visited");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/hostel/visitors/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, studentId: selectedStudent.id, companyId: schoolId }),
      });

      if (res.ok) {
        const { data } = await res.json();
        onSuccess(data);
        toast.success("Visitor Checked In");
        onClose();
      }
    } catch (err) {
      toast.error("Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <header className="mb-8">
          <h2 className="text-3xl font-black text-white italic">Visitor <span className="text-blue-500">Entry.</span></h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Verify identification and link to a resident student.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitor Identity */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Type Provided</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none appearance-none"
                  onChange={(e) => setFormData({...formData, idType: e.target.value})}
                >
                  <option>National ID</option>
                  <option>Driver's License</option>
                  <option>Passport</option>
                  <option>Student ID (Visitor)</option>
                </select>
              </div>
            </div>

            {/* Resident Linkage */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visit Resident</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    placeholder="Search Student Name..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                    value={selectedStudent ? selectedStudent.name : studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setSelectedStudent(null);
                    }}
                  />
                </div>

                {/* Search Dropdown */}
                {searchResults.length > 0 && !selectedStudent && (
                  <div className="absolute w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 max-h-48 overflow-y-auto">
                    {searchResults.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        {s.name} • <span className="text-slate-500">{s.grade}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                <input 
                  placeholder="e.g. Father, Uncle, Mentor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  onChange={(e) => setFormData({...formData, relation: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !selectedStudent}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Registering Access..." : "Grant Access & Log Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;