
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription } from '@/lib/i18n';

const BmiCategoryIndicator = ({ bmi, healthyMin, healthyMax } : { bmi: number, healthyMin: number, healthyMax: number }) => {
  if (!bmi) return null;

  let category = '';
  let color = 'bg-gray-400';

  if (bmi < 18.5) {
      category = 'Underweight';
      color = 'bg-blue-400';
  } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Healthy';
      color = 'bg-green-500';
  } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'bg-yellow-400';
  } else if (bmi >= 30 && bmi < 35) {
      category = 'Obese I';
      color = 'bg-orange-500';
  } else if (bmi >= 35 && bmi < 40) {
      category = 'Obese II';
      color = 'bg-red-500';
  } else {
      category = 'Obese III';
      color = 'bg-red-700';
  }
  
  const leftPercent = Math.max(0, Math.min(100, (bmi - 16) / (40 - 16) * 100));

  return (
    <div className="relative" style={{ left: `${leftPercent}%`}}>
      <div className="absolute -translate-x-1/2 -top-8 w-max text-center">
        <div className={`text-sm font-bold px-2 py-0.5 rounded-full text-white ${color}`}>
            {category}
        </div>
        <div className="w-0.5 h-2 bg-foreground mx-auto mt-1"></div>
      </div>
    </div>
  );
};


const ChartBmi = ({ question }: { question: Question }) => {
  const { state } = useQuizEngine();
  const bmi = state.answers['bmi_calc'];
  const healthyZone = question.ui?.healthy_zone || [18.5, 24.9];
  const range = question.ui?.range || [16, 40];
  
  const healthyZoneStartPercent = (healthyZone[0] - range[0]) / (range[1] - range[0]) * 100;
  const healthyZoneWidthPercent = (healthyZone[1] - healthyZone[0]) / (range[1] - range[0]) * 100;

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription className="mt-2">{getDescription(question)}</CardDescription>}
      </CardHeader>
      
      <div className="relative h-8 w-full rounded-full bg-gradient-to-r from-blue-300 via-yellow-300 to-red-500 overflow-hidden">
        <div 
          className="absolute h-full bg-green-400/80" 
          style={{ left: `${healthyZoneStartPercent}%`, width: `${healthyZoneWidthPercent}%`}}
        ></div>
        {bmi && <BmiCategoryIndicator bmi={bmi} healthyMin={healthyZone[0]} healthyMax={healthyZone[1]} />}
      </div>
       <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{range[0]}</span>
            <span>{healthyZone[0]}</span>
            <span>{healthyZone[1]}</span>
            <span>{range[1]}</span>
       </div>
       <p className="text-xs text-muted-foreground mt-4">Source: {question.source}</p>
    </div>
  );
};

export default ChartBmi;
