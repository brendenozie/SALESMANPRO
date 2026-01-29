"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon, UserIcon, AcademicCapIcon, UserGroupIcon, CameraIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CheckInModal = ({ schoolId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [personSearch, setPersonSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
    
  const [formData, setFormData] = useState({
    name: "",
    relation: "Parent",
    idType: "National ID",
  });

  // Unified Search for Students and Educators
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (personSearch.length > 2 && !selectedPerson) {
        const fetchPeople = async () => {
          try {
            // Updated endpoint to the unified search we discussed
            const res = await fetch(`/api/admin/students/search?q=${personSearch}&companyId=${schoolId}`);
            const json = await res.json();
            if (json.success) {
              setSearchResults(json.data);
            }
          } catch (err) {
            console.error("Search failed", err);
          }
        };
        fetchPeople();
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce to save API calls

    return () => clearTimeout(delayDebounceFn);
  }, [personSearch, schoolId, selectedPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return toast.error("Please select the person being visited");

    let idImageUrl = "";

    // If an image is selected, upload it first (e.g., to Cloudinary or S3)
    if (idImage) {
      // const formDataUpload = new FormData();
      // formDataUpload.append("file", idImage);
      // formDataUpload.append("upload_preset", "your_preset"); // Adjust based on your provider
      
      // const uploadRes = await fetch("https://api.cloudinary.com/v1_1/your_cloud/image/upload", {
      //   method: "POST",
      //   body: formDataUpload,
      // });
      // const uploadData = await uploadRes.json();
      // idImageUrl = uploadData.secure_url;
    }

    const payload = {
      ...formData,
      companyId: schoolId,
      idImageUrl,
      // Assign ID based on the selected type from the unified search
      studentId: selectedPerson.type === 'STUDENT' ? selectedPerson.id : null,
      educatorId: selectedPerson.type === 'EDUCATOR' ? selectedPerson.id : null,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/admin/hostel/visitors/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { data } = await res.json();
        onSuccess(data);
        toast.success("Visitor Checked In Successfully");
        onClose();
      } else {
        throw new Error("Failed to register visitor");
      }
    } catch (err) {
      toast.error("Check-in failed. Please try again.");
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
          <h2 className="text-3xl font-black text-white italic">
            Visitor <span className="text-blue-500">Entry.</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Verify identification and link to a resident student or staff member.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Visitor Identity */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  placeholder="Visitor's Legal Name"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
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
                  <option>Work/Student ID</option>
                </select>
              </div>
            </div>

            {/* Column 2: Resident/Staff Linkage */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visiting Who?</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    placeholder="Search Name..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    value={selectedPerson ? selectedPerson.name : personSearch}
                    onChange={(e) => {
                      setPersonSearch(e.target.value);
                      setSelectedPerson(null);
                    }}
                  />
                </div>

                {/* Search Dropdown */}
                {searchResults.length > 0 && !selectedPerson && (
                  <div className="absolute w-full mt-2 bg-[#11141b] border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 max-h-48 overflow-y-auto">
                    {searchResults.map((person: any) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedPerson(person)}
                        className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 border-b border-slate-800/50 last:border-0 flex items-center gap-3"
                      >
                        <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center">
                          {person.type === 'STUDENT' ? <UserIcon className="h-3 w-3" /> : <AcademicCapIcon className="h-3 w-3" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{person.name}</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-60">{person.type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                <input 
                  placeholder="e.g. Parent, Sibling, Courier"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, relation: e.target.value})}
                />
              </div>

              {/* Photo Upload Section */}
              <div className="pt-4 border-t border-slate-800/50">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">
                  ID Document Capture
                </label>
                
                <div className="flex items-center gap-4">
                  <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="ID Preview" className="h-24 w-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <CameraIcon className="h-6 w-6 text-slate-500 group-hover:text-blue-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400">Tap to Capture ID</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" // This triggers the rear camera on mobile
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                  
                  {previewUrl && (
                    <button 
                      type="button"
                      onClick={() => {setPreviewUrl(null); setIdImage(null);}}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-400"
                    >
                      Reset Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !selectedPerson || !formData.name}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering Access...
              </>
            ) : "Grant Access & Log Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;