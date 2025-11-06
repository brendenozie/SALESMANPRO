import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import imageCompression from 'browser-image-compression'; // Import the library
import { IPromotion } from '@/types/typings';

// ----------------------------------------------------------------------------------------------------
// TYPE DEFINITIONS (Replacing external imports)
// ----------------------------------------------------------------------------------------------------

interface IPerk {
  id: string;
  icon: 'SparklesIcon' | 'ShieldCheckIcon' | 'TagIcon' | string; // Must match getIconComponent
  label: string;
}

interface ITrustLogo {
  id: string;
  url: string;
}

// export interface IPromotion {
//   title: string;
//   description: string | null;
//   ctaText: string | null;
//   startsAt: string | Date | null;
//   endsAt: string | Date | null;
//   bannerUrl: string | null;
//   featureImage1: string | null;
//   featureImage2: string | null;
//   featureImage3: string | null;
//   perks: IPerk[];
//   trustLogos: ITrustLogo[];
//   themePrimary: string | null;
//   themeSecondary: string | null;
// }

// ----------------------------------------------------------------------------------------------------
// CORE LOGIC & ACCORDION MANAGER
// ----------------------------------------------------------------------------------------------------

// Custom hook to manage accordion state
const useAccordion = (initialIndex: number | null, count: number) => {
  const [openIndex, setOpenIndex] = useState<number | null>(initialIndex);

  useEffect(() => {
    // Automatically open the first item if there are promotions
    if (count > 0 && openIndex === null) {
      setOpenIndex(0);
    }
  }, [count, openIndex]);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return { openIndex, toggle };
};

// Helper function to render a Heroicon dynamically
const getIconComponent = (iconName: string, className: string) => {
  switch (iconName) {
    case 'SparklesIcon':
      return <SparklesIcon className={className} />;
    case 'ShieldCheckIcon':
      return <ShieldCheckIcon className={className} />;
    case 'TagIcon':
      return <TagIcon className={className} />;
    default:
      return null;
  }
};

interface PromotionsAccordionProps {
  promotions: IPromotion[] ;
  onUpdatePromotion: <K extends keyof IPromotion>(
    index: number,
    field: K,
    value: IPromotion[K],
  ) => void;
  onAddPromotion: () => void;
  onRemovePromotion: (index: number) => void;
  onImageUpload: (index: number, file: File, field?: keyof IPromotion) => void;
  onAddPerk: (promoIndex: number) => void;
  onUpdatePerk: (promoIndex: number, perkIndex: number, field: 'id' | 'icon' | 'label', value: string) => void;
  onRemovePerk: (promoIndex: number, perkIndex: number) => void;
  onAddTrustLogo: (promoIndex: number) => void;
  onUpdateTrustLogo: (promoIndex: number, logoIndex: number, field: 'id' | 'url', value: string) => void;
  onRemoveTrustLogo: (promoIndex: number, logoIndex: number) => void;
}


export default function PromotionsAccordion({
  promotions,
  onUpdatePromotion,
  onAddPromotion,
  onRemovePromotion,
  onImageUpload,
  onAddPerk,
  onUpdatePerk,
  onRemovePerk,
  onAddTrustLogo,
  onUpdateTrustLogo,
  onRemoveTrustLogo
}: PromotionsAccordionProps) {

  const { openIndex, toggle } = useAccordion(0, promotions.length);
  // NEW STATE: Track if any image compression/upload is in progress
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Automatically add the first promotion if the list is empty on mount
  useEffect(() => {
    if (promotions.length === 0) {
      onAddPromotion();
    }
  }, [onAddPromotion, promotions.length]);

  const isLastPromotionFilled =
    promotions.length > 0 && promotions[promotions.length - 1].title.trim();

  // Unified function to handle simple property updates
  const handleUpdate = <K extends keyof IPromotion>(
    index: number,
    field: K,
    value: IPromotion[K],
  ) => {
    onUpdatePromotion(index, field, value);
  };
  
  // Unified handler for image upload starting/ending from child component
  const handleImageLoadingChange = (isLoading: boolean) => {
      setIsCompressing(isLoading);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 bg-gray-50 rounded-xl shadow-lg">
      
      {/* Visual Feedback Overlay for Compression */}
      {isCompressing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3"
          >
            <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-gray-800">
              Compressing Image...
            </p>
          </div>
        </div>
      )}
      
      <header className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Create & Manage Promotions 🎨
        </h2>
        <p className="mt-2 text-gray-600 max-w-lg mx-auto">
          Effortlessly design captivating promotions with intuitive controls and real-time previews.
        </p>
      </header>
      
      {promotions.map((promo, idx) => (
        <PromotionCard
          key={idx}
          promo={promo}
          idx={idx}
          open={openIndex === idx}
          onToggle={() => toggle(idx)}
          onRemove={onRemovePromotion}
          onUpdate={handleUpdate}
          onAddPerk={onAddPerk}
          onUpdatePerk={onUpdatePerk}
          onRemovePerk={onRemovePerk}
          onAddTrustLogo={onAddTrustLogo}
          onUpdateTrustLogo={onUpdateTrustLogo}
          onRemoveTrustLogo={onRemoveTrustLogo}
          onImageUpload={onImageUpload}
          isGlobalLoading={isCompressing}
          onImageLoadingChange={handleImageLoadingChange} // Pass the handler down
        />
      ))}

      <div className="pt-4">
        <button
          type="button"
          onClick={() => {
            onAddPromotion();
            toggle(promotions.length); // Open the newly added promotion
          }}
          disabled={!isLastPromotionFilled || isCompressing} // Disable if compressing
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add a New Promotion</span>
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------------------------------

interface PromotionCardProps {
  promo: IPromotion;
  idx: number;
  open: boolean;
  onToggle: () => void;
  onRemove: (index: number) => void;
  onUpdate: <K extends keyof IPromotion>(index: number, field: K, value: IPromotion[K]) => void;
  onAddPerk: (index: number) => void;
  onUpdatePerk: (promoIndex: number, perkIndex: number, field: 'id' | 'icon' | 'label', value: string) => void;
  onRemovePerk: (promoIndex: number, perkIndex: number) => void;
  onAddTrustLogo: (index: number) => void;
  onUpdateTrustLogo: (promoIndex: number, logoIndex: number, field: 'id' | 'url', value: string) => void;
  onRemoveTrustLogo: (promoIndex: number, logoIndex: number) => void;
  onImageUpload: (index: number, file: File, field: keyof IPromotion) => void;
  isGlobalLoading: boolean; // Added prop
  onImageLoadingChange: (isLoading: boolean) => void; // Added prop
}

// The single, unified PromotionCard component
const PromotionCard: React.FC<PromotionCardProps> = ({
  promo,
  idx,
  open,
  onToggle,
  onRemove,
  onUpdate,
  onAddPerk,
  onUpdatePerk,
  onRemovePerk,
  onAddTrustLogo,
  onUpdateTrustLogo,
  onRemoveTrustLogo,
  onImageUpload,
  isGlobalLoading,
  onImageLoadingChange,
}) => {
  
  // Helper to handle image file upload while passing loading state to parent
  const handleImageFile = (file: File, field: keyof IPromotion) => {
    onImageUpload(idx, file, field);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={isGlobalLoading ? undefined : onToggle} // Prevent toggle when loading
      >
        <h3 className="text-xl font-bold text-gray-800 flex-1">
          {promo.title.trim() || `Promotion ${idx + 1}`}
        </h3>
        <div className="flex items-center space-x-4">
          <span className={clsx(
            "text-sm font-medium rounded-full px-3 py-1",
            promo.title.trim() && promo.description?.trim() ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          )}>
            {promo.title.trim() && promo.description?.trim() ? "Active" : "Incomplete"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            className="p-2 text-red-500 hover:text-red-700 transition disabled:opacity-50"
            aria-label="Remove promotion"
            disabled={isGlobalLoading}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <ChevronDownIcon
            className={clsx(
              'h-6 w-6 text-gray-600 transition-transform duration-300',
              { 'rotate-180': open },
            )}
          />
        </div>
      </div>
      
      {open && (
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Promotion Title (Required)"
              id={`title-${idx}`}
              placeholder="e.g., Summer Sale"
              value={promo.title}
              onChange={(e) => onUpdate(idx, 'title', e.target.value)}
              required
              disabled={isGlobalLoading}
            />
            <InputField
              label="Call to Action Text (Optional)"
              id={`cta-text-${idx}`}
              placeholder="e.g., Shop Now!"
              value={promo.ctaText || ''}
              onChange={(e) => onUpdate(idx, 'ctaText', e.target.value)}
              disabled={isGlobalLoading}
            />
          </div>
          <TextareaField
            label="Description (Required)"
            id={`description-${idx}`}
            placeholder="Describe the promotion in detail."
            value={promo.description || ''}
            onChange={(e) => onUpdate(idx, 'description', e.target.value)}
            required
            disabled={isGlobalLoading}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Start Date (Optional)"
              id={`startsAt-${idx}`}
              type="date"
              value={formatDate(promo.startsAt)}
              onChange={(e) => onUpdate(idx, 'startsAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
              disabled={isGlobalLoading}
            />
            <InputField
              label="End Date (Optional)"
              id={`endsAt-${idx}`}
              type="date"
              value={formatDate(promo.endsAt)}
              onChange={(e) => onUpdate(idx, 'endsAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
              disabled={isGlobalLoading}
            />
          </div>
          
          <CollapsibleSection title="Images & Assets">
            <div className="space-y-6">
              <ImageUploadField
                label="Banner Image (1920x max)"
                src={promo.bannerUrl || ''}
                onFile={(file) => handleImageFile(file, 'bannerUrl')}
                onLoadingChange={onImageLoadingChange}
              />
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <ImageUploadField
                    key={n}
                    label={`Feature Image ${n} (800x max)`}
                    src={promo[`featureImage${n}` as keyof IPromotion] as string}
                    onFile={(file) => handleImageFile(file, `featureImage${n}` as keyof IPromotion)}
                    onLoadingChange={onImageLoadingChange}
                    isSmall={true}
                  />
                ))}
              </div>
            </div>
          </CollapsibleSection>

          <PerksAndTrustSection
              promo={promo}
              idx={idx}
              onAddPerk={onAddPerk}
              onRemovePerk={onRemovePerk}
              onUpdatePerk={onUpdatePerk}
              onAddTrustLogo={onAddTrustLogo}
              onRemoveTrustLogo={onRemoveTrustLogo}
              onUpdateTrustLogo={onUpdateTrustLogo}
              isGlobalLoading={isGlobalLoading}
            />

          <CollapsibleSection title="Theme Colors">
            <div className="grid sm:grid-cols-2 gap-6">
              
              <ColorPickerField
                  label="Primary Color"
                  value={promo.themePrimary || '#6366F1'} // Indigo 500
                  onChange={(e) => onUpdate(idx, 'themePrimary', e.target.value)}
                  disabled={isGlobalLoading}
                />

                <ColorPickerField
                  label="Secondary Color"
                  value={promo.themeSecondary || '#F59E0B'} // Amber 500
                  onChange={(e) => onUpdate(idx, 'themeSecondary', e.target.value)}
                  disabled={isGlobalLoading}
                />

            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------------------------------
// Reusable Sub-Components
// ----------------------------------------------------------------------------------------------------

// NOTE: This component was missing and is re-created here for completeness.
interface PromotionsPerksSectionProps {
    promo: IPromotion;
    idx: number;
    onAddPerk: (promoIndex: number) => void;
    onUpdatePerk: (promoIndex: number, perkIndex: number, field: 'id' | 'icon' | 'label', value: string) => void;
    onRemovePerk: (promoIndex: number, perkIndex: number) => void;
    onAddTrustLogo: (promoIndex: number) => void;
    onUpdateTrustLogo: (promoIndex: number, logoIndex: number, field: 'id' | 'url', value: string) => void;
    onRemoveTrustLogo: (promoIndex: number, logoIndex: number) => void;
    isGlobalLoading: boolean;
}

const PerksAndTrustSection: React.FC<PromotionsPerksSectionProps> = ({
    promo,
    idx,
    onAddPerk,
    onUpdatePerk,
    onRemovePerk,
    onAddTrustLogo,
    onUpdateTrustLogo,
    onRemoveTrustLogo,
    isGlobalLoading,
}) => (
    <CollapsibleSection title="Perks & Trust Indicators">
        <div className="grid md:grid-cols-2 gap-8">
            <ListManager<IPerk>
                title="Customer Perks"
                items={promo.perks}
                onAdd={() => onAddPerk(idx)}
                onRemove={(perkIndex) => onRemovePerk(idx, perkIndex)}
                renderItem={(perk, perkIndex) => (
                    <div className="flex gap-2 items-center">
                        <select
                            value={perk.icon}
                            onChange={(e) => onUpdatePerk(idx, perkIndex, 'icon', e.target.value)}
                            className="w-1/3 border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                            disabled={isGlobalLoading}
                        >
                            <option value="SparklesIcon">✨ Sparkle</option>
                            <option value="ShieldCheckIcon">🛡️ Shield</option>
                            <option value="TagIcon">🏷️ Tag</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Perk label (e.g., Free Shipping)"
                            value={perk.label}
                            onChange={(e) => onUpdatePerk(idx, perkIndex, 'label', e.target.value)}
                            className="flex-1 border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                            disabled={isGlobalLoading}
                        />
                    </div>
                )}
            />
            <ListManager<ITrustLogo>
                title="Trust Logos (URLs)"
                items={promo.trustLogos}
                onAdd={() => onAddTrustLogo(idx)}
                onRemove={(logoIndex) => onRemoveTrustLogo(idx, logoIndex)}
                renderItem={(logo, logoIndex) => (
                    <input
                        type="url"
                        placeholder="Image URL for trust logo"
                        value={logo.url}
                        onChange={(e) => onUpdateTrustLogo(idx, logoIndex, 'url', e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        disabled={isGlobalLoading}
                    />
                )}
            />
        </div>
    </CollapsibleSection>
);


const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
        <ChevronDownIcon className={clsx('h-5 w-5 text-gray-400 transition-transform duration-300', { 'rotate-180': isOpen })} />
      </div>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, className, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={clsx(
        "w-full border-gray-300 bg-white rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed",
        className
      )}
    />
  </div>
);

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      rows={3}
      {...props}
      className="w-full border-gray-300 bg-white rounded-lg px-3 py-2 resize-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
    />
  </div>
);

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ label, value, onChange, disabled }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm font-medium text-gray-700 mb-2">{label}</span>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-16 h-16 rounded-xl border-2 border-gray-300 transition-colors cursor-pointer disabled:opacity-50"
      disabled={disabled}
    />
  </div>
);

interface ImageUploadFieldProps {
  label: string;
  src?: string;
  onFile: (file: File) => void;
  onLoadingChange: (isLoading: boolean) => void; // Added for global loading state
  isSmall?: boolean; // New prop for max width adjustment
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, src, onFile, onLoadingChange, isSmall = false }) => {
  const inputId = `file-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // UPDATED: Now handles compression and communicates loading state
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLocalLoading(true);
    onLoadingChange(true);

    // --- Image Compression Logic ---
    const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB
    // Banner (1920px max) vs Feature Image (800px max)
    const maxWidth = isSmall ? 800 : 1920; 

    const options = {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
    };

    try {
      console.log(`[ImageUploadField] Original size: ${(file.size / 1024).toFixed(2)} KB`);
      
      const compressedFile = await imageCompression(file, options);
      
      console.log(`[ImageUploadField] Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`);

      // Pass the *compressed* file up
      onFile(compressedFile);

    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Image compression failed. Please try another file.");
    } finally {
      // Reset input to allow re-uploading the same file
      e.target.value = ''; 
      setIsLocalLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <div
      className={clsx(
        "relative w-full aspect-[2/1] border-2 border-dashed rounded-xl flex items-center justify-center transition-all overflow-hidden bg-gray-50",
        isLocalLoading 
            ? "cursor-not-allowed border-gray-400 opacity-70" 
            : "cursor-pointer border-gray-300 hover:border-indigo-400"
      )}
      onClick={isLocalLoading ? undefined : () => document.getElementById(inputId)?.click()}
    >
      {isLocalLoading ? (
        <div className="flex flex-col items-center text-indigo-600">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
          <span className="text-sm mt-2">Processing...</span>
        </div>
      ) : src ? (
        <>
          <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">Change Image</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <PlusIcon className="h-6 w-6 mb-1" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}
      <input 
        id={inputId} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
        disabled={isLocalLoading}
      />
    </div>
  );
};

interface ListManagerProps<T> {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function ListManager<T>({ title, items, onAdd, onRemove, renderItem }: ListManagerProps<T>) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div>
      <h4 className="block text-base font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-4">
        {safeItems.map((item:any, index) => (
          <div key={item.id ?? index} className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="flex-1">{renderItem(item, index)}</div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-red-500 hover:text-red-700 transition"
              aria-label={`Remove ${title.slice(0, -1)}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition text-sm font-semibold p-1 -m-1 rounded-lg"
      >
        <PlusIcon className="h-4 w-4" />
        Add {title.slice(0, -1)}
      </button>
    </div>
  );
}


// Helper function to format dates for the input[type=date]
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  // Ensure the date is valid before trying to format it
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}