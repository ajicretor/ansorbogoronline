import React from "react";

interface AnsorLogoProps {
  className?: string;
}

export default function AnsorLogo({ className = "w-full h-full" }: AnsorLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Reusable small 5-point star template centered at 0,0 */}
        <g id="ansor-star-symbol">
          <polygon
            points="0,-2.5 0.7,-0.7 2.5,-0.7 1,-0.2 1.5,1.5 0,0.5 -1.5,1.5 -1,-0.2 -2.5,-0.7 -0.7,-0.7"
            fill="#ffffff"
          />
        </g>
      </defs>

      {/* Outer Green Triangle Frame */}
      <polygon points="50,2 98,90 2,90" fill="#00a852" />

      {/* Double White Border Treatment (Official specifications) */}
      <polygon points="50,5 95,87 5,87" fill="none" stroke="#ffffff" strokeWidth="2.2" />
      <polygon points="50,9 91,84 9,84" fill="none" stroke="#ffffff" strokeWidth="0.8" />

      {/* Inner Green Triangle Content Body */}
      <polygon points="50,10 90,83 10,83" fill="#00a852" />

      {/* --- ICONOGRAPHY ELEMENTS --- */}

      {/* Upper Sunlight Burst / Torch Radiations fanning UPWARDS */}
      {/* Central ray */}
      <polygon points="49.5,35 50,15 50.5,35" fill="#ffffff" />
      {/* Diagonal upper-left rays */}
      <polygon points="49,35.5 42,22 49.8,34.5" fill="#ffffff" />
      <polygon points="48,36.5 35,31 49,35.5" fill="#ffffff" />
      {/* Diagonal upper-right rays */}
      <polygon points="51,35.5 58,22 50.2,34.5" fill="#ffffff" />
      <polygon points="52,36.5 65,31 51,35.5" fill="#ffffff" />

      {/* Lower rays fanning DOWNWARDS under the central star */}
      <polygon points="49.7,46 50,57 50.3,46" fill="#ffffff" />
      <polygon points="49.3,46 44,53 49.6,45.5" fill="#ffffff" />
      <polygon points="50.7,46 56,53 50.4,45.5" fill="#ffffff" />

      {/* Crescent Moon pointing upwards at bottom-center */}
      <path
        d="M 33,52 C 33,64 43,68 50,68 C 57,68 67,64 67,52 C 63.5,58 57.5,61 50,61 C 42.5,61 36.5,58 33,52 Z"
        fill="#ffffff"
      />

      {/* The 1 Central Large Star right in the focal point */}
      <g transform="translate(50, 41) scale(1.8)">
        <use href="#ansor-star-symbol" />
      </g>

      {/* The 8 surrounding stars (4 on left, 4 on right) forming the celestial curve */}
      {/* Left side curve */}
      <use href="#ansor-star-symbol" x="38" y="44" />
      <use href="#ansor-star-symbol" x="34" y="51" />
      <use href="#ansor-star-symbol" x="34" y="59" />
      <use href="#ansor-star-symbol" x="41" y="66" />

      {/* Right side curve */}
      <use href="#ansor-star-symbol" x="62" y="44" />
      <use href="#ansor-star-symbol" x="66" y="51" />
      <use href="#ansor-star-symbol" x="66" y="59" />
      <use href="#ansor-star-symbol" x="59" y="66" />

      {/* "ANSOR" Brand Title Wordmark in bold sans-serif */}
      <text
        x="50"
        y="80"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="13px"
        fontWeight="bold"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
        letterSpacing="0.8px"
      >
        ANSOR
      </text>
    </svg>
  );
}
