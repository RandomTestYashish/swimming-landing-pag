import { Greenery } from './Greenery';
import './Environment.css';

/**
 * Everything above the water: the concrete that frames the view, the
 * planting behind it, and the daylight haze that separates the two.
 */
export function Environment({ reduced }: { reduced: boolean }) {
  return (
    <div className="env" aria-hidden="true">
      <div className="env__sky" />
      <Greenery side="left" seed={11} reduced={reduced} />
      <Greenery side="right" seed={29} reduced={reduced} />
      <div className="env__haze" />
      <div className="env__pillar env__pillar--l" />
      <div className="env__pillar env__pillar--r" />
      <div className="env__grain" />
    </div>
  );
}
