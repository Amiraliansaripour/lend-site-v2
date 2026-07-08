import { HelpBanner, HelpContactUs, HelpQuestions } from '@/components/page/help';

export default function HelpPageRoute() {
  return (
    <div className='space-y-32'>
      <HelpBanner />
      <HelpQuestions />
      <HelpContactUs />
    </div>
  );
}
