'use client';

import { UseFormReturn } from 'react-hook-form';
import { FullRentReportData } from '@/validators/rent-report';
import LocationSelector from '../location-selector';

interface StepProps {
  form: UseFormReturn<FullRentReportData>;
}

export default function LocationStep({ form }: StepProps) {
  const { setValue, watch, formState: { errors } } = form;

  const cityId = watch('cityId');
  const districtId = watch('districtId');
  const neighborhoodId = watch('neighborhoodId');

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Lokasyon Bilgileri</h3>
        <p className="text-sm text-muted-foreground">
          Kira bedelini bildirmek istediğiniz konutun il, ilçe ve mahalle bilgilerini seçin.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
        <LocationSelector
          cityId={cityId}
          districtId={districtId}
          neighborhoodId={neighborhoodId}
          onCityChange={(id) => {
            setValue('cityId', id, { shouldValidate: true });
            setValue('districtId', 0);
            setValue('neighborhoodId', 0);
          }}
          onDistrictChange={(id) => {
            setValue('districtId', id, { shouldValidate: true });
            setValue('neighborhoodId', 0);
          }}
          onNeighborhoodChange={(id) => {
            setValue('neighborhoodId', id, { shouldValidate: true });
          }}
          errors={{
            cityId: errors.cityId?.message,
            districtId: errors.districtId?.message,
            neighborhoodId: errors.neighborhoodId?.message,
          }}
        />
      </div>
    </div>
  );
}
