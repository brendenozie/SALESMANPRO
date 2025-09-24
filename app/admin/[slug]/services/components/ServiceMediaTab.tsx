// components/admin/components/ServiceMediaTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Assuming Image component is available
import { MarketListingForm } from '@/types/typings';

interface ServiceMediaTabProps {
    MarketListingForm: MarketListingForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Partial<MarketListingForm & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

// Image loader for Next.js Image component
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

const ServiceMediaTab: React.FC<ServiceMediaTabProps> = ({
    MarketListingForm,
    handleChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    return (
        <motion.section
            key="media"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Media & Images</h4>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Main Service Image URL</span>
                <input
                    type="text"
                    name="images[0]" // Assuming first image is main
                    value={MarketListingForm.images[0] || ''}
                    
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="e.g., [https://example.com/main-service.jpg](https://example.com/main-service.jpg)"
                />
                <p className="text-gray-500 text-sm mt-1">Provide a URL for your main service image.</p>
                {MarketListingForm.images[0] && (
                    <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image src={MarketListingForm.images[0]} loader={imageLoader} alt="Main Image Preview" layout="fill" objectFit="cover" />
                    </div>
                )}
            </motion.label>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Additional Images (comma-separated URLs)</span>
                <textarea
                    name="additionalImages" // Placeholder name, actual logic needed
                    value={MarketListingForm.images.slice(1).join(', ') || ''}
                    // onChange={(e) => {
                    //     const mainImage = MarketListingForm.images[0] || '';
                    //     const additionalImages = e.target.value.split(',').map(item => item.trim()).filter(item => item !== '');
                    //     handleChange({ target: { name: 'images', value: [mainImage, ...additionalImages] } } as React.ChangeEvent<HTMLTextAreaElement>);
                    // }}
                    onChange={(e) => {
                            const newImages = [...MarketListingForm.images];
                            newImages[0] = e.target.value;
                            handleChange({
                                target: { name: "images", value: newImages },
                            } as unknown as React.ChangeEvent<HTMLInputElement>); 
                        }
                    }
                    rows={3}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="e.g., url1.jpg, url2.jpg, url3.png"
                />
                <p className="text-gray-500 text-sm mt-1">Provide URLs for additional images, separated by commas.</p>
                {MarketListingForm.images.slice(1).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {MarketListingForm.images.slice(1).map((imgUrl, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <Image src={imgUrl} loader={imageLoader} alt={`Additional Image ${idx + 1}`} layout="fill" objectFit="cover" />
                            </div>
                        ))}
                    </div>
                )}
            </motion.label>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Video URL (Optional)</span>
                <input
                    type="text"
                    name="video"
                    value={MarketListingForm.video || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="e.g., [https://youtube.com/watch?v=yourvideo](https://youtube.com/watch?v=yourvideo)"
                />
                <p className="text-gray-500 text-sm mt-1">Link to a YouTube or Vimeo video showcasing your service.</p>
            </motion.label>
        </motion.section>
    );
};

export default ServiceMediaTab;
