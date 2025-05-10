import React from "react";

interface SocialLink {
  channel: string;
  url: string;
}

interface SocialLinksAccordionProps {
  form: {
    socialLinks?: SocialLink[];
  };
  handleArrayChange: (field: 'socialLinks', index: number, key: keyof SocialLink, value: string) => void;
  addArrayItem: (field: 'socialLinks', item: SocialLink) => void;
  removeArrayItem: (field: 'socialLinks', index: number) => void;
}

const SocialLinksAccordion: React.FC<SocialLinksAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const links = form.socialLinks || [];
  const isValid = links.every(link => link.channel && link.url);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('socialLinks', { channel: '', url: '' })}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Social Links</span>
        <span className="text-xl">{links.length > 0 ? '✅' : '+'}</span>
      </button>
      {links.length > 0 && (
        <div className="p-6 space-y-4">
          {links.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
              <input
                placeholder="Channel (e.g. Twitter)"
                value={s.channel}
                onChange={e => handleArrayChange('socialLinks', i, 'channel', e.target.value)}
                className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                placeholder="URL"
                value={s.url}
                onChange={e => handleArrayChange('socialLinks', i, 'url', e.target.value)}
                className="sm:col-span-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('socialLinks', i)}
                className="sm:col-span-1 text-red-500 font-bold text-xl focus:outline-none"
                title="Remove link"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('socialLinks', { channel: '', url: '' })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Link
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add links to your social media profiles. You can add multiple links.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>Twitter</code>, <code>Facebook</code>, <code>Instagram</code>
          </p>
        </div>
      )}
    </div>
  );
};


export default SocialLinksAccordion;
