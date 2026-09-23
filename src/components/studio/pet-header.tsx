import {
  IconCheck,
  IconHeartFilled,
  IconLink,
  IconPencil,
} from '@tabler/icons-react';
import { useState } from 'react';
import { StudioButton, StudioIconButton } from './studio-card';
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
      <img
        className="studio-pet-avatar"
        src={studioPet.avatar}
        alt={studioPet.name}
        width={170}
        height={170}
      />
      <div className="studio-pet-description">
        <div className="studio-pet-title">
          <h1>{studioPet.name}</h1>
          <StudioIconButton label="Edit profile (coming soon)" disabled>
            <IconPencil size={18} />
          </StudioIconButton>
        </div>
        <p>
          {studioPet.breed}
          <span> · </span>
          {studioPet.age}
          <span> · </span>Since {studioPet.since}
        </p>
        <p className="studio-pet-note">
          {studioPet.note}
          <IconHeartFilled />
        </p>
      </div>
      <div className="studio-pet-decoration" aria-hidden="true">
        <p className="studio-handwriting">
          Same pet,
          <br />
          More memories.
          <br />
          Always with you.
        </p>
        <img src={studioMedia.sketch} alt="" />
      </div>
      <div className="studio-share">
        <StudioButton onClick={share}>
          {status === 'Link copied' ? <IconCheck /> : <IconLink />}Share{' '}
          {studioPet.name}
        </StudioButton>
        <span role="status">{status}</span>
      </div>
    </section>
  );
}
