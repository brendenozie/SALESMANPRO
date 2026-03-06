import AcademicYearsClient from "./AcademicYearsClient"
import { cookies } from "next/headers"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export type Term = {
 id:string
 name:string
 startDate:string
 endDate:string
 isActive:boolean
}

export type AcademicYear = {
 id:string
 name:string
 yearStart:string
 yearEnd:string
 isActive:boolean
 terms:Term[]
}

// interface PageProps{
//  params:Promise<{companyId:string}>
// }
interface PageProps {
  params:Promise<{ slug: string }>
}


export default async function Page({params}:PageProps){

 const { slug: companyId } = await params

 const cookieHeader = (await cookies()).toString()

 let years:AcademicYear[]=[]

 try{

  const res = await fetch(
   `${apiBaseUrl}/admin/academic-years?companyId=${companyId}`,
   {
    headers:{ cookie:cookieHeader },
    next:{ revalidate:60 }
   }
  )

  if(res.ok){
   const data = await res.json()
   console.log("Fetched Academic Years →", data); 
   years = data || []
  }

 }catch(e){
  console.error(e)
 }

 return(
  <AcademicYearsClient
   years={years}
   companyId={companyId}
  />
 )

}