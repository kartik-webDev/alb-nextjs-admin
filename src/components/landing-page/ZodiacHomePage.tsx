import React from "react";
import Image from "next/image";
import Link from "next/link";

// Define the interface for zodiac sign
interface ZodiacSign {
  id: number;
  name: string;
  dateRange: string;
  image: string;
  link: string;
}

const zodiacSigns: ZodiacSign[] = [
  {
    id: 1,
    name: "ARIES",
    dateRange: "Mar 21 - Apr 19",
    image: "/zodiac-image/aries.jpeg",
    link: "/consultation",
  },
  {
    id: 2,
    name: "TAURUS",
    dateRange: "Apr 20 - May 20",
    image: "/zodiac-image/taurus.jpeg",
    link: "/consultation",
  },
  {
    id: 3,
    name: "GEMINI",
    dateRange: "May 21 - Jun 20",
    image: "/zodiac-image/gemini.jpeg",
    link: "/consultation",
  },
  {
    id: 4,
    name: "CANCER",
    dateRange: "Jun 21 - Jul 22",
    image: "/zodiac-image/cancer.jpeg",
    link: "/consultation",
  },
  {
    id: 5,
    name: "LEO",
    dateRange: "Jul 23 - Aug 22",
    image: "/zodiac-image/leo.jpeg",
    link: "/consultation",
  },
  {
    id: 6,
    name: "VIRGO",
    dateRange: "Aug 23 - Sep 22",
    image: "/zodiac-image/virgo.jpeg",
    link: "/consultation",
  },
  {
    id: 7,
    name: "LIBRA",
    dateRange: "Sep 23 - Oct 22",
    image: "/zodiac-image/libra.png",
    link: "/consultation",
  },
  {
    id: 8,
    name: "SCORPIO",
    dateRange: "Oct 23 - Nov 21",
    image: "/zodiac-image/scorpio.jpeg",
    link: "/consultation",
  },
  {
    id: 9,
    name: "SAGITTARIUS",
    dateRange: "Nov 22 - Dec 21",
    image: "/zodiac-image/sagittarius.jpeg",
    link: "/consultation",
  },
  {
    id: 10,
    name: "CAPRICORN",
    dateRange: "Dec 22 - Jan 19",
    image: "/zodiac-image/capricorn.jpeg",
    link: "/consultation",
  },
  {
    id: 11,
    name: "AQUARIUS",
    dateRange: "Jan 20 - Feb 18",
    image: "/zodiac-image/aquarius.jpeg",
    link: "/consultation",
  },
  {
    id: 12,
    name: "PISCES",
    dateRange: "Feb 19 - Mar 20",
    image: "/zodiac-image/pisces.jpg",
    link: "/consultation",
  },
];

const ZodiacHomePage: React.FC = () => {
  const ZodiacCard: React.FC<{ sign: ZodiacSign }> = ({ sign }) => (
    <Link prefetch={true} href={sign.link} className="block">
      <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-amber-400 p-3 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg cursor-pointer group h-full">
        {/* Image container with white background and zoom effect */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white">
          <Image
            src={sign.image}
            alt={sign.name}
            fill
            className="object-contain scale-125 group-hover:scale-125 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            style={{
              // Force white background and remove any grey parts
              backgroundColor: 'white',
              filter: 'brightness(1.05) contrast(1.1)'
            }}
          />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-gradient-to-b from-orange-50 via-white to-orange-50 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            style={{ fontFamily: "arial, sans-serif" }}
            className="text-3xl sm:text-4xl font-extrabold mb-4 text-[#980d0d]"
          >
            Click on the Your Zodiac Signs to Connect with our Astrologers
          </h2>
          {/* <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Click on signs to get your free horoscope
          </p> */}
          
        </div>

        {/* Zodiac Cards grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {zodiacSigns.map((sign) => (
              <ZodiacCard key={sign.id} sign={sign} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZodiacHomePage;