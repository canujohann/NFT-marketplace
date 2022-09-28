import React from "react";

export const NftButton = ({ children, clickAction }) => {
  return (
    <button
      onClick={clickAction}
      className="font-bold mt-4 text-white rounded p-4 shadow-lg bg-gradient-to-l from-blue-500 to-teal-400"
    >
      {children}
    </button>
  );
};
