// components/DashboardCard.tsx
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from 'next/image';

export interface DashboardCardProps {
  href: string;
  bgColor: string;
  title: string;
  icon: StaticImageData | string;
  value: string;
  progress: number;
  barColor: string;
}

const DashboardCard = ({ href, bgColor, title, icon, value, progress, barColor }: DashboardCardProps) => {
  return (
    <Link href={href} className={`${bgColor} flex flex-col gap-6 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-full shadow-md dark:bg-gray-800">
          {/* <Image src={icon} alt={title} width={48} height={48} className="w-10 h-10" /> */}
            {typeof icon === 'string' ? (
                <img src={icon} alt={title} width={48} height={48} className="w-10 h-10" />
            ) : (
                <Image src={icon} alt={title} width={48} height={48} className="w-10 h-10" />
            )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">{value}</p>
        </div>
      </div>
      <div className="relative w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`${barColor} absolute top-0 left-0 h-full rounded-full`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <span>{progress}% Completed</span>
        <span className="text-orange-500 font-medium hover:underline">View Details</span>
      </div>
    </Link>
  );
};

export default DashboardCard;
