import React from "react";
import Link from "next/link";

const ExerciseCard = (item: any) => {
	// let nameString = name.split("").slice(0, 30).join("");
	// if(name.length > 30) nameString += "..."
	return (
		<div className="max-w-xs overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl">
			<div className="px-4 py-3">
				<h1 className="text-xl font-bold text-gray-800 uppercase dark:text-white">
				{item.equipment}
				</h1>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
				{item.exName}
				</p>
			</div>

			<img
				className="object-cover w-full h-48 mt-2"
				src={item.exPic}
				alt={item.exName}
			/>

			<div className="flex items-center justify-between px-4 py-3 bg-gray-900">
				<h1 className="text-sm font-bold text-white">{item.exName}</h1>
				<Link
				href={`/viewworkout/${item.id}`}
				className="px-2 py-1 text-xs font-semibold text-gray-900 uppercase transition-colors duration-300 transform bg-white rounded hover:bg-gray-200 focus:bg-gray-400 focus:outline-none"
				>
				Begin
				</Link>
			</div>
		</div>
	);
};

export default ExerciseCard;
