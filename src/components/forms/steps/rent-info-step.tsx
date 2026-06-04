'use client';

import { UseFormReturn } from 'react-hook-form';
import { FullRentReportData } from '@/validators/rent-report';
import { RENT_TYPES, MONTHS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, FileText, CalendarRange } from 'lucide-react';

interface StepProps {
  form: UseFormReturn<FullRentReportData>;
}

export default function RentInfoStep({ form }: StepProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  const rentType = watch('rentType');
  const contractStartMonth = watch('contractStartMonth');
  const contractStartYear = watch('contractStartYear');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center md:text-left space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Kira ve Kontrat Bilgileri</h3>
        <p className="text-sm text-muted-foreground">
          Ödenen kira bedelini, aidatı, depozitoyu ve kontrat imzalama tarihini belirtin.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rent Amount */}
          <div className="space-y-2">
            <Label htmlFor="rentAmount" className="flex items-center gap-1.5 text-sm font-medium">
              <Coins className="h-4 w-4 text-accent" />
              Aylık Kira Bedeli (TL)
            </Label>
            <div className="relative">
              <Input
                id="rentAmount"
                type="number"
                placeholder="Örn: 20000"
                className="pr-12 hover:border-accent/40 focus:border-accent"
                {...register('rentAmount', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                TL
              </span>
            </div>
            {errors.rentAmount && <p className="text-xs text-destructive font-medium">{errors.rentAmount.message}</p>}
          </div>

          {/* Dues Amount */}
          <div className="space-y-2">
            <Label htmlFor="duesAmount" className="flex items-center gap-1.5 text-sm font-medium">
              <Coins className="h-4 w-4 text-accent/60" />
              Aylık Aidat (TL - Opsiyonel)
            </Label>
            <div className="relative">
              <Input
                id="duesAmount"
                type="number"
                placeholder="Örn: 1500"
                className="pr-12 hover:border-accent/40 focus:border-accent"
                {...register('duesAmount', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                TL
              </span>
            </div>
            {errors.duesAmount && <p className="text-xs text-destructive font-medium">{errors.duesAmount.message}</p>}
          </div>

          {/* Deposit Amount */}
          <div className="space-y-2">
            <Label htmlFor="depositAmount" className="flex items-center gap-1.5 text-sm font-medium">
              <Coins className="h-4 w-4 text-accent/40" />
              Depozito (TL - Opsiyonel)
            </Label>
            <div className="relative">
              <Input
                id="depositAmount"
                type="number"
                placeholder="Örn: 40000"
                className="pr-12 hover:border-accent/40 focus:border-accent"
                {...register('depositAmount', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                TL
              </span>
            </div>
            {errors.depositAmount && <p className="text-xs text-destructive font-medium">{errors.depositAmount.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rent Type */}
          <div className="space-y-2">
            <Label htmlFor="rentType" className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="h-4 w-4 text-accent" />
              Kira Durumu (Veri Tipi)
            </Label>
            <Select
              value={rentType}
              onValueChange={(val) => setValue('rentType', val as any, { shouldValidate: true })}
            >
              <SelectTrigger id="rentType">
                <SelectValue placeholder="Kira tipini seçin">
                  {RENT_TYPES.find(t => t.value === rentType)?.label || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-xs text-foreground">{type.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rentType && <p className="text-xs text-destructive font-medium">{errors.rentType.message}</p>}
          </div>

          {/* Contract Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarRange className="h-4 w-4 text-accent" />
              Kontrat Başlangıç Tarihi (Opsiyonel)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Month */}
              <Select
                value={contractStartMonth ? String(contractStartMonth) : undefined}
                onValueChange={(val) => setValue('contractStartMonth', Number(val), { shouldValidate: true })}
              >
                <SelectTrigger id="contractMonth">
                  <SelectValue placeholder="Ay">
                    {contractStartMonth ? MONTHS[Number(contractStartMonth) - 1] : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {MONTHS.map((month, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year */}
              <Select
                value={contractStartYear ? String(contractStartYear) : undefined}
                onValueChange={(val) => setValue('contractStartYear', Number(val), { shouldValidate: true })}
              >
                <SelectTrigger id="contractYear">
                  <SelectValue placeholder="Yıl">
                    {contractStartYear ? String(contractStartYear) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(errors.contractStartMonth || errors.contractStartYear) && (
              <p className="text-xs text-destructive font-medium">Lütfen geçerli bir kontrat tarihi seçin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
