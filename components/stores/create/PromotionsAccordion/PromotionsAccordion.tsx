import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { IPromotion } from '@/types/typings';
import clsx from 'clsx';

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
}

/**
 * A visually appealing and intuitive component for managing a list of promotions.
 * It uses an accordion pattern to keep the UI clean and organized.
 */
export default function PromotionsAccordion({
  promotions,
  onUpdatePromotion,
  onAddPromotion,
  onRemovePromotion,
  onImageUpload,
}: PromotionsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  

  // Automatically add the first promotion if the list is empty
  useEffect(() => {
    if (promotions.length === 0) {
      onAddPromotion();
    }
  }, [promotions, onAddPromotion]);

  // Check if all existing promotions have a title
  const isLastPromotionFilled =
    promotions.length > 0 && promotions[promotions.length - 1].title.trim();

  const handleUpdatePerk = (
    promoIndex: number,
    perkIndex: number,
    field: 'icon' | 'label',
    value: string,
  ) => {
    // Ensure perks is an array before trying to map
    const perks = (promotions[promoIndex].perks || []).slice();
    if (!perks[perkIndex]) {
      
      perks[perkIndex] = { icon: '', label: '' };
    }
    perks[perkIndex] = { ...perks[perkIndex], [field]: value };
    onUpdatePromotion(promoIndex, 'perks', perks);
  };

  const handleRemovePerk = (promoIndex: number, perkIndex: number) => {
    const perks = (promotions[promoIndex].perks || []).filter(
      (_, i) => i !== perkIndex,
    );
    onUpdatePromotion(promoIndex, 'perks', perks);
  };

  const handleAddPerk = (promoIndex: number) => {
    const perks = [...(promotions[promoIndex].perks || []), { icon: '', label: '' }];
    onUpdatePromotion(promoIndex, 'perks', perks);
  };

  const handleUpdateTrustLogo = (promoIndex: number, logoIndex: number, value: string) => {
    // Ensure trustLogos is an array before trying to map
    const trustLogos = (promotions[promoIndex].trustLogos || []).slice();
    trustLogos[logoIndex] = value;
    onUpdatePromotion(promoIndex, 'trustLogos', trustLogos);
  };

  const handleRemoveTrustLogo = (promoIndex: number, logoIndex: number) => {
    const trustLogos = (promotions[promoIndex].trustLogos || []).filter(
      (_, i) => i !== logoIndex,
    );
    onUpdatePromotion(promoIndex, 'trustLogos', trustLogos);
  };

  const handleAddTrustLogo = (promoIndex: number) => {
    const trustLogos = [...(promotions[promoIndex].trustLogos || []), ''];
    onUpdatePromotion(promoIndex, 'trustLogos', trustLogos);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Promotions</h2>
      {promotions.map((promo, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
          {/* Accordion Header */}
          <button
            type="button"
            className="flex justify-between items-center w-full px-6 py-4 bg-white hover:bg-gray-50 transition"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {promo.title.trim() || `Promotion ${idx + 1}`}
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {promo.title.trim() && promo.description?.trim()
                  ? 'Complete'
                  : 'Draft'}
              </span>
              <TrashIcon
                className="h-5 w-5 text-red-500 hover:text-red-700 transition"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion from toggling
                  onRemovePromotion(idx);
                }}
                aria-label="Remove promotion"
              />
              <ChevronDownIcon
                className={clsx(
                  'h-5 w-5 text-gray-600 transition-transform duration-300',
                  { 'rotate-180': openIndex === idx },
                )}
              />
            </div>
          </button>

          {/* Accordion Content */}
          {openIndex === idx && (
            <div className="p-6 bg-gray-50 space-y-6">
              {/* Promotion Title and Description */}
              <div>
                <label
                  htmlFor={`title-${idx}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Promotion Title
                </label>
                <input
                  id={`title-${idx}`}
                  placeholder="e.g., Summer Sale"
                  value={promo.title}
                  onChange={(e) =>
                    onUpdatePromotion(idx, 'title', e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor={`description-${idx}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id={`description-${idx}`}
                  placeholder="Describe the promotion in detail."
                  value={promo.description || ''}
                  onChange={(e) =>
                    onUpdatePromotion(idx, 'description', e.target.value)
                  }
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* CTA and Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={`cta-text-${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Call to Action Text
                  </label>
                  <input
                    id={`cta-text-${idx}`}
                    placeholder="e.g., Shop Now!"
                    value={promo.ctaText || ''}
                    onChange={(e) =>
                      onUpdatePromotion(idx, 'ctaText', e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`cta-link-${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Call to Action Link
                  </label>
                  <input
                    id={`cta-link-${idx}`}
                    type="url"
                    placeholder="https://example.com/promo"
                    value={promo.ctaLink || ''}
                    onChange={(e) =>
                      onUpdatePromotion(idx, 'ctaLink', e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`startsAt-${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    id={`startsAt-${idx}`}
                    type="date"
                    value={formatDate(promo.startsAt)}
                    onChange={(e) =>
                      onUpdatePromotion(
                        idx,
                        'startsAt',
                        e.target.value ? new Date(e.target.value) : null,
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`endsAt-${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    id={`endsAt-${idx}`}
                    type="date"
                    value={formatDate(promo.endsAt)}
                    onChange={(e) =>
                      onUpdatePromotion(
                        idx,
                        'endsAt',
                        e.target.value ? new Date(e.target.value) : null,
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <FileUpload
                  label="Upload Banner Image"
                  src={promo.bannerUrl || ''}
                  onFile={(file) => onImageUpload(idx, file, 'bannerUrl')}
                />
              </div>

              {/* Feature Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feature Images
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <FileUpload
                      key={n}
                      label={`Feature Image ${n}`}
                      src={promo[`featureImage${n}` as keyof IPromotion] as string}
                      onFile={(file) =>
                        onImageUpload(idx, file, `featureImage${n}` as keyof IPromotion)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Perks and Trust Logos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perks
                  </label>
                  <div className="space-y-2">
                    {Array.isArray(promo.perks) ? promo.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <input
                          placeholder="Icon Name (e.g., SparklesIcon)"
                          value={perk.icon}
                          onChange={(e) =>
                            handleUpdatePerk(idx, pIdx, 'icon', e.target.value)
                          }
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <input
                          placeholder="Label"
                          value={perk.label}
                          onChange={(e) =>
                            handleUpdatePerk(idx, pIdx, 'label', e.target.value)
                          }
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePerk(idx, pIdx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )) : (
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Icon Name (e.g., SparklesIcon)"
                          value=""
                          onChange={(e) =>
                            handleUpdatePerk(idx, -1, 'icon', e.target.value)
                          }
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <input
                          placeholder="Label"
                          value=""
                          onChange={(e) =>
                            handleUpdatePerk(idx, -1, 'label', e.target.value)
                          }
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePerk(idx, -1)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddPerk(idx)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 transition text-sm font-medium"
                    >
                      + Add Perk
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trust Logos
                  </label>
                  <div className="space-y-2">
                    {Array.isArray(promo.trustLogos) ? promo.trustLogos.map(
                      (logoUrl, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input
                            placeholder="Logo URL"
                            value={logoUrl}
                            onChange={(e) =>
                              handleUpdateTrustLogo(idx, lIdx, e.target.value)
                            }
                            className="flex-1 border rounded-lg px-3 py-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTrustLogo(idx, lIdx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ),
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Logo URL"
                          value=""
                          onChange={(e) =>
                            handleUpdateTrustLogo(idx, -1, e.target.value)
                          }
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddTrustLogo(idx)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 transition text-sm font-medium"
                    >
                      + Add Logo
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Colors
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Primary Color</span>
                    <input
                      type="color"
                      value={promo.themePrimary || '#0d9488'}
                      onChange={(e) =>
                        onUpdatePromotion(idx, 'themePrimary', e.target.value)
                      }
                      className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Secondary Color</span>
                    <input
                      type="color"
                      value={promo.themeSecondary || '#f97316'}
                      onChange={(e) =>
                        onUpdatePromotion(idx, 'themeSecondary', e.target.value)
                      }
                      className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Promotion Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => {
            onAddPromotion();
            setOpenIndex(promotions.length); // Open the newly added promotion
          }}
          disabled={!isLastPromotionFilled}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Promotion</span>
        </button>
      </div>
    </div>
  );
}

/** Small helper for formatting dates */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** Helper component for image uploads */
function FileUpload({
  label,
  src,
  onFile,
}: {
  label: string;
  src?: string;
  onFile: (file: File) => void;
}) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div
      className="relative w-full aspect-[2/1] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition overflow-hidden"
      onClick={() => {
        const input = document.getElementById(label) as HTMLInputElement;
        input?.click();
      }}
    >
      {src && (
        <>
          <img
            src={src}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">Change Image</span>
          </div>
        </>
      )}
      {!src && (
        <div className="flex flex-col items-center text-gray-500">
          <PhotoIcon className="h-6 w-6 mb-1" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}
      <input
        id={label}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}