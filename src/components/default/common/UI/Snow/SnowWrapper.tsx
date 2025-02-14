'use client';
import { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import zIndex from '@mui/material/styles/zIndex';

const options: any = {
  background: {
    color: 'transparent',
  },
  fullScreen: {
    zIndex: 3000,
  },
  particles: {
    color: {
      value: '#fff',
    },
    move: {
      direction: 'bottom',
      enable: true,
      outModes: 'out',
      speed: 2,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 400,
    },
    opacity: {
      value: 0.7,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: 5,
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 10,
    },
    zIndex: {
      value: {
        min: 0,
        max: 100,
      },
    },
  },
};

export default function SnowWrapper({ children }: PropsWithChildren) {
  const [init, setInit] = useState(false);
  const activeMonths = [11, 0, 1];
  const month = new Date().getMonth();
  const isActive = activeMonths.includes(month);
  useEffect(() => {
    if (isActive) {
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
      });
    }
  }, [isActive]);

  return (
    <>
      {children}
      {init && (
        <Particles id='tsparticles' style={{ zIndex: '10000 !important' }} options={options} />
      )}
    </>
  );
}
