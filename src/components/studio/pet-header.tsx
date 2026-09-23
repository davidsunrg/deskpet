import { IconCheck, IconHeartFilled, IconLink } from '@tabler/icons-react';
import { useState } from 'react';
import { StudioButton } from './studio-card';
import { studioMedia, studioPet } from './studio-data';
export function PetHeader() {
  const [status, setStatus] = useState('');
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('Link copied');
    } catch {
      setStatus('Unable to copy. Copy the address from your browser.');
    }
  }
  return (
    <section className="studio-pet-header" aria-label="Pet profile">
      <div className="studio-pet-identity">
        <img
          className="studio-pet-avatar"
          src={studioPet.avatar}
          alt={studioPet.name}
          width={120}
          height={120}
        />
        <div className="studio-pet-description">
          <div className="studio-pet-title">
            <h1>{studioPet.name}</h1>
            <div className="studio-share">
              <StudioButton onClick={share}>
                {status === 'Link copied' ? <IconCheck /> : <IconLink />}
                <span>Share {studioPet.name}</span>
              </StudioButton>
              <output className="studio-share-status">{status}</output>
            </div>
          </div>
          <p>
            {studioPet.age}
            <span> · </span>Since {studioPet.since}
          </p>
          <p className="studio-pet-note">
            {studioPet.note}
            <IconHeartFilled />
          </p>
        </div>
      </div>
      <div className="studio-pet-header-right">
        <div className="studio-pet-decoration" aria-hidden="true">
          <p className="studio-handwriting">
            Same pet,
            <br />
            More moments.
            <br />
            Always with you.
          </p>
          <img src={studioMedia.sketch} alt="" />
        </div>
      </div>
    </section>
  );
}
