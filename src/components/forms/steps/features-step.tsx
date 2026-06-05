'use client';

import { UseFormReturn } from 'react-hook-form';
import { FullRentReportData } from '@/validators/rent-report';
import { HEATING_TYPES } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Flame, Compass, Car, Sparkles, Home, ShieldCheck, Dumbbell, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  form: UseFormReturn<FullRentReportData>;
}

export default function FeaturesStep({ form }: StepProps) {
  const { setValue, watch, formState: { errors } } = form;

  const heatingType = watch('heatingType');
  const hasElevator = watch('hasElevator');
  const hasParking = watch('hasParking');
  const isFurnished = watch('isFurnished');
  const isInSite = watch('isInSite');
  const hasBalcony = watch('hasBalcony');
  const hasSecurity = watch('hasSecurity');
  const hasSocialFacility = watch('hasSocialFacility');
  const isPostEarthquake = watch('isPostEarthquake');

  // Toggle helper
  const toggleField = (field: keyof FullRentReportData) => {
    setValue(field, !watch(field) as any, { shouldValidate: true });
  };

  const featureItems = [
    { id: 'hasElevator', label: 'Asansör Var', icon: Compass, active: hasElevator },
    { id: 'hasParking', label: 'Otopark Var', icon: Car, active: hasParking },
    { id: 'isFurnished', label: 'Eşyalı', icon: Sparkles, active: isFurnished },
    { id: 'isInSite', label: 'Site İçerisinde', icon: Home, active: isInSite },
    { id: 'hasBalcony', label: 'Balkon Var', icon: Compass, active: hasBalcony },
    { id: 'hasSecurity', label: 'Güvenlik / Kamera', icon: ShieldCheck, active: hasSecurity },
    { id: 'hasSocialFacility', label: 'Sosyal Tesis', icon: Dumbbell, active: hasSocialFacility },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center md:text-left space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Bina ve Konut Donanımları</h3>
        <p className="text-sm text-muted-foreground">
          Konutun ve binanın sahip olduğu teknik donanımları ve sosyal imkanları işaretleyin.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-6 premium-glass">
        {/* Heating Type */}
        <div className="space-y-2 max-w-md">
          <Label htmlFor="heatingType" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Flame className="h-4 w-4 text-accent" />
            Isıtma Tipi
          </Label>
          <Select
            value={heatingType}
            onValueChange={(val) => setValue('heatingType', val as any, { shouldValidate: true })}
          >
            <SelectTrigger id="heatingType" className="bg-background/50 dark:bg-zinc-900/30 border-border/50 text-xs">
              <SelectValue placeholder="Isıtma tipi seçin">
                {HEATING_TYPES.find(t => t.value === heatingType)?.label || undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              {HEATING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.heatingType && <p className="text-xs text-destructive font-medium">{errors.heatingType.message}</p>}
        </div>

        {/* Feature Grid */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-foreground">Özellikler</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleField(item.id as any)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all duration-250 card-hover bg-background/50 dark:bg-zinc-900/20",
                    item.active
                      ? "border-accent/40 bg-accent/[0.03] text-accent shadow-xs"
                      : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      item.active ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn("text-xs font-semibold", item.active ? "text-foreground font-bold" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                  </div>
                  <Switch
                    checked={!!item.active}
                    onCheckedChange={() => toggleField(item.id as any)}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Earthquake Resilience (Toggle Button style) */}
        <div className="border-t border-border/60 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Deprem Sonrası Yapı (1999 Sonrası)
              </Label>
              <p className="text-xs text-muted-foreground">
                Binanın 1999 yılındaki deprem yönetmeliğinden sonra yapılıp yapılmadığını belirtin.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setValue('isPostEarthquake', true, { shouldValidate: true })}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium border transition-colors w-full sm:w-auto text-center justify-center flex items-center",
                  isPostEarthquake === true
                    ? "bg-accent border-accent text-white"
                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                )}
              >
                Evet (1999 Sonrası)
              </button>
              <button
                type="button"
                onClick={() => setValue('isPostEarthquake', false, { shouldValidate: true })}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium border transition-colors w-full sm:w-auto text-center justify-center flex items-center",
                  isPostEarthquake === false
                    ? "bg-destructive border-destructive text-white"
                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                )}
              >
                Hayır (1999 Öncesi)
              </button>
              <button
                type="button"
                onClick={() => setValue('isPostEarthquake', null, { shouldValidate: true })}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium border transition-colors w-full sm:w-auto text-center justify-center flex items-center",
                  isPostEarthquake === null || isPostEarthquake === undefined
                    ? "bg-muted border-muted-foreground/30 text-foreground"
                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                )}
              >
                Bilmiyorum
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
