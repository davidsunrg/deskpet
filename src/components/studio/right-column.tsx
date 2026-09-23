import {
  IconAdjustments,
  IconHeartFilled,
  IconPaw,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { StudioButton, StudioCardHeader } from './studio-card';
import { studioMedia } from './studio-data';
export function InteractivePetCard() {
  return (
    <section className="studio-card studio-interactive">
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
          I'm always
          <br />
          here for you! <span>♥</span>
        </p>
      </div>
      <div className="studio-interactive-actions">
        <StudioButton primary>
          <IconPlayerPlayFilled />
          Play Animation
        </StudioButton>
        <StudioButton>
          <IconAdjustments />
          Customize
        </StudioButton>
      </div>
    </section>
  );
}
export function MemorialCard() {
  return (
    <section className="studio-card studio-memorial">
      <div className="studio-memorial-heading">
        <span>
          <IconHeartFilled />
        </span>
        <div>
          <h2>Memorial Mode</h2>
          <p>Keep their memory alive, forever.</p>
        </div>
      </div>
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
