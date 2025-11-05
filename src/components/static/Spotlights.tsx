import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import SectionHeading from '../common/SectionHeading';

const Spotlights = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const logos = [
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698630655-rajasthan.png',
      alt: 'Life Changing Astro'
    },
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698731947-dainik.png',
      alt: 'Dainik Bhaskar'
    },
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698774218-patrika.png',
      alt: 'Rajasthan Patrika'
    },
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698486351-news18.bin',
      alt: 'News 18'
    },
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698825687-bigfm.png',
      alt: 'Jagran'
    },
    {
      src: 'https://gennextupload.s3.ap-south-1.amazonaws.com/acharyalavbhushan/spotlights/images/1760698874208-zee.bin',
      alt: 'Zee Punjabi'
    },
  ];

  // Check if animation is needed based on window width
  useEffect(() => {
    const checkWidth = () => {
      // Calculate required width: 6 logos * (192px card + 24px gap) + extra padding
      // 192px = w-48, 24px = gap-6
      const requiredWidth = 6 * (192 + 24) + 48; // 1344px minimum to fit all in one row
      setShouldAnimate(window.innerWidth < requiredWidth);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Triple duplicate for seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  // Calculate total width for animation
  const totalWidth = (192 + 24) * logos.length;

  return (
    <div className=' m-0'>
      <section className="bg-gradient-to-b from-[#f6f686] via-[#f4e4b0] to-stone-50 pt-10">
        <SectionHeading 
          tag="Media Spotlight" 
          tagColor="#7C3AED" 
          tagBg="#EDE9FE" 
          title="Featured" 
          highlight="On" 
        />

        {shouldAnimate ? (
          /* Animated Carousel - when screen is too narrow */
          <div className="overflow-hidden pb-10">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -totalWidth],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 5,
                  ease: "linear",
                },
              }}
            >
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 w-48 h-28 flex-shrink-0 flex items-center justify-center shadow-md"
                >
                  <img 
                    loading="lazy"
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Static grid - when all logos fit in one row */
          <div className="flex justify-center gap-6 px-6 pb-20">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 w-48 h-28 flex items-center justify-center shadow-md hover:scale-105 transition-all duration-300"
              >
                <img 
                  loading="lazy"
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Spotlights;