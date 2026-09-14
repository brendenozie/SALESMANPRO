'use client';

import React from 'react';
import UniversalFeaturesSection, { UniversalFeaturesSectionProps } from '@/components/site/shared/UniversalFeaturesSection';
import { useStoreContext } from '@/contexts/StoreContext';

export default function FeaturesSection(props: UniversalFeaturesSectionProps) {
  const { storeFormData } = useStoreContext();
  const themeSettings = props.themeSettings || storeFormData?.themeSettings;
  return (
    <UniversalFeaturesSection
      componentKey="FeaturesSection"
      sectionId="features"
      themeSettings={themeSettings}
      {...props}
    />
  );
}
