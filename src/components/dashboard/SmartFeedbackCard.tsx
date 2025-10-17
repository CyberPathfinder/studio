'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Zap, Apple, Scale, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/use-analytics';
import { useEffect, useMemo } from 'react';

const TIPS = {
  UNDERWEIGHT: [
    { icon: Apple, text: 'Добавьте в рацион больше полезных жиров: авокадо, орехи и оливковое масло.' },
    { icon: Zap, text: 'Ешьте чаще, 5-6 раз в день небольшими, но калорийными порциями.' },
    { icon: Scale, text: 'Рассмотрите возможность включения силовых тренировок для набора мышечной массы.' },
  ],
  HEALTHY: [
    { icon: BrainCircuit, text: 'Отлично! Поддерживайте сбалансированное питание и регулярную активность.' },
    { icon: Zap, text: 'Экспериментируйте с новыми полезными рецептами, чтобы разнообразить рацион.' },
    { icon: Apple, text: 'Слушайте сигналы своего тела о голоде и насыщении.' },
  ],
  OVERWEIGHT: [
    { icon: Apple, text: 'Сосредоточьтесь на цельных продуктах: овощах, фруктах и нежирном белке.' },
    { icon: Zap, text: 'Увеличьте ежедневную активность — даже 15-минутная прогулка имеет значение.' },
    { icon: Scale, text: 'Контролируйте размеры порций, чтобы создать умеренный дефицит калорий.' },
  ],
  OBESE: [
    { icon: Apple, text: 'Начните с небольших изменений: замените один сладкий напиток на воду.' },
    { icon: Scale, text: 'Поставьте себе небольшую, достижимую цель на первую неделю, например, гулять 3 раза.' },
    { icon: BrainCircuit, text: 'Рекомендуется проконсультироваться с врачом или диетологом для разработки безопасного плана.' },
  ],
};

const getBmiBand = (bmi: number): keyof typeof TIPS => {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi >= 18.5 && bmi < 25) return 'HEALTHY';
  if (bmi >= 25 && bmi < 30) return 'OVERWEIGHT';
  return 'OBESE';
};


const SmartFeedbackCard = ({ bmi, intakeData }: { bmi: number, intakeData: any }) => {
    const { track } = useAnalytics();
    
    const bmiBand = useMemo(() => getBmiBand(bmi), [bmi]);
    const tips = useMemo(() => TIPS[bmiBand], [bmiBand]);
    
    useEffect(() => {
        if (bmiBand) {
             track('smart_feedback_view', { bmiBand, tipsCount: tips.length });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bmiBand]);


  if (!bmi || !intakeData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            <CardTitle>Персональные Советы</CardTitle>
          </div>
          <CardDescription>На основе ваших данных, вот несколько рекомендаций для начала:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-primary/10 mt-1">
                    <tip.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground flex-1">{tip.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartFeedbackCard;
