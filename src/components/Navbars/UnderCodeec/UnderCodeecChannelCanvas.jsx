"use client";

import { FaFacebookF, FaGlobe, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { PrimaryOrb } from "@/components/Primary";
import styles from "./UnderCodeecPrimaryContent.module.css";

const CHANNEL_VISUALS = {
  website: { Icon: FaGlobe, color: "#700047" },
  whatsapp: { Icon: FaWhatsapp, color: "#25D366" },
  instagram: { Icon: FaInstagram, color: "#E4405F" },
  facebook: { Icon: FaFacebookF, color: "#1877F2" },
};

export default function UnderCodeecChannelCanvas({ type }) {
  const { Icon, color } = CHANNEL_VISUALS[type] ?? CHANNEL_VISUALS.website;

  return (
    <div className={styles.channelVisual} aria-hidden="true">
      <span className={styles.channelOrbButton} style={{ "--channel-orb-color": color }}>
        <PrimaryOrb className={styles.channelOrb} color={color} />
        <Icon className={styles.channelIcon} />
      </span>
    </div>
  );
}
