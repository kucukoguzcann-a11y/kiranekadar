'use client';

import { UseFormReturn } from 'react-hook-form';
import { FullRentReportData } from '@/validators/rent-report';
import { DATA_SOURCE_TYPES } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  form: UseFormReturn<FullRentReportData>;
}

export default function ConfidenceStep({ form }: StepProps) {
  const { setValue, watch, formState: { errors } } = form;

  const dataSourceConfidence = watch('dataSourceConfidence');
  const kvkkConsent = watch('kvkkConsent');

  const selectSource = (value: typeof DATA_SOURCE_TYPES[number]['value']) => {
    setValue('dataSourceConfidence', value, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center md:text-left space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Güvenilirlik ve Onay</h3>
        <p className="text-sm text-muted-foreground">
          Girilen bilginin kaynağını belirterek güven puanımıza katkıda bulunun. Kişisel verileriniz asla paylaşılmaz.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-6">
        {/* Source Selection Cards */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Bu bilgiyi nereden edindiniz?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {DATA_SOURCE_TYPES.map((source) => {
              const isActive = dataSourceConfidence === source.value;
              const isBonus = source.trustBonus > 0;
              const bonusLabel = isBonus ? `+${source.trustBonus} Güven Puanı` : `${source.trustBonus} Güven Puanı`;

              return (
                <div
                  key={source.value}
                  onClick={() => selectSource(source.value)}
                  className={cn(
                    "relative flex flex-col p-5 rounded-xl border cursor-pointer select-none text-left transition-all duration-200 hover:shadow-md",
                    isActive
                      ? "border-accent bg-accent/[0.03] shadow-sm ring-2 ring-accent/10"
                      : "border-border bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={source.label}>
                      {source.icon}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {source.label}
                    </span>
                  </div>
                  
                  {/* Trust Badge */}
                  <span
                    className={cn(
                      "mt-4 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit self-start",
                      isBonus
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}
                  >
                    {bonusLabel}
                  </span>
                </div>
              );
            })}
          </div>
          {errors.dataSourceConfidence && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.dataSourceConfidence.message}</p>
          )}
        </div>

        {/* Info box about anonymity */}
        <div className="flex gap-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">Kişisel Bilgileriniz Gizli Kalır</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Kira verileri tamamen anonimleştirilir. Haritada veya analiz listesinde tam adresiniz veya e-postanız asla gösterilmez. Sadece bölge ve konut özellikleri görüntülenebilir.
            </p>
          </div>
        </div>

        {/* KVKK Consent */}
        <div className="border-t border-border/60 pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="kvkkConsent"
              checked={kvkkConsent}
              onCheckedChange={(checked) => setValue('kvkkConsent', checked === true, { shouldValidate: true })}
              className="mt-1 border-muted-foreground/40 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="kvkkConsent"
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                KiraNeKadar Aydınlatma Metnini okudum.
              </label>
              <p className="text-[10px] text-muted-foreground">
                Paylaştığım verilerin anonim olarak işlenmesini, analiz edilmesini ve platform üzerinde yayınlanmasını kabul ediyorum.
              </p>
              {errors.kvkkConsent && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.kvkkConsent.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
