import React from "react";

const NftButton = ({ children, clickAction }) => {
  return (
    <button
      onClick={clickAction}
      className="w-auto font-bold mt-4 mx-10 text-white rounded p-4 px-10 shadow-lg bg-neutral-900 hover:bg-neutral-600"
    >
      {children}
    </button>
  );
};
export default NftButton;
