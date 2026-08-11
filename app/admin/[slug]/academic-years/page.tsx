import { getAuthSession } from "@/lib/auth"
import { findCompanyCached } from "@/lib/company-fetcher"
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

  const cookieHeader = (await cookies()).toString();

  const { slug } = await params;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

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
   const data = (await res.json()).data;
  //  console.log("Fetched Academic Years →", data); 
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