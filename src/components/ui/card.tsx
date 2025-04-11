"use client";
import * as React from "react";

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`p-9 bg-[var(--blue-04)] border border-[var(--gray-01)] rounded-[var(--radius-md)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
