import React from 'react';
import aboutData from '@/data/Saas/about.json';

import Content1 from './Content1';
import Content2 from './Content2';
import Content3 from './Content3';

const About = ({ noPaddingTop }) => {
  const data = aboutData;

  return (
    <section className={`about ${noPaddingTop ? 'pt-0 pb-150':'section-padding'} style-5`} data-scroll-index="1">
      <Content1 links={data.lineLinks} />
      <Content2 list={data.list} />
      <Content3 texts={data.texts} webLinks={data.webLinks || []} number={aboutData.number} />
    </section>
  )
}

export default About
