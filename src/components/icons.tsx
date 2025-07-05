import type { SVGProps } from "react";

export function NexusCartLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-4.44L4 10.44v11.11h16V10.44L12.22 2z"></path>
      <path d="M4 10.44h4.44M15.56 10.44H20M12.22 2l-4.44 8.44M12.22 2l4.44 8.44"></path>
      <path d="M12.22 22V10.44"></path>
    </svg>
  );
}
