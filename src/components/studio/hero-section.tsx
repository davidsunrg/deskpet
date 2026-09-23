import { StudioCardHeader } from './studio-card';
import { studioMedia } from './studio-data';
export function DesktopPetCard() {
  return (
    <section className="studio-desktop-pet" aria-label="Desktop pet preview">
      <img
        src={studioMedia.desktop}
        alt="Mochi relaxing in a pet bed on a sunlit desk"
        width={640}
        height={640}
      />
      <p className="studio-handwriting studio-desktop-caption">
        Your custom
        <br />
        Desktop Pet
      </p>
    </section>
  );
}
export function RecentCreations() {
  return (
    <section className="studio-card studio-recent">
      <StudioCardHeader title="Recent Creations" />
      <div className="studio-creations">
        {[
          { src: studioMedia.flowers, alt: 'Mochi among spring blossoms' },
          { src: studioMedia.hiking, alt: 'Mochi exploring the mountains' },
          { src: studioMedia.beach, alt: 'Mochi at the beach' },
        ].map((item) => (
          <img
            key={item.src}
            {...item}
            width={160}
            height={160}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
