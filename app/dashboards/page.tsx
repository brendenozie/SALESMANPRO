import Banner from "../../components/Banner";
import { useSession } from "next-auth/react";
import MainLayout from "../../components/MainLayout";
import PlayStoreBanner  from "../../components/PlayStoreBanner";
import OurPrograms from "../../components/ourprograms";
import Join from "../../components/Join";
import Reasons from "../../components/Reasons";
import Plans from "../../components/Plans";
import Testimonials from "../../components/Testimonials";
import { ISubscritption } from "../../types/typings";
import { GetServerSidePropsContext } from "next";

type Props = {
    subscriptions:  ISubscritption[] ;
};

const Home = (props:Props) => {
  const { data: session, status } = useSession();

  if (status === "loading") return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white text-xl font-semibold mt-4">Loading...</p>
        </div>
      </div>
  );

  return (
    <MainLayout>
      <main className="max-w-full ">
        <div className="mt-20 lg:mt-16"></div>
        <Banner/>
        <div className="mt-[28rem] lg:mt-40"></div>
        <OurPrograms />
        <div className="mt-32 lg:mt-40"></div>
        <Reasons />        
        <div className="mt-32 lg:mt-40"></div>
        <PlayStoreBanner />
        <div className="mt-32 lg:mt-40"></div>
        {/* <Plans subscriptions={props.subscriptions}/> */}
        <div className="mt-32 lg:mt-40"></div>
        <Testimonials />
        <div className="mt-32 lg:mt-40"></div>
        <Join />        
        <div className="mt-32 lg:mt-40"></div>
      </main>
    </MainLayout>
  );
}

export default Home;


export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    
    let url = process.env.NEXT_PUBLIC_API_URL;

    // Prepare all fetch requests with date range and userId as query parameters
    // const fetchPromises = [
    //     fetch(`${url}/get-subscriptions`).then((res) => res.json()),
    //    ];



  try {
    // Wait for all fetch requests to complete
    // const [
    //   subscriptions,
    // ] = await Promise.all(fetchPromises);

    return {
      props: {
        subscriptions:null,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    // Handle error appropriately
    return {
      props: {
        subscriptions: null,
      },
    };
  }
}