"use client"

import React,{useState} from "react"
import toast from "react-hot-toast"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export default function AcademicYearsClient({
 years,
 companyId
}:any){

 const [data,setData]=useState(years)

 const [form,setForm]=useState({
  name:"",
  yearStart:"",
  yearEnd:""
 })

 const createYear = async()=>{

  const res = await fetch(
   `${apiBaseUrl}/admin/academic-years`,
   {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
     ...form,
     companyId
    })
   }
  )

  const json = await res.json()

  if(json.success){
   toast.success("Academic year created")
   setData([...data,json.data])
  }

 }

 return(

 <div className="p-8">

 <h1 className="text-3xl font-bold mb-6">
 Academic Years
 </h1>

 <div className="grid grid-cols-3 gap-4 mb-10">

  <input
   placeholder="Year Name"
   className="p-3 border rounded"
   onChange={(e)=>setForm({...form,name:e.target.value})}
  />

  <input
   type="date"
   className="p-3 border rounded"
   onChange={(e)=>setForm({...form,yearStart:e.target.value})}
  />

  <input
   type="date"
   className="p-3 border rounded"
   onChange={(e)=>setForm({...form,yearEnd:e.target.value})}
  />

 </div>

 <button
  onClick={createYear}
  className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
 >
 Create Academic Year
 </button>


 <div className="grid md:grid-cols-3 gap-6 mt-10">

 {data.map((year:any)=>(
  <div key={year.id} className="p-6 bg-gray-800 rounded-xl">

   <h2 className="text-xl font-bold">
    {year.name}
   </h2>

   <p>
    {new Date(year.yearStart).toLocaleDateString()}
    -
    {new Date(year.yearEnd).toLocaleDateString()}
   </p>

   <p className="text-sm text-gray-400 mt-2">
    {year.terms.length} Terms
   </p>

  </div>
 ))}

 </div>

 </div>

 )

}