const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLayout/body/components/TestimonialsNewsSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { EditableElement } from '@/components/site/EditableElement';"
);

// 2. VerificationCard
const oldCard = `const VerificationCard = ({ ver, primaryColor }: { ver: typeof mockVerifications[0]; primaryColor: string }) => {
    return (
        <motion.div
            variants={itemVariants}
            className="p-8 rounded-xl border border-zinc-900 bg-zinc-900/10 relative group transition-all duration-300 hover:bg-zinc-900/30 hover:border-zinc-800 flex flex-col justify-between h-full shadow-lg"
        >
            {/* Top Structural Security Node Layout */}
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300 text-zinc-600">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>

            {/* Quote Body Block */}
            <div className="mb-8 relative z-10">
                <p className="text-zinc-300 text-base font-light leading-relaxed tracking-wide text-justify">
                    "{ver.quote}"
                </p>
            </div>

            {/* Counterparty Institutional Identity Panel */}
            <div className="flex items-center mt-auto pt-6 border-t border-zinc-900/60">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-zinc-800 bg-zinc-950">
                    <img
                        src={ver.avatarUrl}
                        alt={ver.authorName || 'Asset Counterparty'}
                        className="object-cover w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-500"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = \`https://placehold.co/60x60/18181B/A1A1AA?text=\${ver.authorName?.split(' ').map(n => n[0]).join('') || 'CP'}\`;
                        }}
                    />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-zinc-200 text-sm tracking-tight truncate">{ver.authorName}</h4>
                    <p className="text-[11px] font-mono mt-0.5 tracking-wider truncate text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
                        {ver.role}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};`;

const newCard = `const VerificationCard = ({ ver, primaryColor, index }: { ver: typeof mockVerifications[0]; primaryColor: string; index: number }) => {
    return (
        <motion.div
            variants={itemVariants}
            className="p-8 rounded-xl border border-zinc-900 bg-zinc-900/10 relative group transition-all duration-300 hover:bg-zinc-900/30 hover:border-zinc-800 flex flex-col justify-between h-full shadow-lg"
        >
            {/* Top Structural Security Node Layout */}
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300 text-zinc-600">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>

            {/* Quote Body Block */}
            <div className="mb-8 relative z-10">
                <EditableElement
                    targetId={\`company-portfolio.home.testimonials.item\${index}.quote\`}
                    componentKey="TestimonialsNewsSection"
                    elementKey="quote"
                    label={\`Testimonial #\${index + 1} Quote\`}
                    type="textarea"
                    defaultValue={ver.quote}
                    inline
                >
                    {(val) => (
                        <p className="text-zinc-300 text-base font-light leading-relaxed tracking-wide text-justify">
                            "{val}"
                        </p>
                    )}
                </EditableElement>
            </div>

            {/* Counterparty Institutional Identity Panel */}
            <div className="flex items-center mt-auto pt-6 border-t border-zinc-900/60">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-zinc-800 bg-zinc-950">
                    <img
                        src={ver.avatarUrl}
                        alt={ver.authorName || 'Asset Counterparty'}
                        className="object-cover w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-500"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = \`https://placehold.co/60x60/18181B/A1A1AA?text=\${ver.authorName?.split(' ').map(n => n[0]).join('') || 'CP'}\`;
                        }}
                    />
                </div>
                <div className="min-w-0">
                    <EditableElement
                        targetId={\`company-portfolio.home.testimonials.item\${index}.authorName\`}
                        componentKey="TestimonialsNewsSection"
                        elementKey="authorName"
                        label={\`Testimonial #\${index + 1} Author Name\`}
                        type="text"
                        defaultValue={ver.authorName}
                        inline
                    >
                        {(val) => <h4 className="font-bold text-zinc-200 text-sm tracking-tight truncate">{val}</h4>}
                    </EditableElement>
                    <EditableElement
                        targetId={\`company-portfolio.home.testimonials.item\${index}.role\`}
                        componentKey="TestimonialsNewsSection"
                        elementKey="role"
                        label={\`Testimonial #\${index + 1} Role\`}
                        type="text"
                        defaultValue={ver.role}
                        inline
                    >
                        {(val) => (
                            <p className="text-[11px] font-mono mt-0.5 tracking-wider truncate text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
                                {val}
                            </p>
                        )}
                    </EditableElement>
                </div>
            </div>
        </motion.div>
    );
};`;

content = content.replace(oldCard, newCard);

content = content.replace(
  `{verificationsToRender.map((ver:any) => (
                            <VerificationCard
                                key={ver.id}
                                ver={ver}
                                primaryColor={primaryColor}
                            />
                        ))}`,
  `{verificationsToRender.map((ver:any, index: number) => (
                            <VerificationCard
                                key={ver.id}
                                ver={ver}
                                primaryColor={primaryColor}
                                index={index}
                            />
                        ))}`
);

// 3. Header Block
const oldHeader = `                {/* Micro-Tracked Infrastructure Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
                        Institutional Validation
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
                        What Our Partners Say
                    </h2>
                    <div className="w-12 h-[1px] bg-zinc-800 mx-auto my-6" />
                    <p className="text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                        We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day.
                    </p>
                </motion.div>`;

const newHeader = `                {/* Micro-Tracked Infrastructure Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
                        <EditableElement
                            targetId="company-portfolio.home.testimonials.badge"
                            componentKey="TestimonialsNewsSection"
                            elementKey="badge"
                            label="Testimonials Badge"
                            type="text"
                            defaultValue="Institutional Validation"
                            inline
                        >
                            {(val) => <>{val}</>}
                        </EditableElement>
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
                        <EditableElement
                            targetId="company-portfolio.home.testimonials.title"
                            componentKey="TestimonialsNewsSection"
                            elementKey="title"
                            label="Testimonials Title"
                            type="text"
                            defaultValue="What Our Partners Say"
                            inline
                        >
                            {(val) => <>{val}</>}
                        </EditableElement>
                    </h2>
                    <div className="w-12 h-[1px] bg-zinc-800 mx-auto my-6" />
                    <EditableElement
                        targetId="company-portfolio.home.testimonials.description"
                        componentKey="TestimonialsNewsSection"
                        elementKey="description"
                        label="Testimonials Description"
                        type="textarea"
                        defaultValue="We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day."
                        inline
                    >
                        {(val) => (
                            <p className="text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                                {val}
                            </p>
                        )}
                    </EditableElement>
                </motion.div>`;

content = content.replace(oldHeader, newHeader);

// 4. Bottom Banner
const oldBanner = `                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 uppercase">
                                Ready to scale capital throughput safely?
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                                Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility.
                            </p>
                        </div>`;

const newBanner = `                        <div>
                            <EditableElement
                                targetId="company-portfolio.home.testimonials.bannerTitle"
                                componentKey="TestimonialsNewsSection"
                                elementKey="bannerTitle"
                                label="Banner Title"
                                type="text"
                                defaultValue="Ready to scale capital throughput safely?"
                                inline
                            >
                                {(val) => (
                                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 uppercase">
                                        {val}
                                    </h3>
                                )}
                            </EditableElement>
                            <EditableElement
                                targetId="company-portfolio.home.testimonials.bannerSubtitle"
                                componentKey="TestimonialsNewsSection"
                                elementKey="bannerSubtitle"
                                label="Banner Subtitle"
                                type="textarea"
                                defaultValue="Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility."
                                inline
                            >
                                {(val) => (
                                    <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                                        {val}
                                    </p>
                                )}
                            </EditableElement>
                        </div>`;

content = content.replace(oldBanner, newBanner);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated TestimonialsNewsSection');
