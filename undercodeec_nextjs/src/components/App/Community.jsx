import React from 'react';
import communityCards from '@/data/App/community.json';
import communityCardsrRTL from '@/data/App/community-rtl.json';

const Community = ({ rtl }) => {
  const data = rtl ? communityCardsrRTL : communityCards;

  return (
    <section className="community section-padding pt-0 style-4">
      
    </section>
  )
}

export default Community
