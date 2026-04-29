import { useMemo } from 'react';

const BG_VIDEO = '/media/farm-bg.mp4';
const BG_IMAGE = '/media/farm-bg.jpg';

export default function BackgroundMedia() {
  const supportsVideo = useMemo(() => typeof HTMLVideoElement !== 'undefined', []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {supportsVideo && (
        <video
          className="h-full w-full object-cover opacity-55"
          autoPlay
          muted
          loop
          playsInline
          poster={BG_IMAGE}
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
      )}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-emerald-950/80 to-cyan-950/85" />
    </div>
  );
}
