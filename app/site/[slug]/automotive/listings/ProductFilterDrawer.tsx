"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface FilterDrawerProps {
  filters: {
    yearMin?: number;
    yearMax?: number;
    hpMin?: number;
    hpMax?: number;
    driveType?: string;
  };
  onChange: (filters: FilterDrawerProps["filters"]) => void;
}

const driveTypes = ["FWD", "RWD", "AWD", "4WD"];

export default function FilterDrawer({ filters, onChange }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const update = (field: string, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <>
      {/* FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm bg-white shadow-sm hover:bg-stone-100"
      >
        <FunnelIcon className="h-5 w-5" />
        Filters
      </button>

      {/* DRAWER OVERLAY */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* DRAWER PANEL */}
            <motion.div
              className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* YEAR RANGE */}
              <div className="mb-6">
                <label className="font-medium block mb-2">Year Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.yearMin || ""}
                    onChange={(e) => update("yearMin", Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.yearMax || ""}
                    onChange={(e) => update("yearMax", Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* HP RANGE */}
              <div className="mb-6">
                <label className="font-medium block mb-2">Horsepower</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.hpMin || ""}
                    onChange={(e) => update("hpMin", Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.hpMax || ""}
                    onChange={(e) => update("hpMax", Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* DRIVE TYPE */}
              <div className="mb-6">
                <label className="font-medium block mb-3">Drive Type</label>
                <div className="flex flex-wrap gap-2">
                  {driveTypes.map((dt) => {
                    const active = filters.driveType === dt;
                    return (
                      <button
                        key={dt}
                        onClick={() => update("driveType", active ? "" : dt)}
                        className={`px-3 py-1.5 rounded-lg border text-sm ${
                          active
                            ? "bg-stone-900 text-white"
                            : "bg-white hover:bg-stone-100"
                        }`}
                      >
                        {dt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CLEAR BUTTON */}
              <button
                onClick={() =>
                  onChange({
                    yearMin: undefined,
                    yearMax: undefined,
                    hpMin: undefined,
                    hpMax: undefined,
                    driveType: "",
                  })
                }
                className="w-full py-2 mt-4 bg-stone-200 text-sm rounded-lg hover:bg-stone-300"
              >
                Clear All Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



// const [filters, setFilters] = useState({
//   yearMin: undefined,
//   yearMax: undefined,
//   hpMin: undefined,
//   hpMax: undefined,
//   driveType: "",
// });

// // Filter your items:
// const filteredCars = products.filter((item) => {
//   if (filters.yearMin && item.year < filters.yearMin) return false;
//   if (filters.yearMax && item.year > filters.yearMax) return false;
//   if (filters.hpMin && item.horsepower < filters.hpMin) return false;
//   if (filters.hpMax && item.horsepower > filters.hpMax) return false;
//   if (filters.driveType && item.driveType !== filters.driveType) return false;
//   return true;
// });


{/* <FilterDrawer filters={filters} onChange={setFilters} /> */}
// 