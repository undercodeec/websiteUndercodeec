import React from 'react';
import teamMembers from '@/data/Saas/team.json';
import teamMembersRTL from '@/data/Saas/team-rtl.json';

const Team = ({ rtl }) => {
  const teamData = rtl ? teamMembersRTL : teamMembers;

  return (
    <section className="team section-padding style-6">
      
    </section>
  )
}

export default Team
