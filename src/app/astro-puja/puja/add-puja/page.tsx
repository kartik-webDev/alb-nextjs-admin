'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

// Types
interface Category {
    _id: string;
    categoryName: string;
}

interface BulletPoint {
    heading: string;
    bulletPoint: string[];
}

interface InputFieldDetail {
    categoryId: string;
    pujaName: string;
    pujaPrice: string;
    pujaCommissionPrice: string;
}

interface InputFieldError {
    categoryId?: string;
    pujaName?: string;
    pujaPrice?: string;
    pujaCommissionPrice?: string;
    image?: string;
}

interface ImageState {
    file: string;
    bytes: File | null;
}

interface PujaData {
    _id: string;
    categoryId?: Category;
    pujaName: string;
    price: number;
    adminCommission: number;
    image: string;
    about?: BulletPoint[];
}

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const IMG_URL = process.env.NEXT_PUBLIC_IMG_URL || '';

// Regex patterns
const Regex_Accept_Alpha = /^[a-zA-Z\s]+$/;
const Regex_Accept_Number = /^\d+(\.\d+)?$/;

// API Functions
const getPujaCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch(`${API_URL}/api/puja/get_puja_category`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

const createPuja = async (formData: FormData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/puja/create_puja`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to create puja');
        return true;
    } catch (error) {
        console.error('Error creating puja:', error);
        return false;
    }
};

const updatePuja = async (formData: FormData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/puja/update_puja`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to update puja');
        return true;
    } catch (error) {
        console.error('Error updating puja:', error);
        return false;
    }
};

// Main Component Content
const AddPujaContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const mode = editId ? 'Edit' : 'Add';

    // State Management
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [inputFieldDetail, setInputFieldDetail] = useState<InputFieldDetail>({
        categoryId: '',
        pujaName: '',
        pujaPrice: '',
        pujaCommissionPrice: ''
    });
    const [inputFieldError, setInputFieldError] = useState<InputFieldError>({});
    const [image, setImage] = useState<ImageState>({ file: '', bytes: null });
    const [sections, setSections] = useState<BulletPoint[]>([
        { heading: '', bulletPoint: [''] }
    ]);

    // Handle Input Field Error
    const handleInputFieldError = (input: keyof InputFieldError, value: string | undefined): void => {
        setInputFieldError((prev) => ({ ...prev, [input]: value }));
    };

    // Handle Input Field Data
    const handleInputField = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = event.target;
        setInputFieldDetail({ ...inputFieldDetail, [name]: value });
    };

    // Handle Image Upload (Normal)
    const handleImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            setImage({
                file: URL.createObjectURL(e.target.files[0]),
                bytes: e.target.files[0],
            });
            handleInputFieldError("image", undefined);
        }
    };

    // Handle Image Upload (Drop)
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>): void => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setImage({
                file: URL.createObjectURL(e.dataTransfer.files[0]),
                bytes: e.dataTransfer.files[0],
            });
            handleInputFieldError("image", undefined);
        }
    };

    // Dynamic Section Handlers
    const handleAddNewSection = (): void => {
        setSections([...sections, { heading: '', bulletPoint: [''] }]);
    };

    const handleSectionHeading = (index: number, event: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = event.target;
        const updatedSection = [...sections];
        updatedSection[index] = { ...updatedSection[index], heading: value };
        setSections(updatedSection);
    };

    const handleChangeBulletPoint = (
        sectionIndex: number,
        bulletIndex: number,
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const updatedSection = [...sections];
        updatedSection[sectionIndex].bulletPoint[bulletIndex] = event.target.value;
        setSections(updatedSection);
    };

    const handleAddBulletPoint = (sectionIndex: number): void => {
        const updatedSection = [...sections];
        updatedSection[sectionIndex].bulletPoint.push('');
        setSections(updatedSection);
    };

    const handleRemoveBulletPoint = (sectionIndex: number, bulletIndex: number): void => {
        const updatedSection = [...sections];
        if (bulletIndex !== 0) {
            updatedSection[sectionIndex].bulletPoint.splice(bulletIndex, 1);
            setSections(updatedSection);
        }
    };

    // Validation
    const handleValidation = (): boolean => {
        let isValid = true;
        const { categoryId, pujaName, pujaPrice, pujaCommissionPrice } = inputFieldDetail;

        if (!categoryId) {
            handleInputFieldError("categoryId", "Please Select Category");
            isValid = false;
        }
        if (!pujaName) {
            handleInputFieldError("pujaName", "Please Enter Puja Name");
            isValid = false;
        } else if (!Regex_Accept_Alpha.test(pujaName)) {
            handleInputFieldError("pujaName", "Please Enter Valid Puja Name (Only alphabets)");
            isValid = false;
        }

        if (!pujaPrice) {
            handleInputFieldError("pujaPrice", "Please Enter Puja Price");
            isValid = false;
        } else if (parseFloat(pujaPrice) <= 0) {
            handleInputFieldError("pujaPrice", "Please Enter Valid Puja Price (Greater Than 0)");
            isValid = false;
        } else if (!Regex_Accept_Number.test(pujaPrice)) {
            handleInputFieldError("pujaPrice", "Please Enter Valid Puja Price");
            isValid = false;
        }

        if (!pujaCommissionPrice) {
            handleInputFieldError("pujaCommissionPrice", "Please Enter Puja Commission Price");
            isValid = false;
        } else if (parseFloat(pujaCommissionPrice) <= 0) {
            handleInputFieldError("pujaCommissionPrice", "Please Enter Valid Commission Price (Greater Than 0)");
            isValid = false;
        } else if (!Regex_Accept_Number.test(pujaCommissionPrice)) {
            handleInputFieldError("pujaCommissionPrice", "Please Enter Valid Commission Price");
            isValid = false;
        }

        if (!image.file) {
            handleInputFieldError("image", "Please Select Image");
            isValid = false;
        }

        return isValid;
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (handleValidation()) {
            const { categoryId, pujaName, pujaPrice, pujaCommissionPrice } = inputFieldDetail;
            const formData = new FormData();

            if (editId) {
                formData.append("pujaId", editId);
            }

            formData.append("categoryId", categoryId);
            formData.append("pujaName", pujaName);
            formData.append("price", pujaPrice);
            formData.append("adminCommission", pujaCommissionPrice);
            formData.append("about", JSON.stringify(sections.filter(value => value.heading !== '')));
            
            if (image.bytes) {
                formData.append("image", image.bytes);
            }

            const success = editId ? await updatePuja(formData) : await createPuja(formData);

            if (success) {
                Swal.fire({
                    icon: 'success',
                    title: `Puja ${editId ? 'Updated' : 'Created'} Successfully`,
                    showConfirmButton: false,
                    timer: 1500
                });
                router.push('/astro-puja/puja');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Failed to ${editId ? 'update' : 'create'} puja`,
                });
            }
        }
    };

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Fetch categories
            const categoriesData = await getPujaCategories();
            setCategories(categoriesData);

            // If editing, get data from localStorage
            if (editId) {
                const storedData = localStorage.getItem('editPujaData');
                if (storedData) {
                    const pujaData: PujaData = JSON.parse(storedData);
                    
                    setInputFieldDetail({
                        categoryId: pujaData.categoryId?._id || '',
                        pujaName: pujaData.pujaName || '',
                        pujaPrice: pujaData.price?.toString() || '',
                        pujaCommissionPrice: pujaData.adminCommission?.toString() || ''
                    });

                    setImage({
                        file: pujaData.image ? `${IMG_URL}${pujaData.image}` : '',
                        bytes: null
                    });

                    setSections(pujaData.about || [{ heading: '', bulletPoint: [''] }]);
                    
                    // Clear localStorage after loading
                    localStorage.removeItem('editPujaData');
                }
            }

            setLoading(false);
        };

        fetchData();
    }, [editId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-white mb-5 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-8">
                <div className="text-2xl font-medium text-black">{mode} Puja</div>
                <button
                    onClick={() => router.push("/astro-puja/puja")}
                    className="font-medium bg-red-500 text-white px-4 py-2 rounded cursor-pointer text-sm hover:bg-blue-700 transition"
                >
                    Display
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    {/* Image Upload */}
                    <div>
                        <div className="border border-gray-300 rounded">
                            {image.file ? (
                                <label
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    htmlFor="upload-image"
                                    className="flex flex-col items-center p-5 cursor-pointer"
                                >
                                    <div className="relative w-full h-[300px]">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL3}${image.file}`}
                                            alt="Puja"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </label>
                            ) : (
                                <label
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    htmlFor="upload-image"
                                    className="flex flex-col gap-5 items-center py-24 cursor-pointer"
                                >
                                    <svg width="80" height="80" viewBox="0 0 80 80" fill="#C4C4C4">
                                        <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 72c-17.7 0-32-14.3-32-32S22.3 8 40 8s32 14.3 32 32-14.3 32-32 32z"/>
                                        <path d="M56 36H44V24c0-2.2-1.8-4-4-4s-4 1.8-4 4v12H24c-2.2 0-4 1.8-4 4s1.8 4 4 4h12v12c0 2.2 1.8 4 4 4s4-1.8 4-4V44h12c2.2 0 4-1.8 4-4s-1.8-4-4-4z"/>
                                    </svg>
                                    <div className="font-semibold text-lg">Choose Your Image to Upload</div>
                                    <div className="font-medium text-base text-gray-500">Or Drop Your Image Here</div>
                                </label>
                            )}
                            <input
                                id="upload-image"
                                onChange={handleImage}
                                hidden
                                accept="image/*"
                                type="file"
                            />
                        </div>
                        {inputFieldError.image && (
                            <div className="text-red-600 text-xs mt-1 px-3 font-medium">
                                {inputFieldError.image}
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Category Name <span className="text-red-600">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={inputFieldDetail.categoryId}
                                onChange={handleInputField}
                                onFocus={() => handleInputFieldError("categoryId", undefined)}
                                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    inputFieldError.categoryId ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">---Select Category Name---</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            {inputFieldError.categoryId && (
                                <div className="text-red-600 text-xs mt-1">{inputFieldError.categoryId}</div>
                            )}
                        </div>

                        {/* Puja Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puja Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="pujaName"
                                value={inputFieldDetail.pujaName}
                                onChange={handleInputField}
                                onFocus={() => handleInputFieldError("pujaName", undefined)}
                                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    inputFieldError.pujaName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {inputFieldError.pujaName && (
                                <div className="text-red-600 text-xs mt-1">{inputFieldError.pujaName}</div>
                            )}
                        </div>

                        {/* Puja Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puja Price <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="pujaPrice"
                                value={inputFieldDetail.pujaPrice}
                                onChange={handleInputField}
                                onFocus={() => handleInputFieldError("pujaPrice", undefined)}
                                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    inputFieldError.pujaPrice ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {inputFieldError.pujaPrice && (
                                <div className="text-red-600 text-xs mt-1">{inputFieldError.pujaPrice}</div>
                            )}
                        </div>

                        {/* Commission Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puja Commission Price (%) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="pujaCommissionPrice"
                                value={inputFieldDetail.pujaCommissionPrice}
                                onChange={handleInputField}
                                onFocus={() => handleInputFieldError("pujaCommissionPrice", undefined)}
                                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    inputFieldError.pujaCommissionPrice ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {inputFieldError.pujaCommissionPrice && (
                                <div className="text-red-600 text-xs mt-1">{inputFieldError.pujaCommissionPrice}</div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border border-gray-200 p-4 rounded-md">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heading
                                </label>
                                <input
                                    type="text"
                                    name="heading"
                                    value={section.heading}
                                    onChange={(e) => handleSectionHeading(sectionIndex, e)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.bulletPoint.map((bullet, bulletIndex) => (
                                    <div key={bulletIndex} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bullet {bulletIndex + 1}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={bullet}
                                                onChange={(e) => handleChangeBulletPoint(sectionIndex, bulletIndex, e)}
                                                className="w-full px-3 py-3 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                                {bulletIndex === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddBulletPoint(sectionIndex)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBulletPoint(sectionIndex, bulletIndex)}
                                                    className={bulletIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}
                                                    disabled={bulletIndex === 0}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            className="font-medium bg-red-500 text-white px-4 py-2 rounded cursor-pointer text-base hover:bg-blue-700 transition"
                        >
                            Submit
                        </button>

                        <button
                            type="button"
                            onClick={handleAddNewSection}
                            className="font-medium bg-red-500 text-white px-4 py-2 rounded cursor-pointer text-base hover:bg-blue-700 transition"
                        >
                            Add New Section
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Main Component with Suspense Boundary
const AddPuja: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        }>
            <AddPujaContent />
        </Suspense>
    );
};

export default AddPuja;