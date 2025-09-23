"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  ArrowRightIcon,
  UserIcon,
  TagIcon,
  LinkIcon,
  SpeakerWaveIcon, // For podcast duration
} from "@heroicons/react/24/solid";
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    themeSettings: { primaryColor: '#0EA5E9' }, // Tailwind 'sky-500'
  },
});

// Local loader for next/image
const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

// Mock Data for a Blog Post
const mockBlogPost = {
  type: 'blog',
  title: 'The Future of AI in Content Creation: A Deep Dive',
  author: 'Dr. Emily Carter',
  publishedAt: '2024-07-15T10:30:00Z',
  coverImage: 'https://placehold.co/1200x600/0EA5E9/FFFFFF?text=AI+Content+Future',
  content: `
    <p>Artificial intelligence is rapidly transforming various industries, and content creation is no exception. From generating articles to crafting marketing copy, AI tools are becoming increasingly sophisticated, raising questions about the future of human creativity and labor.</p>
    <p>One of the most significant advancements is the ability of large language models (LLMs) to produce coherent and contextually relevant text. These models, trained on vast datasets, can assist writers by generating outlines, drafting paragraphs, or even creating entire articles from a few prompts.</p>
    <h3>The Benefits and Challenges</h3>
    <p>The benefits are clear: increased efficiency, scalability, and the ability to overcome writer's block. Businesses can produce more content faster, reaching wider audiences. However, challenges remain, including ensuring factual accuracy, maintaining a unique voice, and addressing ethical concerns around plagiarism and intellectual property.</p>
    <figure class="my-6">
      <img src="https://placehold.co/800x450/10B981/FFFFFF?text=AI+Writing+Tools" alt="AI Writing Tools" class="w-full rounded-lg shadow-md">
      <figcaption class="text-center text-sm text-gray-500 mt-2">Figure 1: AI-powered writing tools in action.</figcaption>
    </figure>
    <p>Furthermore, the human element of storytelling, empathy, and nuanced understanding of complex emotions is still largely unique to human writers. The true power lies in the collaboration between AI and humans, where AI acts as a powerful assistant rather than a replacement.</p>
    <h4>Looking Ahead</h4>
    <p>As AI technology continues to evolve, we can expect even more sophisticated tools that seamlessly integrate into the content creation workflow. The key will be to leverage these tools responsibly, ensuring that they augment human capabilities rather than diminish them. The future of content creation is not about AI versus humans, but AI with humans.</p>
    <ul>
      <li>Enhanced content ideation</li>
      <li>Automated drafting and editing</li>
      <li>Personalized content at scale</li>
      <li>Improved SEO performance</li>
    </ul>
    <p>The landscape is shifting, and those who adapt will thrive. Embracing AI as a partner in the creative process will unlock new possibilities for engaging and impactful content.</p>
  `,
  tags: ['AI', 'Content Creation', 'Technology', 'Future'],
  relatedContent: [
    { type: 'blog', title: 'Understanding Large Language Models', coverImage: 'https://placehold.co/600x350/F97316/FFFFFF?text=LLM+Basics', slug: 'understanding-llms' },
    { type: 'podcast', title: 'Podcast: The Ethics of Generative AI', coverImage: 'https://placehold.co/600x350/8B5CF6/FFFFFF?text=AI+Ethics+Podcast', slug: 'ai-ethics-podcast' },
    { type: 'blog', title: 'SEO Strategies for AI-Generated Content', coverImage: 'https://placehold.co/600x350/EF4444/FFFFFF?text=SEO+AI', slug: 'seo-ai-content' },
  ]
};

// Mock Data for a Podcast Episode
const mockPodcastEpisode = {
  type: 'podcast',
  title: 'Episode 23: Navigating the Creator Economy',
  author: 'Sarah Chen (Host)',
  publishedAt: '2024-07-10T09:00:00Z',
  coverImage: 'https://placehold.co/1200x600/EC4899/FFFFFF?text=Creator+Economy+Podcast',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example MP3 URL
  duration: '35:45',
  content: `
    <p>In this episode, we dive deep into the rapidly evolving creator economy. What does it take to build a sustainable career as a content creator? We explore various monetization strategies, the importance of community building, and the challenges faced by creators today.</p>
    <p>Our guest, Mark Johnson, a veteran content strategist, shares his insights on how to diversify income streams, from sponsorships and merchandise to direct audience support. We also discuss the role of platforms like Patreon and Substack in empowering creators.</p>
    <h3>Key Takeaways:</h3>
    <ul>
      <li>Understanding your niche and target audience.</li>
      <li>Building a strong, engaged community.</li>
      <li>Diversifying income streams beyond ads.</li>
      <li>The importance of consistent content quality.</li>
    </ul>
    <p>Join us as we uncover the secrets to thriving in the dynamic world of online content creation.</p>
  `,
  tags: ['Creator Economy', 'Podcasting', 'Monetization', 'Digital Marketing'],
  relatedContent: [
    { type: 'blog', title: 'Blog: 5 Ways to Monetize Your Online Content', coverImage: 'https://placehold.co/600x350/F97316/FFFFFF?text=Monetize+Content', slug: 'monetize-online-content' },
    { type: 'podcast', title: 'Episode 18: Building Your Personal Brand', coverImage: 'https://placehold.co/600x350/8B5CF6/FFFFFF?text=Personal+Brand+Podcast', slug: 'personal-brand-podcast' },
    { type: 'blog', title: 'The Power of Niche Content', coverImage: 'https://placehold.co/600x350/EF4444/FFFFFF?text=Niche+Content', slug: 'power-of-niche-content' },
  ]
};

// Main ContentPage Component
export default function ContentPage() {
  // Use a state to toggle between blog and podcast for demonstration
  const [currentContent, setCurrentContent] = useState(mockBlogPost); // Start with blog post

  const { storeFormData } = useStoreContext() || {};
  const { themeSettings: { primaryColor = '#0EA5E9' } = {} } = storeFormData || {}; // Default primary color

  // Function to handle image loading errors
  const handleImageError = (e:any) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/1200x600/CCCCCC/333333?text=Content+Image+Not+Found';
  };

  // Function to copy URL to clipboard
  const copyToClipboard = () => {
    const url = window.location.href;
    // Fallback for older browsers or if navigator.clipboard is not available in iframe
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!'); // Using alert for simplicity, replace with custom modal
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback for execCommand
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textarea);
      });
    } else {
      // Fallback for execCommand
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textarea);
    }
  };

  // Variants for framer-motion animations
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      {/* Toggle buttons for demonstration */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow-sm mb-8">
        <button
          onClick={() => setCurrentContent(mockBlogPost)}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
            currentContent.type === 'blog' ? `bg-gray-900 text-white` : `bg-gray-100 text-gray-700 hover:bg-gray-200`
          }`}
        >
          View Blog Post
        </button>
        <button
          onClick={() => setCurrentContent(mockPodcastEpisode)}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
            currentContent.type === 'podcast' ? `bg-gray-900 text-white` : `bg-gray-100 text-gray-700 hover:bg-gray-200`
          }`}
        >
          View Podcast Episode
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Main Content Area */}
        <motion.article
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          {/* Cover Image */}
          <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
            <Image
              loader={loader}
              src={currentContent.coverImage}
              alt={currentContent.title}
              width={1200}
              height={600}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {currentContent.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm sm:text-base mb-8">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1.5" style={{ color: primaryColor }} />
                {currentContent.author}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1.5" style={{ color: primaryColor }} />
                {new Date(currentContent.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {currentContent.type === 'blog' && (
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1.5" style={{ color: primaryColor }} />
                  {/* Calculate read time based on content length (assuming 200 words per minute) */}
                  {currentContent.content ? `${Math.ceil(currentContent.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min read` : 'N/A min read'}
                </span>
              )}
              {currentContent.type === 'podcast' && currentContent.duration && (
                <span className="flex items-center">
                  <SpeakerWaveIcon className="h-4 w-4 mr-1.5" style={{ color: primaryColor }} />
                  {currentContent.duration}
                </span>
              )}
            </div>

            {/* Podcast Audio Player (Conditional) */}
            {currentContent.type === 'podcast' && currentContent.audioUrl && (
              <motion.div
                className="mb-8 p-4 bg-gray-100 rounded-xl shadow-inner"
                initial="hidden"
                animate="visible"
                variants={fadeInVariants}
              >
                <audio controls className="w-full">
                  <source src={currentContent.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </motion.div>
            )}

            {/* Main Content Body */}
            <div
              className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentContent.content }}
            />

            {/* Tags */}
            {currentContent.tags && currentContent.tags.length > 0 && (
              <motion.div
                className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-2"
                initial="hidden"
                animate="visible"
                variants={staggerContainerVariants}
              >
                <TagIcon className="h-5 w-5 text-gray-500 mr-1" />
                {currentContent.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`, color: primaryColor }}
                    variants={fadeInVariants}
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Social Share Buttons */}
            <motion.div
              className="mt-8 flex items-center gap-4 justify-end"
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariants}
            >
              <span className="text-gray-700 font-semibold mr-2">Share:</span>
              <motion.button
                onClick={copyToClipboard}
                className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Copy link to clipboard"
              >
                <LinkIcon className="h-5 w-5" />
              </motion.button>
              {/* Add more social share buttons here (e.g., Twitter, Facebook) */}
              <motion.a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(currentContent.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Share on Twitter"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.13l-6.267-8.526-7.242 8.526H.75L9.817 12.87 1.54 2.25H4.85L11.047 9.74 18.244 2.25zM17.292 20l-1.157-.086L10.3 7.425 4.727 2H2.42L9.155 11.967 2.54 20H3.903l5.895-7.72L14.51 20h2.782z"></path></svg>
              </motion.a>
              <motion.a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Share on Facebook"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.815c-3.238 0-4.185 1.272-4.185 4.57v2.43z"></path></svg>
              </motion.a>
            </motion.div>
          </div>
        </motion.article>

        {/* Related Content Section */}
        {currentContent.relatedContent && currentContent.relatedContent.length > 0 && (
          <motion.section
            className="mt-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainerVariants}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {currentContent.relatedContent.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                  variants={fadeInVariants}
                >
                  <div className="w-full h-48 overflow-hidden">
                    <Image
                      loader={loader}
                      src={item.coverImage || 'https://placehold.co/600x350/CCCCCC/333333?text=Related+Content'}
                      alt={item.title}
                      width={600}
                      height={350}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {item.type === 'blog' ? 'Blog Post' : 'Podcast Episode'}
                    </p>
                    <Link href={item.slug ? `/${item.type}s/${item.slug}` : '#'} passHref 
                        className="inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300
                                   bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        style={{
                          backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`,
                          color: primaryColor,
                          borderColor: primaryColor,
                          borderWidth: '1px'
                        }}
                      >
                        {item.type === 'blog' ? 'Read More' : 'Listen Now'}
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Comments Section Placeholder */}
        <motion.section
          className="mt-12 bg-white rounded-3xl shadow-xl p-8 md:p-10"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Comments
          </h2>
          <p className="text-gray-600 mb-4">
            Join the conversation! Share your thoughts on this {currentContent.type === 'blog' ? 'blog post' : 'podcast episode'}.
          </p>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 mb-4"
            style={{ borderColor: primaryColor, focusRingColor: primaryColor }}
            rows="5"
            placeholder="Write your comment here..."
          ></textarea>
          <button
            className="px-6 py-3 rounded-full font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Post Comment
          </button>
          <div className="mt-6 text-gray-500 text-sm">
            <p>No comments yet. Be the first to share your thoughts!</p>
            {/* You would dynamically load comments here */}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
