/**
 * Numbered step row — visual parity with the standalone “Mockup Studio” HTML reference.
 */
export default function StudioStepHeader({ step, active, title, subtitle }) {
  return (
    <div className="studio-shdr">
      <div className={`studio-snum${active ? ' studio-snum--on' : ''}`} aria-hidden>
        {step}
      </div>
      <div className="min-w-0">
        <h2 className="studio-stitle">{title}</h2>
        {subtitle ? <p className="studio-sdesc">{subtitle}</p> : null}
      </div>
    </div>
  )
}
