import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { IPromotion } from '@/types/typings';

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
  promotions: IPromotion[];
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

  // Automatically add the first promotion if the list is empty on mount
  useEffect(() => {
    if (promotions.length === 0) {
      onAddPromotion();
    }
  }, []); // Note: Empty dependency array ensures this runs only once.

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 bg-gray-50 rounded-xl shadow-lg">
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
        />
      ))}

      <div className="pt-4">
        <button
          type="button"
          onClick={() => {
            onAddPromotion();
            toggle(promotions.length); // Open the newly added promotion
          }}
          disabled={!isLastPromotionFilled}
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
  onImageUpload: (index: number, file: File, field?: keyof IPromotion) => void;
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
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-xl font-bold text-gray-800 flex-1">
          {promo.title.trim() || `Promotion ${idx + 1}`}
        </h3>
        <div className="flex items-center space-x-4">
          <span className={clsx(
            "text-sm font-medium",
            promo.title.trim() && promo.description?.trim() ? "text-green-600" : "text-yellow-600"
          )}>
            {promo.title.trim() && promo.description?.trim() ? "Complete" : "Draft"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            className="p-2 text-red-500 hover:text-red-700 transition"
            aria-label="Remove promotion"
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
              label="Promotion Title"
              id={`title-${idx}`}
              placeholder="e.g., Summer Sale"
              value={promo.title}
              onChange={(e) => onUpdate(idx, 'title', e.target.value)}
              required
            />
            <InputField
              label="Call to Action Text"
              id={`cta-text-${idx}`}
              placeholder="e.g., Shop Now!"
              value={promo.ctaText || ''}
              onChange={(e) => onUpdate(idx, 'ctaText', e.target.value)}
            />
          </div>
          <TextareaField
            label="Description"
            id={`description-${idx}`}
            placeholder="Describe the promotion in detail."
            value={promo.description || ''}
            onChange={(e) => onUpdate(idx, 'description', e.target.value)}
            required
          />
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Start Date"
              id={`startsAt-${idx}`}
              type="date"
              value={formatDate(promo.startsAt)}
              onChange={(e) => onUpdate(idx, 'startsAt', e.target.value ? new Date(e.target.value) : null)}
            />
            <InputField
              label="End Date"
              id={`endsAt-${idx}`}
              type="date"
              value={formatDate(promo.endsAt)}
              onChange={(e) => onUpdate(idx, 'endsAt', e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          
          <CollapsibleSection title="Images & Assets">
            <div className="space-y-6">
              <ImageUploadField
                label="Banner Image"
                src={promo.bannerUrl || ''}
                onFile={(file) => onImageUpload(idx, file, 'bannerUrl')}
              />
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <ImageUploadField
                    key={n}
                    label={`Feature Image ${n}`}
                    src={promo[`featureImage${n}` as keyof IPromotion] as string}
                    onFile={(file) => onImageUpload(idx, file, `featureImage${n}` as keyof IPromotion)}
                  />
                ))}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Perks & Trust">
            <div className="grid md:grid-cols-2 gap-8">
              <ListManager
                title="Perks"
                items={promo.perks || []}
                onAdd={() => onAddPerk(idx)}
                onRemove={(perkIndex) => onRemovePerk(idx, perkIndex)}
                renderItem={(perk, pIdx) => (
                  <div className="flex items-center gap-2">
                    <InputField
                      label="Icon"
                      placeholder="e.g., SparklesIcon"
                      value={perk.icon}
                      // onChange={(e) => {
                      //   const newPerks = [...(promo.perks || [])];
                      //   newPerks[pIdx] = { ...newPerks[pIdx], icon: e.target.value };
                      //   onUpdate(idx, 'perks', newPerks);
                      // }}
                      onChange={(e) => onUpdatePerk(idx, pIdx, 'icon', e.target.value)}
                      className="flex-1"
                    />
                    <InputField
                      label="Label"
                      placeholder="e.g., Free Shipping"
                      value={perk.label}
                      // onChange={(e) => {
                      //   const newPerks = [...(promo.perks || [])];
                      //   newPerks[pIdx] = { ...newPerks[pIdx], label: e.target.value };
                      //   onUpdate(idx, 'perks', newPerks);
                      // }}
                      onChange={(e) => onUpdatePerk(idx, pIdx, 'label', e.target.value)}
                
                      className="flex-1"
                    />
                    {getIconComponent(perk.icon, 'h-6 w-6 text-indigo-500')}
                  </div>
                )}
              />
              <ListManager
                title="Trust Logos"
                items={promo.trustLogos || []}
                onAdd={() => onAddTrustLogo(idx)}
                onRemove={(lIdx) => onRemoveTrustLogo(idx, lIdx)}
                renderItem={(logoUrl, lIdx) => (
                  <div className="flex items-center gap-2">
                    <InputField
                      label="Logo URL"
                      placeholder="https://..."
                      value={logoUrl.url}
                      // onChange={(e) => {
                      //   const newLogos = [...(promo.trustLogos || [])];
                      //   newLogos[lIdx] = { id: newLogos[lIdx].id, url: e.target.value };
                      //   onUpdate(idx, 'trustLogos', newLogos);
                      // }}
                      onChange={(e) => onUpdateTrustLogo(idx, lIdx, 'url', e.target.value)}
                      className="flex-1"
                    />
                    {logoUrl && (
                      <img src={logoUrl.url} alt="Logo" className="h-8 w-auto rounded-md object-contain" />
                    )}
                  </div>
                )}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Theme Colors">
            <div className="grid sm:grid-cols-2 gap-6">
              <ColorPickerField
                label="Primary Color"
                value={promo.themePrimary || '#0d9488'}
                onChange={(e) => onUpdate(idx, 'themePrimary', e.target.value)}
              />
              <ColorPickerField
                label="Secondary Color"
                value={promo.themeSecondary || '#f97316'}
                onChange={(e) => onUpdate(idx, 'themeSecondary', e.target.value)}
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
        "w-full border-gray-300 bg-white rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm",
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
      className="w-full border-gray-300 bg-white rounded-lg px-3 py-2 resize-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
    />
  </div>
);

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ label, value, onChange }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm font-medium text-gray-700 mb-2">{label}</span>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-16 h-16 rounded-xl border-2 border-gray-300 transition-colors cursor-pointer"
    />
  </div>
);

interface ImageUploadFieldProps {
  label: string;
  src?: string;
  onFile: (file: File) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, src, onFile }) => {
  const inputId = `file-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div
      className="relative w-full aspect-[2/1] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden bg-gray-50"
      onClick={() => document.getElementById(inputId)?.click()}
    >
      {src ? (
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
      <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
      <h4 className="block text-sm font-medium text-gray-700 mb-3">{title}</h4>
      <div className="space-y-4">
        {safeItems.map((item:any, index) => (
          <div key={item.id ?? index} className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
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
        className="mt-4 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition text-sm font-semibold"
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
