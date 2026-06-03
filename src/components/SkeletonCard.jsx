import React from "react";

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, idx) => (
        <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-48 animate-pulse">
          <div>
            <div className="w-12 h-12 bg-gray-200 rounded-2xl mb-4 shimmer"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3 shimmer"></div>
            <div className="h-3 bg-gray-200 rounded-md w-full mb-2 shimmer"></div>
            <div className="h-3 bg-gray-200 rounded-md w-5/6 shimmer"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded-md w-1/4 mt-4 shimmer"></div>
        </div>
      ))}
    </>
  );
};
