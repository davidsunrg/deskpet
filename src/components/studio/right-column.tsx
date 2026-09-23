import {
  IconAdjustments,
  IconCheck,
  IconDots,
  IconHeartFilled,
  IconLink,
  IconPaw,
  IconPencil,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { useState } from 'react';
import {
  StudioButton,
  StudioCardHeader,
  StudioIconButton,
} from './studio-card';
import { studioMedia, studioPet } from './studio-data';

export function InteractivePetCard() {
  return (
    <section className="studio-card studio-interactive studio-interactive-compact">
      <StudioCardHeader
        icon={<IconPaw />}
        title="Interactive DeskPet"
        action={<span className="studio-preview-label">Preview</span>}
      />
      <div className="studio-interactive-scene">
        <img
          src={studioMedia.interactive}
          alt="A miniature Mochi sitting on a desk"
          width={600}
          height={400}
        />
        <p className="studio-handwriting">
          Woof!
          <br />
          I'm always here for you! <span>♥</span>
        </p>
      </div>
      <div className="studio-interactive-actions">
        <StudioButton primary>
          <IconPlayerPlayFilled />
          Play
        </StudioButton>
        <StudioButton>
          <IconAdjustments />
          Customize
        </StudioButton>
      </div>
    </section>
  );
}

export function PetProfileCard() {
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
    <section
      className="studio-card studio-pet-profile"
      aria-label="Pet profile"
    >
      <div className="studio-pet-profile-main">
        <div className="studio-pet-title">
          <img
            className="studio-pet-profile-avatar"
            src={studioPet.avatar}
            alt=""
            width={36}
            height={36}
          />
          <h2>{studioPet.name}</h2>
          <StudioIconButton label="Edit profile">
            <IconPencil size={16} />
          </StudioIconButton>
        </div>
        <p className="studio-pet-profile-meta">
          {studioPet.age}
          <span> · </span>
          Since {studioPet.since}
        </p>
        <p className="studio-pet-note">
          {studioPet.note}
          <IconHeartFilled />
        </p>
      </div>
      <div className="studio-pet-profile-actions">
        <div className="studio-share">
          <StudioButton onClick={share}>
            {status === 'Link copied' ? <IconCheck /> : <IconLink />}
            Share {studioPet.name}
          </StudioButton>
          <output className="studio-share-status">{status}</output>
        </div>
        <StudioIconButton label="More actions">
          <IconDots />
        </StudioIconButton>
      </div>
    </section>
  );
}

export function MemorialCard() {
  return (
    <section className="studio-card studio-memorial" aria-label="Memorial">
      <div className="studio-memorial-scene">
        <img
          src={studioMedia.memorial}
          alt=""
          width={600}
          height={300}
          loading="lazy"
        />
        <p className="studio-handwriting">
          Because
          <br />
          every moment matters.
        </p>
      </div>
    </section>
  );
}
