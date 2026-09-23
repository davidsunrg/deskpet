import {
  IconCheck,
  IconClock,
  IconMovie,
  IconPhoto,
  IconSparkles,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { studioMedia, studioPet } from './studio-data';
import type { StudioTemplate } from './template-data';

type GeneratorKind = 'photo' | 'video';
type AspectRatio = '1:1' | '4:5' | '16:9';
type Duration = '5s' | '10s' | '15s';
type Resolution = '480p' | '720p' | '1080p';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '4:5', '16:9'];
const OUTPUT_COUNTS = [1, 2, 4] as const;
const DURATIONS: Duration[] = ['5s', '10s', '15s'];
const RESOLUTIONS: Resolution[] = ['480p', '720p', '1080p'];

export function StudioGenerator({
  kind,
  appliedTemplate,
}: {
  kind: GeneratorKind;
  appliedTemplate?: StudioTemplate;
}) {
  const defaults = appliedTemplate?.settings;
  const [prompt, setPrompt] = useState(appliedTemplate?.prompt ?? '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    isAspectRatio(defaults?.aspectRatio) ? defaults.aspectRatio : '1:1'
  );
  const [outputCount, setOutputCount] = useState(
    isOutputCount(defaults?.outputCount) ? defaults.outputCount : 1
  );
  const [duration, setDuration] = useState<Duration>(
    isDuration(defaults?.duration) ? defaults.duration : '5s'
  );
  const [resolution, setResolution] = useState<Resolution>(
    isResolution(defaults?.resolution) ? defaults.resolution : '720p'
  );
  const [audioEnabled, setAudioEnabled] = useState(
    defaults?.audioEnabled ?? true
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const preview =
    previewUrl ??
    appliedTemplate?.preview ??
    (kind === 'photo' ? studioMedia.flowers : studioMedia.interactive);
  const credits = useMemo(
    () =>
      kind === 'photo' ? outputCount * 4 : videoCredits(duration, resolution),
    [duration, kind, outputCount, resolution]
  );

  return (
    <section className="studio-generator" aria-label={`${kind} generator`}>
      <div className="studio-generator-form">
        <div className="studio-generator-title">
          <span>{kind === 'photo' ? <IconPhoto /> : <IconMovie />}</span>
          <div>
            <small>Generator</small>
            <h2>
              {kind === 'photo' ? 'Create a new photo' : 'Create a new video'}
            </h2>
          </div>
        </div>

        {appliedTemplate && (
          <div className="studio-generator-applied">
            <IconCheck />
            <span>
              <small>Template applied</small>
              <strong>{appliedTemplate.name}</strong>
            </span>
          </div>
        )}

        <div className="studio-generator-field">
          <div className="studio-generator-label">
            <label htmlFor={`${kind}-reference`}>Reference image</label>
            <span>Optional</span>
          </div>
          <div className="studio-generator-upload">
            <img src={previewUrl ?? studioPet.avatar} alt="" />
            <div>
              <strong>
                {selectedFile ? selectedFile.name : `Use ${studioPet.name}`}
              </strong>
              <small>PNG, JPG or WebP · up to 10 MB</small>
            </div>
            <label className="studio-button" htmlFor={`${kind}-reference`}>
              <IconUpload />
              {selectedFile ? 'Replace' : 'Upload'}
            </label>
            <input
              id={`${kind}-reference`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
            />
            {selectedFile && (
              <button
                type="button"
                className="studio-generator-clear"
                aria-label="Clear uploaded image"
                onClick={() => setSelectedFile(null)}
              >
                <IconX />
              </button>
            )}
          </div>
        </div>

        <div className="studio-generator-field">
          <label htmlFor={`${kind}-prompt`}>Describe what you want</label>
          <textarea
            id={`${kind}-prompt`}
            value={prompt}
            rows={4}
            placeholder={
              kind === 'photo'
                ? 'Mochi in a dreamy garden, soft afternoon light...'
                : 'Mochi looks at the camera, then runs toward the sea...'
            }
            onChange={(event) => setPrompt(event.target.value)}
          />
        </div>

        {kind === 'photo' ? (
          <div className="studio-generator-options">
            <GeneratorOption
              label="Aspect ratio"
              options={ASPECT_RATIOS}
              value={aspectRatio}
              onChange={(value) => setAspectRatio(value as AspectRatio)}
            />
            <GeneratorOption
              label="Number of photos"
              options={OUTPUT_COUNTS.map(String)}
              value={String(outputCount)}
              onChange={(value) => setOutputCount(Number(value) as 1 | 2 | 4)}
            />
          </div>
        ) : (
          <>
            <div className="studio-generator-options">
              <GeneratorOption
                label="Duration"
                options={DURATIONS}
                value={duration}
                onChange={(value) => setDuration(value as Duration)}
              />
              <GeneratorOption
                label="Resolution"
                options={RESOLUTIONS}
                value={resolution}
                onChange={(value) => setResolution(value as Resolution)}
              />
            </div>
            <button
              type="button"
              className="studio-generator-audio"
              aria-pressed={audioEnabled}
              onClick={() => setAudioEnabled((current) => !current)}
            >
              <span>
                <strong>Generate audio</strong>
                <small>Add ambient sound to the video</small>
              </span>
              <i aria-hidden="true" />
            </button>
          </>
        )}

        <div className="studio-generator-submit">
          <button
            type="button"
            className="studio-button studio-button-primary"
            onClick={() =>
              setStatus(
                `Prototype ready · Generation will use ${credits} credits`
              )
            }
          >
            <IconSparkles />
            Generate {kind}
          </button>
          <span>{credits} credits</span>
        </div>
        {status && <p className="studio-generator-status">{status}</p>}
      </div>

      <div className="studio-generator-result">
        <div className="studio-generator-result-heading">
          <div>
            <small>Preview</small>
            <strong>
              {kind === 'photo'
                ? 'Your generated photo'
                : 'Your generated video'}
            </strong>
          </div>
          <span>Placeholder</span>
        </div>
        <div
          className="studio-generator-canvas"
          data-kind={kind}
          data-ratio={kind === 'photo' ? aspectRatio : '16:9'}
        >
          <img src={preview} alt={`${kind} generation preview`} />
          {kind === 'video' && (
            <span className="studio-generator-play">
              <IconMovie />
            </span>
          )}
        </div>
        <ul className="studio-generator-summary">
          <li>
            <IconCheck />
            <span>
              <small>Pet</small>
              <strong>{studioPet.name}</strong>
            </span>
          </li>
          <li>
            <IconClock />
            <span>
              <small>{kind === 'photo' ? 'Output' : 'Duration'}</small>
              <strong>
                {kind === 'photo'
                  ? `${outputCount} photo${outputCount > 1 ? 's' : ''}`
                  : duration}
              </strong>
            </span>
          </li>
          <li>
            <IconSparkles />
            <span>
              <small>{kind === 'photo' ? 'Ratio' : 'Quality'}</small>
              <strong>{kind === 'photo' ? aspectRatio : resolution}</strong>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function GeneratorOption({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="studio-generator-option">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function videoCredits(duration: Duration, resolution: Resolution) {
  const seconds = Number.parseInt(duration, 10);
  const multiplier = resolution === '480p' ? 4 : resolution === '720p' ? 9 : 32;
  return seconds * multiplier;
}

function isAspectRatio(value: unknown): value is AspectRatio {
  return ASPECT_RATIOS.includes(value as AspectRatio);
}

function isOutputCount(value: unknown): value is 1 | 2 | 4 {
  return OUTPUT_COUNTS.includes(value as 1 | 2 | 4);
}

function isDuration(value: unknown): value is Duration {
  return DURATIONS.includes(value as Duration);
}

function isResolution(value: unknown): value is Resolution {
  return RESOLUTIONS.includes(value as Resolution);
}
