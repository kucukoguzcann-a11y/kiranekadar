import { z } from 'zod';

export const locationSchema = z.object({
  cityId: z.number({ required_error: 'İl seçimi zorunludur' }).min(1, 'İl seçiniz'),
  districtId: z.number({ required_error: 'İlçe seçimi zorunludur' }).min(1, 'İlçe seçiniz'),
  neighborhoodId: z.number({ required_error: 'Mahalle seçimi zorunludur' }).min(1, 'Mahalle seçiniz'),
});

export const propertySchema = z.object({
  propertyType: z.enum(['daire', 'rezidans', 'mustakil', 'villa', 'studyo', 'apart'], {
    required_error: 'Konut tipi seçiniz',
  }),
  roomCount: z.enum(['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'], {
    required_error: 'Oda sayısı seçiniz',
  }),
  netSqm: z.number({ required_error: 'Net m² zorunludur' })
    .min(10, 'Net m² en az 10 olmalıdır')
    .max(1000, 'Net m² en fazla 1000 olabilir'),
  grossSqm: z.number().min(10).max(1500).optional().nullable(),
  buildingAgeRange: z.enum(['0', '1-5', '6-10', '11-15', '16-20', '21-30', '30+'], {
    required_error: 'Bina yaşı seçiniz',
  }),
  floorType: z.string({ required_error: 'Kat bilgisi seçiniz' }).min(1, 'Kat bilgisi seçiniz'),
  floorNumber: z.number().optional().nullable(),
  totalFloors: z.number().min(1).max(100).optional().nullable(),
});

export const featuresSchema = z.object({
  hasElevator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  isFurnished: z.boolean().default(false),
  isInSite: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  heatingType: z.enum(['kombi', 'merkezi', 'klima', 'soba', 'yerden', 'diger'], {
    required_error: 'Isıtma tipi seçiniz',
  }),
  hasSecurity: z.boolean().default(false),
  hasSocialFacility: z.boolean().default(false),
  isPostEarthquake: z.boolean().optional().nullable(),
});

export const rentInfoSchema = z.object({
  rentAmount: z.number({ required_error: 'Kira tutarı zorunludur' })
    .min(1, 'Kira tutarı 0 olamaz')
    .max(1000000, 'Kira tutarı çok yüksek'),
  duesAmount: z.number().min(0, 'Aidat negatif olamaz').optional().nullable(),
  depositAmount: z.number().min(0).optional().nullable(),
  currency: z.string().default('TRY'),
  rentType: z.enum(['actual_paid', 'new_contract', 'old_contract', 'asking_price', 'estimated'], {
    required_error: 'Kira tipi seçiniz',
  }),
  contractStartMonth: z.number().min(1).max(12).optional().nullable(),
  contractStartYear: z.number().min(2015).max(new Date().getFullYear()).optional().nullable(),
});

export const confidenceSchema = z.object({
  dataSourceConfidence: z.enum(['self', 'close_contact', 'realtor', 'listing', 'estimate'], {
    required_error: 'Veri kaynağı seçiniz',
  }),
  kvkkConsent: z.boolean().refine(val => val === true, {
    message: 'KVKK onayı zorunludur',
  }),
});

export const fullRentReportSchema = locationSchema
  .merge(propertySchema)
  .merge(featuresSchema)
  .merge(rentInfoSchema)
  .merge(confidenceSchema);

export type LocationFormData = z.infer<typeof locationSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type FeaturesFormData = z.infer<typeof featuresSchema>;
export type RentInfoFormData = z.infer<typeof rentInfoSchema>;
export type ConfidenceFormData = z.infer<typeof confidenceSchema>;
export type FullRentReportData = z.infer<typeof fullRentReportSchema>;
