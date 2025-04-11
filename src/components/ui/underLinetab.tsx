"use client";
import * as React from "react";

type TabProps = {
  item: string[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

function UnderlineTab({
  item,
  activeIndex,
  setActiveIndex,
  children,
}: TabProps & React.ComponentProps<"div">) {
  return (
    <>
      <div role="tablist">
        {item.map((item, index) => (
          <button
            className={`px-[36px] py-[12px] border-b-2 text-base cursor-pointer font-bold
              ${
                activeIndex === index
                  ? "border-[var(--black)] text-[var(--black)]"
                  : "border-[var(--gray-01)] text-[var(--gray-02)]"
              }
          `}
            key={index}
            onClick={() => setActiveIndex(index)}
          >
            {item}
          </button>
        ))}
      </div>
      {children}
    </>
  );
}

export { UnderlineTab };
