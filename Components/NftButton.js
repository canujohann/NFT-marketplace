import React, { useState } from "react";

const NftButton = ({ children, clickAction }) => {
  const [isLoading, setIsLoading] = useState(false);

  const wrapperAction = async () => {
    try {
      setIsLoading(true);
      await clickAction();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        disabled={isLoading}
        onClick={wrapperAction}
        className="font-bold text-white rounded p-4 px-8 shadow-lg bg-neutral-900 hover:bg-neutral-600"
      >
        {children}
      </button>
    </>
  );
};
export default NftButton;
