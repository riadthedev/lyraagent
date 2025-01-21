"use client";
import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Add this constant at the top of the file after the supabase initialization
const CLOUDINARY_VIDEO_URL = "https://res.cloudinary.com/dgwmwxi45/video/upload/v1737427893/hero-video_tmp0jd.mp4";

export default function HeroSectionWithBeamsAndGrid() {
  const containerRef = useRef(null);
  const parentRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [email, setEmail] = useState('')
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const [waitlistCount, setWaitlistCount] = useState(0);
  const ALPHA_LIMIT = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update the useEffect to check spots on load and add debugging
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching waitlist count...');
        
        const { data, count, error } = await supabase
          .from('email_subscribers')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching count:', error);
          throw error;
        }

        console.log('Fetched count:', count);
        const currentCount = count || 0;
        setWaitlistCount(currentCount);

        setSubmitStatus({ 
          type: 'info', 
          message: 'Waitlist is now open!' 
        });
      } catch (error) {
        console.error('Error in fetchWaitlistCount:', error);
        setSubmitStatus({ 
          type: 'error', 
          message: 'Error fetching waitlist count' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);

  const toggleMute = () => {
    const video = document.getElementById('heroVideo');
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setSubmitStatus({ type: 'error', message: 'Please enter an email address' });
      return;
    }
  
    try {
      setIsSubmitting(true);
      const { error: insertError } = await supabase
        .from('email_subscribers')
        .insert([{ email }]);
  
      if (insertError) {
        // Check for the specific Supabase duplicate key error code
        if (insertError.code === '23505') {
          setSubmitStatus({ 
            type: 'error', 
            message: 'This email is already registered.' 
          });
          return;
        }
        throw insertError;
      }
  
      // If no error, update success state
      const { count: newCount } = await supabase
        .from('email_subscribers')
        .select('*', { count: 'exact' });
  
      setWaitlistCount(newCount || 0);
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for joining our waitlist!' 
      });
      setEmail('');
  
      // Send Discord webhook notification
      try {
        await fetch('https://discord.com/api/webhooks/1330993850042286204/ny6p4vKJL8I0YXKke9vJvXMyMc5TxCK6cZUBmIiVDVjdoJ68U8-auUFXuucdS-kkj9et', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `🎉 New Signup: ${email}`,
          }),
        });
      } catch (webhookError) {
        console.error('Discord webhook error:', webhookError);
        // Don't throw the error as this is not critical for the user experience
      }
  
    } catch (error) {
      console.error('Error in handleEmailSubmit:', error);
      
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    (<div
      ref={parentRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-10 pb-20 md:px-8 md:pt-20 md:pb-40">
      <nav className="left-0 right-0 z-50 flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="Lyra Logo" 
            width={32} 
            height={32}
          />
        </div>
      </nav>
      <BackgroundGrids />
      <CollisionMechanism
        beamOptions={{
          initialX: -400,
          translateX: 600,
          duration: 7,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef} />
      <CollisionMechanism
        beamOptions={{
          initialX: -200,
          translateX: 800,
          duration: 4,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef} />
      <CollisionMechanism
        beamOptions={{
          initialX: 200,
          translateX: 1200,
          duration: 5,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef} />
      <CollisionMechanism
        containerRef={containerRef}
        parentRef={parentRef}
        beamOptions={{
          initialX: 400,
          translateX: 1400,
          duration: 6,
          repeatDelay: 3,

        }} />
      <div className="text-sm text-blue-600 font-medium mb-2 relative z-50">
        World's First Instagram AI Outreach Agent
      </div>
      <h2
        className="text-balance relative z-50 mx-auto mb-4 mt-4 max-w-4xl text-center text-3xl font-semibold tracking-tight text-gray-700 dark:text-neutral-300 md:text-7xl">
        <Balancer>
          Meet <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Lyra</span>, your intelligent{" "}
          <div
            className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="text-black [text-shadow:0_0_rgba(0,0,0,0.1)] dark:text-white">
              <span className="">Instagram outreach agent</span>
            </div>
          </div>
        </Balancer>
      </h2>
      <p
        className="relative z-50 mx-auto mt-4 max-w-lg px-4 text-center text-base/6 text-gray-600 dark:text-gray-200">
        Stop wasting hours on manual outreach. Let Lyra find and engage your perfect Instagram prospects while you focus on growing your business.
      </p>
      <div className="mb-10 mt-8 flex w-full max-w-xl md:max-w-2xl flex-col items-center justify-center gap-6 px-8">
        <div className="relative z-50 rounded-full bg-white/10 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-700/50 px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Waitlist is now open
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleEmailSubmit} className="relative z-20 flex flex-col w-full items-center gap-3 md:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-neutral-200 bg-white px-6 py-4 text-base shadow-lg transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:border-blue-400"
          />
          <button 
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full md:w-auto whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Join Waitlist'}
          </button>
        </form>
        {submitStatus.message && (
          <p className={`text-sm ${submitStatus.type === 'error' ? 'text-red-500' : submitStatus.type === 'success' ? 'text-green-500' : 'text-blue-500'} relative z-50`}>
            {submitStatus.message}
          </p>
        )}
        <button className="relative z-30 flex items-center gap-2 text-xl font-extrabold mt-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent [text-shadow:0_2px_10px_rgba(59,130,246,0.2)]">
            Watch Demo
          </span>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="animate-bounce"
          >
            <path 
              d="M8 3v10M4 9l4 4 4-4" 
              stroke="url(#gradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="gradient" x1="4" y1="3" x2="12" y2="13">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#9333ea" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-7xl rounded-[32px] border border-neutral-200/50 bg-neutral-100 p-2 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/50 md:p-4">
        <div
          className="relative rounded-[24px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-black">
          <video
            src={`${CLOUDINARY_VIDEO_URL}?quality=auto:best&format=auto`}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            id="heroVideo"
            className="rounded-[20px] w-full h-auto"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => {
                const video = document.getElementById('heroVideo');
                if (video) {
                  video.currentTime = 0;
                  video.play();
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M1 4v16L8 4v16L15 4v16L22 4v16"/>
              </svg>
              Restart
            </button>
            <button 
              onClick={toggleMute}
              className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              Fullscreen
            </button>
          </div>
        </div>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © 2025 Lyra. All rights reserved.
      </footer>
    </div>)
  );
}

const BackgroundGrids = () => {
  return (
    (<div
      className="pointer-events-none absolute inset-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 md:grid-cols-4">
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div
        className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
    </div>)
  );
};

const CollisionMechanism = React.forwardRef(({ parentRef, containerRef, beamOptions = {} }, ref) => {
  const beamRef = useRef(null);
  const [collision, setCollision] = useState({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX =
            beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          });
          setCycleCollisionDetected(true);
          if (beamRef.current) {
            beamRef.current.style.opacity = "0";
          }
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);

    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
        // Set beam opacity to 0
        if (beamRef.current) {
          beamRef.current.style.opacity = "1";
        }
      }, 2000);

      // Reset the beam animation after a delay
      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1);
      }, 2000);
    }
  }, [collision]);

  return (<>
    <motion.div
      key={beamKey}
      ref={beamRef}
      animate="animate"
      initial={{
        translateY: beamOptions.initialY || "-200px",
        translateX: beamOptions.initialX || "0px",
        rotate: beamOptions.rotate || -45,
      }}
      variants={{
        animate: {
          translateY: beamOptions.translateY || "800px",
          translateX: beamOptions.translateX || "700px",
          rotate: beamOptions.rotate || -45,
        },
      }}
      transition={{
        duration: beamOptions.duration || 8,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay: beamOptions.delay || 0,
        repeatDelay: beamOptions.repeatDelay || 0,
      }}
      className={cn(
        "absolute left-96 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-blue-500 via-purple-500 to-transparent",
        beamOptions.className
      )} />
    <AnimatePresence>
      {collision.detected && collision.coordinates && (
        <Explosion
          key={`${collision.coordinates.x}-${collision.coordinates.y}`}
          className=""
          style={{
            left: `${collision.coordinates.x + 20}px`,
            top: `${collision.coordinates.y}px`,
            transform: "translate(-50%, -50%)",
          }} />
      )}
    </AnimatePresence>
  </>);
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({
  ...props
}) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }));

  return (
    (<div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-[4px] w-10 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm"></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
      ))}
    </div>)
  );
};

const GridLineVertical = ({
  className,
  offset
}) => {
  return (
    (<div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",

          //-100px if you want to keep the line inside
          "--offset": offset || "150px",

          "--color-dark": "rgba(255, 255, 255, 0.3)",
          maskComposite: "exclude"
        }
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className
      )}></div>)
  );
};
