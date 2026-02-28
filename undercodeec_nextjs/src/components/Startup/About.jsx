import React, { useState } from 'react';
import Link from 'next/link';
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";

const About = ({ rtl }) => {
  const [isOpen, setOpen] = useState(false);

  const openVideo = (e) => {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <section className="about style-6" data-scroll-index="1">
      
      {
        typeof window !== "undefined" && 
          (
            <ModalVideo
              channel="youtube"
              autoplay
              isOpen={isOpen}
              videoId="pGbIOC83-So"
              onClose={() => setOpen(false)}
            />
          )
      }
      <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="bubbles rotate-center" />
    </section>
  )
}

export default About
