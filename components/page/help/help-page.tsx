import { HelpBanner } from './help-banner';
import { HelpQuestions } from './help-questions';
import { HelpContactUs } from './help-contact-us';

export function HelpPage() {
  return (
    <>
      <HelpBanner />
      <HelpQuestions />
      <HelpContactUs />
    </>
  );
}
