import React from "react";

const NftButton = ({ children, clickAction }) => {
  return (
    <button
      onClick={clickAction}
      className="w-full font-bold mt-4 text-white rounded p-4 shadow-lg bg-black"
    >
      {children}
    </button>
  );
};
export default NftButton;
