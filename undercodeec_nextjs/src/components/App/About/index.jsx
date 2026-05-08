import React from 'react';
import aboutData from '@/data/App/about.json';

import FirstContent from './FirstContent';
import SecondContent from './SecondContent';
import ThirdContent from './ThirdContent';
import Integration from './Integration';

const About = ({ noFirstContent, noIntegration, noWave }) => {
  const data = aboutData;

  return (
    <section className={`about ${noWave ? '':'section-padding'} style-4`}>
      {
        !noFirstContent && (<FirstContent features={data.features} />)
      }
      <SecondContent accordions={data.accordions} />
      <ThirdContent features={data.thirdFeatures} />
      {
        !noIntegration && (<Integration integrations={data.integrations} />)
      }
      {
        !noWave && (
          <>
            <img src="/assets/img/about/about_s4_wave.png" alt="" className="top-wave" />
            <img src="/assets/img/about/about_s4_wave.png" alt="" className="bottom-wave" />
          </>
        )
      }
    </section>
  )
}

export default About
