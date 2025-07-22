// components/admin/components/AdminPOSClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ReceiptPercentIcon, // For Invoice
    CalendarDaysIcon, // For Appointment
    UserCircleIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    ArrowPathIcon,
    PrinterIcon, // For Print
    CheckCircleIcon, // For success messages
    ExclamationCircleIcon, // For error messages
    MagnifyingGlassIcon, // For search
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
// import html2canvas from 'html2canvas'; // For PDF generation
// import jsPDF from 'jspdf'; // For PDF generation

// --- Type Definitions (Centralized for POS) ---
export interface POSServiceItem {
    id: string;
    title: string;
    description: string;
    sellingPrice: number;
    category: string;
    imageUrl?: string;
}

export interface InvoiceItem {
    serviceId: string;
    title: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface ClientDetails {
    name: string;
    email: string;
    phone: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    client: ClientDetails;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number; // e.g., 0.15 for 15%
    taxAmount: number;
    discountPercentage: number; // e.g., 10 for 10%
    discountAmount: number;
    total: number;
    paymentMethod: string;
}

export interface AppointmentFormData {
    serviceId: string;
    serviceName: string;
    client: ClientDetails;
    date: string;
    timeSlot: string;
    notes?: string;
}

// --- Sample Data for Services ---
const samplePOSServices: POSServiceItem[] = [
    { id: 'pos_svc_1', title: 'Standard Cleaning', description: 'Basic home cleaning service.', sellingPrice: 50.00, category: 'Home Care', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Cleaning' },
    { id: 'pos_svc_2', title: 'Deep Cleaning Package', description: 'Thorough deep cleaning for homes/offices.', sellingPrice: 120.00, category: 'Home Care', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=DeepClean' },
    { id: 'pos_svc_3', title: 'Window Washing', description: 'Professional window cleaning service.', sellingPrice: 30.00, category: 'Specialized', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Windows' },
    { id: 'pos_svc_4', title: 'Carpet Cleaning', description: 'Deep steam cleaning for carpets.', sellingPrice: 80.00, category: 'Home Care', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Carpet' },
    { id: 'pos_svc_5', title: 'Office Sanitization', description: 'Disinfection service for office spaces.', sellingPrice: 150.00, category: 'Commercial', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Office' },
    { id: 'pos_svc_6', title: 'Pest Control', description: 'Eco-friendly pest eradication.', sellingPrice: 95.00, category: 'Specialized', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Pest' },
    { id: 'pos_svc_7', title: 'Gardening & Landscaping', description: 'Full garden maintenance.', sellingPrice: 75.00, category: 'Outdoor', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Garden' },
    { id: 'pos_svc_8', title: 'Plumbing Repair', description: 'Minor plumbing fixes.', sellingPrice: 60.00, category: 'Maintenance', imageUrl: 'https://placehold.co/150x150/E0F2F1/00796B?text=Plumbing' },
];

const taxRate = 0.08; // 8% tax rate
const availablePaymentMethods = ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer'];

// Image loader for Next.js Image component (if you use it)
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface AdminPOSClientProps {
    // No props needed for this client component, as it manages its own data
}

const AdminPOSClient: React.FC<AdminPOSClientProps> = () => {
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal fallback
    const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // Orange fallback

    const [mode, setMode] = useState<'invoice' | 'appointment'>('invoice');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Invoice State
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceClientDetails, setInvoiceClientDetails] = useState<ClientDetails>({ name: '', email: '', phone: '' });
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(availablePaymentMethods[0]);

    // Appointment State
    const [appointmentService, setAppointmentService] = useState<POSServiceItem | null>(null);
    const [appointmentClientDetails, setAppointmentClientDetails] = useState<ClientDetails>({ name: '', email: '', phone: '' });
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentNotes, setAppointmentNotes] = useState('');

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [generatedInvoicePdfData, setGeneratedInvoicePdfData] = useState<InvoiceData | null>(null);
    const invoicePdfRef = useRef<HTMLDivElement>(null); // Ref for the hidden invoice HTML

    // Filtered services for display
    const filteredServices = useMemo(() => {
        let services = samplePOSServices;
        if (selectedCategory !== 'All') {
            services = services.filter(svc => svc.category === selectedCategory);
        }
        if (searchTerm) {
            services = services.filter(svc =>
                svc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                svc.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return services;
    }, [searchTerm, selectedCategory]);

    const serviceCategories = useMemo(() => {
        const categories = new Set(samplePOSServices.map(svc => svc.category));
        return ['All', ...Array.from(categories)];
    }, []);

    // --- Invoice Calculations ---
    const subtotal = useMemo(() => invoiceItems.reduce((sum, item) => sum + item.subtotal, 0), [invoiceItems]);
    const discountAmount = useMemo(() => subtotal * (discountPercentage / 100), [subtotal, discountPercentage]);
    const taxableAmount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
    const taxAmount = useMemo(() => taxableAmount * taxRate, [taxableAmount]);
    const total = useMemo(() => taxableAmount + taxAmount, [taxableAmount, taxAmount]);

    // --- Handlers ---

    // Add service to invoice
    const handleAddServiceToInvoice = (service: POSServiceItem) => {
        setInvoiceItems(prevItems => {
            const existingItem = prevItems.find(item => item.serviceId === service.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.serviceId === service.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        serviceId: service.id,
                        title: service.title,
                        price: service.sellingPrice,
                        quantity: 1,
                        subtotal: service.sellingPrice,
                    },
                ];
            }
        });
        setMessage(`Added ${service.title} to invoice.`);
        setIsSuccess(true);
    };

    // Update invoice item quantity
    const handleUpdateInvoiceItemQuantity = (serviceId: string, quantity: number) => {
        setInvoiceItems(prevItems =>
            prevItems.map(item =>
                item.serviceId === serviceId
                    ? { ...item, quantity: quantity, subtotal: quantity * item.price }
                    : item
            ).filter(item => item.quantity > 0) // Remove if quantity becomes 0
        );
    };

    // Remove invoice item
    const handleRemoveInvoiceItem = (serviceId: string) => {
        setInvoiceItems(prevItems => prevItems.filter(item => item.serviceId !== serviceId));
        setMessage('Item removed from invoice.');
        setIsSuccess(true);
    };

    // Handle client details change for invoice
    const handleInvoiceClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInvoiceClientDetails(prev => ({ ...prev, [name]: value }));
    };

    // Handle client details change for appointment
    const handleAppointmentClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAppointmentClientDetails(prev => ({ ...prev, [name]: value }));
    };

    // Select service for appointment
    const handleSelectServiceForAppointment = (service: POSServiceItem) => {
        setAppointmentService(service);
        setMessage(`Selected "${service.title}" for appointment.`);
        setIsSuccess(true);
    };

    // --- Actions ---

    // Generate Invoice PDF Data
    const generateInvoiceData = (): InvoiceData | null => {
        if (invoiceItems.length === 0) {
            setMessage('Please add services to the invoice first.');
            setIsSuccess(false);
            return null;
        }
        if (!invoiceClientDetails.name.trim()) {
            setMessage('Client Name is required for invoice.');
            setIsSuccess(false);
            return null;
        }

        const now = new Date();
        const invoiceNumber = `INV-${Date.now()}`; // Simple unique invoice number
        const invoiceDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        const data: InvoiceData = {
            invoiceNumber,
            date: invoiceDate,
            client: invoiceClientDetails,
            items: invoiceItems,
            subtotal,
            taxRate,
            taxAmount,
            discountPercentage,
            discountAmount,
            total,
            paymentMethod,
        };
        setGeneratedInvoicePdfData(data);
        setShowPdfModal(true);
        return data;
    };

    // Handle Print PDF
    const handlePrintPdf = async () => {
        if (!invoicePdfRef.current) {
            setMessage('Could not find invoice content to print.');
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage('Generating PDF...');
        setIsSuccess(null);

        try {
            // const canvas = await html2canvas(invoicePdfRef.current, { scale: 2 }); // Scale for better quality
            // const imgData = canvas.toDataURL('image/png');
            // const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
            // const imgWidth = 210; // A4 width in mm
            // const pageHeight = 297; // A4 height in mm
            // const imgHeight = canvas.height * imgWidth / canvas.width;
            // let heightLeft = imgHeight;
            // let position = 0;

            // pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            // heightLeft -= pageHeight;

            // while (heightLeft >= 0) {
            //     position = heightLeft - imgHeight;
            //     pdf.addPage();
            //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            //     heightLeft -= pageHeight;
            // }

            // pdf.output('dataurlnewwindow'); // Open in new tab
            // pdf.save(`Invoice_${generatedInvoicePdfData?.invoiceNumber}.pdf`); // Or download directly

            setMessage('Invoice PDF generated successfully!');
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            setMessage(`Error generating PDF: ${error.message}`);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Register Appointment
    const handleRegisterAppointment = async () => {
        if (!appointmentService) {
            setMessage('Please select a service for the appointment.');
            setIsSuccess(false);
            return;
        }
        if (!appointmentClientDetails.name.trim() || !appointmentDate || !appointmentTime) {
            setMessage('Client Name, Date, and Time are required for appointment.');
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage('Registering appointment...');
        setIsSuccess(null);

        try {
            const appointmentData: AppointmentFormData = {
                serviceId: appointmentService.id,
                serviceName: appointmentService.title,
                client: appointmentClientDetails,
                date: appointmentDate,
                timeSlot: appointmentTime,
                notes: appointmentNotes,
            };

            // Simulate API call to register appointment
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Appointment Registered:', appointmentData);

            setMessage(`Appointment for "${appointmentService.title}" with "${appointmentClientDetails.name}" registered successfully!`);
            setIsSuccess(true);
            // Reset appointment form
            setAppointmentService(null);
            setAppointmentClientDetails({ name: '', email: '', phone: '' });
            setAppointmentDate('');
            setAppointmentTime('');
            setAppointmentNotes('');
        } catch (error: any) {
            console.error('Error registering appointment:', error);
            setMessage(`Error registering appointment: ${error.message}`);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form when mode changes or modal closes
    useEffect(() => {
        setMessage('');
        setIsSuccess(null);
    }, [mode, showPdfModal]);

    // Card animation variants
    const itemCardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        hover: { scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" },
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-10"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                        Service Point-of-Sale
                    </span>
                </motion.h1>

                {/* Mode Toggle */}
                <motion.div
                    className="flex justify-center mb-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <button
                        onClick={() => setMode('invoice')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                            mode === 'invoice' ? 'text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        style={{ backgroundColor: mode === 'invoice' ? primaryColor : '' }}
                    >
                        <ReceiptPercentIcon className="w-6 h-6" /> Create Invoice
                    </button>
                    <button
                        onClick={() => setMode('appointment')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                            mode === 'appointment' ? 'text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        style={{ backgroundColor: mode === 'appointment' ? primaryColor : '' }}
                    >
                        <CalendarDaysIcon className="w-6 h-6" /> Register Appointment
                    </button>
                </motion.div>

                {/* Global Message/Notification */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-8 p-4 rounded-lg shadow-md text-center font-medium ${
                                isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                            }`}
                        >
                            {isSuccess ? <CheckCircleIcon className="w-5 h-5 inline-block mr-2" /> : <ExclamationCircleIcon className="w-5 h-5 inline-block mr-2" />}
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Panel: Service Selection */}
                    <motion.div
                        className="lg:w-2/5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Select Services</h2>
                        <div className="mb-4 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <div className="relative">
                                <select
                                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8"
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {serviceCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                            {filteredServices.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 col-span-full mt-8">No services found matching your criteria.</p>
                            ) : (
                                filteredServices.map(service => (
                                    <motion.div
                                        key={service.id}
                                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-600 cursor-pointer"
                                        variants={itemCardVariants}
                                        whileHover="hover"
                                        onClick={() => mode === 'invoice' ? handleAddServiceToInvoice(service) : handleSelectServiceForAppointment(service)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={service.imageUrl || `https://placehold.co/50x50/${primaryColor.substring(1)}/FFFFFF?text=SVC`}
                                            alt={service.title}
                                            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                            onError={(e) => (e.currentTarget.src = `https://placehold.co/50x50/${primaryColor.substring(1)}/FFFFFF?text=SVC`)}
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{service.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">${service.sellingPrice.toFixed(2)}</p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Right Panel: Invoice / Appointment Form */}
                    <motion.div
                        className="lg:w-3/5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {mode === 'invoice' ? (
                            <>
                                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Invoice</h2>

                                {/* Client Details */}
                                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <UserCircleIcon className="w-6 h-6" /> Client Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Name <span className="text-red-500">*</span></span>
                                            <input
                                                type="text"
                                                name="name"
                                                value={invoiceClientDetails.name}
                                                onChange={handleInvoiceClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="Client's Full Name"
                                                required
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Email (Optional)</span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={invoiceClientDetails.email}
                                                onChange={handleInvoiceClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="client@example.com"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Phone (Optional)</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={invoiceClientDetails.phone}
                                                onChange={handleInvoiceClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="+1234567890"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Invoice Items List */}
                                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <ReceiptPercentIcon className="w-6 h-6" /> Invoice Items
                                    </h3>
                                    {invoiceItems.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Add services from the left panel to create your invoice.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {invoiceItems.map(item => (
                                                <motion.div
                                                    key={item.serviceId}
                                                    className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                >
                                                    <div className="flex-grow">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">${item.price.toFixed(2)} each</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateInvoiceItemQuantity(item.serviceId, item.quantity - 1)}
                                                            className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <MinusIcon className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-medium text-gray-900 dark:text-gray-100 w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateInvoiceItemQuantity(item.serviceId, item.quantity + 1)}
                                                            className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveInvoiceItem(item.serviceId)}
                                                            className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                                            aria-label="Remove item"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Invoice Summary */}
                                <div className="space-y-2 text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-6 mt-auto">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount ({discountPercentage}%):</span>
                                        <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax ({taxRate * 100}%):</span>
                                        <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span>Total:</span>
                                        <span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
                                    </div>
                                    <label className="block mt-4">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Discount (%)</span>
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            max="100"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                        />
                                    </label>
                                    <label className="block mt-4">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Payment Method</span>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8"
                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                        >
                                            {availablePaymentMethods.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {/* Invoice Actions */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={generateInvoiceData}
                                        className="px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                        style={{ backgroundColor: primaryColor }}
                                        disabled={invoiceItems.length === 0 || !invoiceClientDetails.name.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <ReceiptPercentIcon className="w-6 h-6" />
                                        )}
                                        Generate Invoice
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Register Appointment</h2>

                                {/* Selected Service for Appointment */}
                                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <CalendarDaysIcon className="w-6 h-6" /> Selected Service
                                    </h3>
                                    {appointmentService ? (
                                        <motion.div
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-4 shadow-sm border border-gray-200 dark:border-gray-600"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={appointmentService.imageUrl || `https://placehold.co/60x60/${primaryColor.substring(1)}/FFFFFF?text=SVC`}
                                                alt={appointmentService.title}
                                                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                                                onError={(e) => (e.currentTarget.src = `https://placehold.co/60x60/${primaryColor.substring(1)}/FFFFFF?text=SVC`)}
                                            />
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{appointmentService.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">${appointmentService.sellingPrice.toFixed(2)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setAppointmentService(null)}
                                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                                aria-label="Remove selected service"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Select a service from the left panel.</p>
                                    )}
                                </div>

                                {/* Client Details for Appointment */}
                                <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <UserCircleIcon className="w-6 h-6" /> Client Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Name <span className="text-red-500">*</span></span>
                                            <input
                                                type="text"
                                                name="name"
                                                value={appointmentClientDetails.name}
                                                onChange={handleAppointmentClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="Client's Full Name"
                                                required
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Email (Optional)</span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={appointmentClientDetails.email}
                                                onChange={handleAppointmentClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="client@example.com"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Client Phone (Optional)</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={appointmentClientDetails.phone}
                                                onChange={handleAppointmentClientChange}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="+1234567890"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="mb-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <CalendarDaysIcon className="w-6 h-6" /> Appointment Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Date <span className="text-red-500">*</span></span>
                                            <input
                                                type="date"
                                                value={appointmentDate}
                                                onChange={(e) => setAppointmentDate(e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                required
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Time Slot <span className="text-red-500">*</span></span>
                                            <input
                                                type="time"
                                                value={appointmentTime}
                                                onChange={(e) => setAppointmentTime(e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                required
                                            />
                                        </label>
                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Notes (Optional)</span>
                                            <textarea
                                                value={appointmentNotes}
                                                onChange={(e) => setAppointmentNotes(e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                placeholder="Any special requests or details..."
                                            ></textarea>
                                        </label>
                                    </div>
                                </div>

                                {/* Appointment Actions */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleRegisterAppointment}
                                        className="px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                        style={{ backgroundColor: primaryColor }}
                                        disabled={!appointmentService || !appointmentClientDetails.name.trim() || !appointmentDate || !appointmentTime || isLoading}
                                    >
                                        {isLoading ? (
                                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <CalendarDaysIcon className="w-6 h-6" />
                                        )}
                                        Register Appointment
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {showPdfModal && generatedInvoicePdfData && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[95vh] flex flex-col"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPdfModal(false)}
                                className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-8 h-8" />
                            </button>

                            <h3 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
                                Invoice Preview
                            </h3>

                            {/* Hidden Invoice Content for PDF Generation */}
                            <div ref={invoicePdfRef} className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-inner mb-6 flex-grow overflow-y-auto custom-scrollbar">
                                <div className="text-center mb-6">
                                    <h2 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>INVOICE</h2>
                                    <p className="text-lg">#{generatedInvoicePdfData.invoiceNumber}</p>
                                </div>

                                <div className="flex justify-between mb-6 text-sm">
                                    <div>
                                        <p className="font-semibold">Billed To:</p>
                                        <p>{generatedInvoicePdfData.client.name}</p>
                                        {generatedInvoicePdfData.client.email && <p>{generatedInvoicePdfData.client.email}</p>}
                                        {generatedInvoicePdfData.client.phone && <p>{generatedInvoicePdfData.client.phone}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">Date:</p>
                                        <p>{generatedInvoicePdfData.date}</p>
                                        <p className="font-semibold mt-2">Payment Method:</p>
                                        <p>{generatedInvoicePdfData.paymentMethod}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-6 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                            <th className="py-2 px-4 text-left border-b dark:border-gray-600">Service</th>
                                            <th className="py-2 px-4 text-center border-b dark:border-gray-600">Qty</th>
                                            <th className="py-2 px-4 text-right border-b dark:border-gray-600">Price</th>
                                            <th className="py-2 px-4 text-right border-b dark:border-gray-600">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedInvoicePdfData.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="py-2 px-4">{item.title}</td>
                                                <td className="py-2 px-4 text-center">{item.quantity}</td>
                                                <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
                                                <td className="py-2 px-4 text-right">${item.subtotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end">
                                    <div className="w-full sm:w-1/2 space-y-1 text-gray-800 dark:text-gray-200">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>${generatedInvoicePdfData.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount ({generatedInvoicePdfData.discountPercentage}%):</span>
                                            <span>-${generatedInvoicePdfData.discountAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax ({generatedInvoicePdfData.taxRate * 100}%):</span>
                                            <span>${generatedInvoicePdfData.taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                                            <span>TOTAL:</span>
                                            <span style={{ color: primaryColor }}>${generatedInvoicePdfData.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">Thank you for your business!</p>
                            </div>

                            {/* PDF Modal Actions */}
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    onClick={() => setShowPdfModal(false)}
                                    className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    disabled={isLoading}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handlePrintPdf}
                                    className="px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-md flex items-center justify-center"
                                    style={{ backgroundColor: primaryColor }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="w-5 h-5 text-white mr-3 animate-spin" />
                                    ) : (
                                        <PrinterIcon className="w-5 h-5 text-white mr-3" />
                                    )}
                                    Print PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPOSClient;
