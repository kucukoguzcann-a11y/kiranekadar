'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fullRentReportSchema, type FullRentReportData } from '@/validators/rent-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import FormProgress from './form-progress';
import LocationStep from './steps/location-step';
import PropertyStep from './steps/property-step';
import FeaturesStep from './steps/features-step';
import RentInfoStep from './steps/rent-info-step';
import ConfidenceStep from './steps/confidence-step';

const STEPS = [
  { title: 'Konum', description: 'İl, İlçe, Mahalle', fields: ['cityId', 'districtId', 'neighborhoodId'] },
  { title: 'Konut', description: 'Daire Özellikleri', fields: ['propertyType', 'roomCount', 'netSqm', 'grossSqm', 'buildingAgeRange', 'floorType', 'floorNumber', 'totalFloors'] },
  { title: 'Donanım', description: 'Isıtma, Tesisler, vb.', fields: ['hasElevator', 'hasParking', 'isFurnished', 'isInSite', 'hasBalcony', 'heatingType', 'hasSecurity', 'hasSocialFacility', 'isPostEarthquake'] },
  { title: 'Kira', description: 'Bedel ve Aidat', fields: ['rentAmount', 'duesAmount', 'depositAmount', 'rentType', 'contractStartMonth', 'contractStartYear'] },
  { title: 'Doğrulama', description: 'Onay ve Kaynak', fields: ['dataSourceConfidence', 'kvkkConsent'] },
];

export default function RentFormWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const paramCityId = searchParams.get('cityId') ? Number(searchParams.get('cityId')) : 0;
  const paramDistrictId = searchParams.get('districtId') ? Number(searchParams.get('districtId')) : 0;
  const paramNeighborhoodId = searchParams.get('neighborhoodId') ? Number(searchParams.get('neighborhoodId')) : 0;
  const paramRentAmount = searchParams.get('rentAmount') ? Number(searchParams.get('rentAmount')) : undefined;

  const hasPrefilledLocation = paramCityId > 0 && paramDistrictId > 0 && paramNeighborhoodId > 0;
  const [currentStep, setCurrentStep] = useState(hasPrefilledLocation ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FullRentReportData>({
    resolver: zodResolver(fullRentReportSchema) as any,
    defaultValues: {
      cityId: paramCityId,
      districtId: paramDistrictId,
      neighborhoodId: paramNeighborhoodId,
      propertyType: undefined,
      roomCount: undefined,
      netSqm: undefined as any,
      grossSqm: null,
      buildingAgeRange: undefined,
      floorType: '',
      floorNumber: null,
      totalFloors: null,
      hasElevator: false,
      hasParking: false,
      isFurnished: false,
      isInSite: false,
      hasBalcony: false,
      heatingType: undefined,
      hasSecurity: false,
      hasSocialFacility: false,
      isPostEarthquake: null,
      rentAmount: paramRentAmount as any,
      duesAmount: null,
      depositAmount: null,
      currency: 'TRY',
      rentType: undefined,
      contractStartMonth: null,
      contractStartYear: null,
      dataSourceConfidence: undefined,
      kvkkConsent: false,
    },
  });

  const nextStep = async () => {
    // Validate only current step fields before proceeding
    const fieldsToValidate = STEPS[currentStep].fields as any[];
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast.error('Lütfen zorunlu alanları doldurun.');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: FullRentReportData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rent-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Veri gönderilemedi.');
        return;
      }

      toast.success('Kira verisi başarıyla kaydedildi! Moderasyon sonrası yayınlanacaktır.');
      router.push('/analiz');
      router.refresh();
    } catch (error) {
      toast.error('Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <FormProgress currentStep={currentStep} steps={STEPS} />

      <Card className="mt-8 shadow-xl border border-border/50 overflow-hidden premium-glass rounded-2xl neon-glow">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Step Rendering */}
            <div className="animate-fade-in">
              {currentStep === 0 && <LocationStep form={form} />}
              {currentStep === 1 && <PropertyStep form={form} />}
              {currentStep === 2 && <FeaturesStep form={form} />}
              {currentStep === 3 && <RentInfoStep form={form} />}
              {currentStep === 4 && <ConfidenceStep form={form} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-border/60 pt-6 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="gap-1.5 px-5 h-11 text-xs font-bold rounded-xl bg-background/50 border-border/50 hover:bg-muted/80 hover:-translate-y-0.5 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" /> Geri
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-accent hover:bg-accent/90 text-white gap-1.5 px-6 h-11 text-xs font-bold rounded-xl shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  İleri <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5 px-7 h-11 text-xs font-bold rounded-xl shadow-lg shadow-green-600/15 hover:shadow-green-600/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor...
                    </>
                  ) : (
                    <>
                      Veriyi Kaydet <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
