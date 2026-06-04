'use client';

import { UseFormReturn } from 'react-hook-form';
import { FullRentReportData } from '@/validators/rent-report';
import { PROPERTY_TYPES, ROOM_COUNTS, BUILDING_AGES, FLOOR_TYPES } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Layers, Maximize, Calendar } from 'lucide-react';

interface StepProps {
  form: UseFormReturn<FullRentReportData>;
}

export default function PropertyStep({ form }: StepProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  const propertyType = watch('propertyType');
  const roomCount = watch('roomCount');
  const buildingAgeRange = watch('buildingAgeRange');
  const floorType = watch('floorType');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center md:text-left space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Konut Özellikleri</h3>
        <p className="text-sm text-muted-foreground">
          Konutun fiziksel durumunu, oda sayısını, katını ve metrekaresini belirtin.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="h-4 w-4 text-accent" />
              Konut Tipi
            </Label>
            <Select
              value={propertyType}
              onValueChange={(val) => setValue('propertyType', val as any, { shouldValidate: true })}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Konut tipi seçin">
                  {PROPERTY_TYPES.find(t => t.value === propertyType)?.label || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType && <p className="text-xs text-destructive font-medium">{errors.propertyType.message}</p>}
          </div>

          {/* Room Count */}
          <div className="space-y-2">
            <Label htmlFor="roomCount" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="h-4 w-4 text-accent/80" />
              Oda Sayısı
            </Label>
            <Select
              value={roomCount}
              onValueChange={(val) => setValue('roomCount', val as any, { shouldValidate: true })}
            >
              <SelectTrigger id="roomCount">
                <SelectValue placeholder="Oda sayısı seçin">
                  {ROOM_COUNTS.find(r => r.value === roomCount)?.label || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROOM_COUNTS.map((room) => (
                  <SelectItem key={room.value} value={room.value}>
                    {room.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomCount && <p className="text-xs text-destructive font-medium">{errors.roomCount.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Net Sqm */}
          <div className="space-y-2">
            <Label htmlFor="netSqm" className="flex items-center gap-1.5 text-sm font-medium">
              <Maximize className="h-4 w-4 text-accent" />
              Net Metrekare (m²)
            </Label>
            <Input
              id="netSqm"
              type="number"
              placeholder="Örn: 90"
              className="hover:border-accent/40 focus:border-accent"
              {...register('netSqm', { valueAsNumber: true })}
            />
            {errors.netSqm && <p className="text-xs text-destructive font-medium">{errors.netSqm.message}</p>}
          </div>

          {/* Gross Sqm */}
          <div className="space-y-2">
            <Label htmlFor="grossSqm" className="flex items-center gap-1.5 text-sm font-medium">
              <Maximize className="h-4 w-4 text-accent/60" />
              Brüt Metrekare (m² - Opsiyonel)
            </Label>
            <Input
              id="grossSqm"
              type="number"
              placeholder="Örn: 110"
              className="hover:border-accent/40 focus:border-accent"
              {...register('grossSqm', { valueAsNumber: true })}
            />
            {errors.grossSqm && <p className="text-xs text-destructive font-medium">{errors.grossSqm.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Building Age */}
          <div className="space-y-2">
            <Label htmlFor="buildingAge" className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="h-4 w-4 text-accent" />
              Bina Yaşı
            </Label>
            <Select
              value={buildingAgeRange}
              onValueChange={(val) => setValue('buildingAgeRange', val as any, { shouldValidate: true })}
            >
              <SelectTrigger id="buildingAge">
                <SelectValue placeholder="Bina yaşı seçin">
                  {BUILDING_AGES.find(a => a.value === buildingAgeRange)?.label || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BUILDING_AGES.map((age) => (
                  <SelectItem key={age.value} value={age.value}>
                    {age.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.buildingAgeRange && <p className="text-xs text-destructive font-medium">{errors.buildingAgeRange.message}</p>}
          </div>

          {/* Floor Type */}
          <div className="space-y-2">
            <Label htmlFor="floorType" className="flex items-center gap-1.5 text-sm font-medium">
              <Layers className="h-4 w-4 text-accent" />
              Bulunduğu Kat
            </Label>
            <Select
              value={floorType}
              onValueChange={(val) => setValue('floorType', val || '', { shouldValidate: true })}
            >
              <SelectTrigger id="floorType">
                <SelectValue placeholder="Kat seçin">
                  {FLOOR_TYPES.find(f => f.value === floorType)?.label || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FLOOR_TYPES.map((floor) => (
                  <SelectItem key={floor.value} value={floor.value}>
                    {floor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.floorType && <p className="text-xs text-destructive font-medium">{errors.floorType.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Floor Number */}
          <div className="space-y-2">
            <Label htmlFor="floorNumber" className="flex items-center gap-1.5 text-sm font-medium">
              <Layers className="h-4 w-4 text-accent/80" />
              Daire Numarası (Kat No - Opsiyonel)
            </Label>
            <Input
              id="floorNumber"
              type="number"
              placeholder="Örn: 4"
              {...register('floorNumber', { valueAsNumber: true })}
            />
            {errors.floorNumber && <p className="text-xs text-destructive font-medium">{errors.floorNumber.message}</p>}
          </div>

          {/* Total Floors */}
          <div className="space-y-2">
            <Label htmlFor="totalFloors" className="flex items-center gap-1.5 text-sm font-medium">
              <Layers className="h-4 w-4 text-accent/60" />
              Binadaki Toplam Kat Sayısı (Opsiyonel)
            </Label>
            <Input
              id="totalFloors"
              type="number"
              placeholder="Örn: 8"
              {...register('totalFloors', { valueAsNumber: true })}
            />
            {errors.totalFloors && <p className="text-xs text-destructive font-medium">{errors.totalFloors.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
