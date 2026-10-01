import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';

/**
 * One icon family (Phosphor), one stroke weight, used everywhere.
 * Nothing on this page draws its own SVG paths.
 */
export function Arrow({ back = false }: { back?: boolean }) {
  const Icon = back ? ArrowLeft : ArrowRight;
  return <Icon size={18} weight="light" aria-hidden="true" className="ui-arrow" />;
}
