import React from 'react';
import teamMembers from '@/data/Startup/team.json'
import teamMembersRTL from '@/data/Startup/team-rtl.json'

const Team = ({ rtl }) => {
  const TeamMembers = rtl ? teamMembersRTL : teamMembers;

  return (
    <section className="team section-padding style-6" data-scroll-index="7">
      
    </section>
  )
}

export default Team
